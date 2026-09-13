/*
breaking account for scoring the weightage 
(total - 100) : skills - 50, experience - 20, location - 15, salary - 15;

- breakDown:
skill - must-have skills(40), Nice-to-have(10); missing even one must-have skill means - Do not recommend
experience - max cap to 20(if more experience is there)
location - Exact location-15, Remote job-10, Location mismatch-0

*/

import { Candidate } from "../model/candidateModel/Candidates.js";
import { Job } from "../model/jobModel/Jobs.js";
import { SkillType } from "../model/jobModel/JobSkills.js";
import { ScoringResult } from "../model/scoreModel/ScoringResult.js";
import {
  DEFAULT_WEIGHTS,
  ScoringWeights,
} from "../model/scoreModel/ScoringWeights.js";

const normalize = (value: string) => value.trim().toLowerCase();

const round = (value: number) => Math.round(value * 100) / 100;

export const scoreJob = (
  candidate: Candidate,
  job: Job,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): ScoringResult | null => {
  // 1. SKILLS
  const candidateSkills = new Set(
    candidate.skills.map((skill) => normalize(skill.skill))
  );

  const mustHaveSkills = job.requiredSkills.filter(
    (skill) => skill.type === SkillType.MUST_HAVE
  );

  const niceToHaveSkills = job.requiredSkills.filter(
    (skill) => skill.type === SkillType.NICE_TO_HAVE
  );

  // Hard filter: candidate must have every must-have skill
  const hasAllMustHave = mustHaveSkills.every((item) =>
    candidateSkills.has(normalize(item.skill))
  );

  if (!hasAllMustHave) {
    // doest have all must have - doest qualify
    return null;
  }

  // 80% of skill weight = must-have
  // 20% of skill weight = nice-to-have
  const mustHaveScore = weights.skills * 0.8;
  let niceToHaveScore = weights.skills * 0.2;

  if (niceToHaveSkills.length > 0) {
    const matchedNiceToHave = niceToHaveSkills.filter((item) =>
      candidateSkills.has(normalize(item.skill))
    ).length;

    niceToHaveScore =
      (matchedNiceToHave / niceToHaveSkills.length) * (weights.skills * 0.2);
  }
  const skillScore = mustHaveScore + niceToHaveScore;

  // 2. EXPERIENCE
  let experienceScore: number;

  if (job.minYearsExperience <= 0) {
    experienceScore = weights.experience;
  } else {
    experienceScore =
      Math.min(candidate.yearsOfExperience / job.minYearsExperience, 1) *
      weights.experience;
  }

  //3. LOCATION
  const candidateLocation = normalize(candidate.location);
  const jobLocation = normalize(job.location);
  let locationScore: number;
  if (candidateLocation === jobLocation) {
    locationScore = weights.location;
  } else if (job.remoteAllowed) {
    locationScore = weights.location * (2 / 3);
  } else {
    locationScore = 0;
  }

  //4. SALARY
  let salaryScore: number;
  const salaryMin = job.salaryRange.min;
  const salaryMax = job.salaryRange.max;

  if (salaryMax < candidate.expectedSalary) {
    salaryScore = 0;
  } else if (candidate.expectedSalary <= salaryMin) {
    salaryScore = weights.salary;
  } else if (salaryMax === salaryMin) {
    salaryScore = 0;
  } else {
    salaryScore =
      ((salaryMax - candidate.expectedSalary) / (salaryMax - salaryMin)) *
      weights.salary;
  }

  // TOTAL
  const totalScore = skillScore + experienceScore + locationScore + salaryScore;

  return {
    score: round(Math.min(Math.max(totalScore, 0), 100)),

    breakdown: {
      skills: round(skillScore),
      experience: round(experienceScore),
      location: round(locationScore),
      salary: round(salaryScore),
    },
  };
};
