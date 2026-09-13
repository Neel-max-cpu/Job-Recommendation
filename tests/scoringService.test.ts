import { describe, expect, it } from "vitest";
import { Candidate } from "../src/model/candidateModel/Candidates.js";
import { Job } from "../src/model/jobModel/Jobs.js";
import { SkillType } from "../src/model/jobModel/JobSkills.js";

import { scoreJob } from "../src/services/scoringService.js";

const defaultCandidate: Candidate = {
  id: 1,
  name: "Neel",
  yearsOfExperience: 2,
  location: "Gurugram",
  expectedSalary: 8,
  skills: [
    {
      id: 1,
      skill: "Java",
      candidateId: 1,
    },
  ],
};

const defaultJob: Job = {
  id: 1,
  title: "Java Developer",
  minYearsExperience: 2,
  location: "Gurugram",
  salaryRange: {
    min: 7,
    max: 12,
  },
  remoteAllowed: false,
  requiredSkills: [
    {
      id: 1,
      skill: "Java",
      type: SkillType.MUST_HAVE,
      jobId: 1,
    },
  ],
};

describe("scoreJob", () => {
  it("should not recommend a job when a must-have skill is missing", () => {
    const candidate: Candidate = {
      id: 1,
      name: "Neel",
      yearsOfExperience: 1.5,
      location: "Gurugram",
      expectedSalary: 8,
      skills: [
        {
          id: 1,
          skill: "Java",
          candidateId: 1,
        },
      ],
    };

    const job: Job = {
      id: 1,
      title: "Java Software Engineer",
      minYearsExperience: 2,
      location: "Gurugram",
      salaryRange: {
        min: 7,
        max: 12,
      },
      remoteAllowed: true,
      requiredSkills: [
        {
          id: 1,
          skill: "Java",
          type: SkillType.MUST_HAVE,
          jobId: 1,
        },
        {
          id: 2,
          skill: "Spring Boot",
          type: SkillType.MUST_HAVE,
          jobId: 1,
        },
      ],
    };

    const result = scoreJob(candidate, job);

    expect(result).toBeNull();
  });

  it("should calculate the expected score for a valid job", () => {
    const candidate: Candidate = {
      id: 1,
      name: "Neel",
      yearsOfExperience: 1.5,
      location: "Gurugram",
      expectedSalary: 8,
      skills: [
        {
          id: 1,
          skill: "Java",
          candidateId: 1,
        },
        {
          id: 2,
          skill: "Spring Boot",
          candidateId: 1,
        },
      ],
    };

    const job: Job = {
      id: 1,
      title: "Java Software Engineer",
      minYearsExperience: 2,
      location: "Gurugram",
      salaryRange: {
        min: 7,
        max: 12,
      },
      remoteAllowed: true,
      requiredSkills: [
        {
          id: 1,
          skill: "Java",
          type: SkillType.MUST_HAVE,
          jobId: 1,
        },
        {
          id: 2,
          skill: "Spring Boot",
          type: SkillType.MUST_HAVE,
          jobId: 1,
        },
        {
          id: 3,
          skill: "Docker",
          type: SkillType.NICE_TO_HAVE,
          jobId: 1,
        },
      ],
    };

    const result = scoreJob(candidate, job);

    expect(result).not.toBeNull();

    expect(result?.score).toBe(82);

    expect(result?.breakdown).toEqual({
      skills: 40,
      experience: 15,
      location: 15,
      salary: 12,
    });
  });

  it("should cap experience score when candidate exceeds required experience", () => {
    const candidate: Candidate = {
      ...defaultCandidate,
      yearsOfExperience: 5,
    };

    const result = scoreJob(candidate, defaultJob);

    expect(result?.breakdown.experience).toBe(20);
  });

  it("should treat location matching as case-insensitive", () => {
    const candidate: Candidate = {
      ...defaultCandidate,
      location: "gurugram",
    };

    const result = scoreJob(candidate, defaultJob);

    expect(result?.breakdown.location).toBe(15);
  });

  it("should award partial points for nice-to-have skills", () => {
    const candidate: Candidate = {
      ...defaultCandidate,
      skills: [
        {
          id: 1,
          skill: "Java",
          candidateId: 1,
        },
        {
          id: 2,
          skill: "Docker",
          candidateId: 1,
        },
      ],
    };

    const job: Job = {
      ...defaultJob,
      requiredSkills: [
        {
          id: 1,
          skill: "Java",
          type: SkillType.MUST_HAVE,
          jobId: 1,
        },
        {
          id: 2,
          skill: "Docker",
          type: SkillType.NICE_TO_HAVE,
          jobId: 1,
        },
        {
          id: 3,
          skill: "Kubernetes",
          type: SkillType.NICE_TO_HAVE,
          jobId: 1,
        },
      ],
    };

    const result = scoreJob(candidate, job);

    expect(result?.breakdown.skills).toBe(45);
  });

  it("should give full salary score when job range is above expectation", () => {
    const candidate: Candidate = {
      ...defaultCandidate,
      expectedSalary: 8,
    };

    const job: Job = {
      ...defaultJob,
      salaryRange: {
        min: 10,
        max: 15,
      },
    };

    const result = scoreJob(candidate, job);

    expect(result?.breakdown.salary).toBe(15);
  });

  it("should give zero salary score when job maximum is below expectation", () => {
    const candidate: Candidate = {
      ...defaultCandidate,
      expectedSalary: 10,
    };

    const job: Job = {
      ...defaultJob,
      salaryRange: {
        min: 5,
        max: 8,
      },
    };

    const result = scoreJob(candidate, job);

    expect(result?.breakdown.salary).toBe(0);
  });

  it("should award remote location score when locations differ", () => {
    const candidate: Candidate = {
      ...defaultCandidate,
      location: "Gurugram",
    };

    const job: Job = {
      ...defaultJob,
      location: "Bangalore",
      remoteAllowed: true,
    };

    const result = scoreJob(candidate, job);

    expect(result?.breakdown.location).toBe(10);
  });

  it("should give full skill score when there are no nice-to-have skills", () => {
    const result = scoreJob(defaultCandidate, defaultJob);

    expect(result?.breakdown.skills).toBe(50);
  });

  it("should return zero salary score when expected salary is above job maximum", () => {
    const result = scoreJob(defaultCandidate, {
      ...defaultJob,
      salaryRange: {
        min: 7,
        max: 8,
      },
    });

    expect(result?.breakdown.salary).toBe(0);
  });

  it("should give full salary score when expected salary equals job minimum", () => {
    const result = scoreJob(defaultCandidate, {
      ...defaultJob,
      salaryRange: {
        min: 8,
        max: 12,
      },
    });

    expect(result?.breakdown.salary).toBe(15);
  });

  it("should give partial experience score when candidate is below requirement", () => {
    const result = scoreJob(defaultCandidate, {
      ...defaultJob,
      minYearsExperience: 3,
    });

    expect(result?.breakdown.experience).toBe(13.33);
  });

  it("should recommend a job when nice-to-have skills are missing", () => {
    const result = scoreJob(defaultCandidate, {
      ...defaultJob,
      requiredSkills: [
        {
          id: 1,
          skill: "Java",
          type: SkillType.MUST_HAVE,
          jobId: 1,
        },
        {
          id: 2,
          skill: "Kubernetes",
          type: SkillType.NICE_TO_HAVE,
          jobId: 1,
        },
      ],
    });

    expect(result).not.toBeNull();
  });
});
