import prisma from "../lib/prisma.js";
import { scoreJob } from "./scoringService.js";
import {
  DEFAULT_WEIGHTS,
  ScoringWeights,
} from "../model/scoreModel/ScoringWeights.js";

export const getJobRecommendations = async (
  jobId: number,
  limit?: number,
  weights: ScoringWeights = DEFAULT_WEIGHTS
) => {
  // 1. Get the job with required skills
  const job = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
    include: {
      requiredSkills: true,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  // 2. Get all candidates with their skills
  const candidates = await prisma.candidate.findMany({
    include: {
      skills: true,
    },
  });

  // 3. Score every candidate against this job
  const recommendations = candidates
    .map((candidate) => {
      const result = scoreJob(
        candidate,
        {
          id: job.id,
          title: job.title,
          minYearsExperience: job.minYearsExperience,
          location: job.location,
          salaryRange: {
            min: job.salaryMin,
            max: job.salaryMax,
          },
          remoteAllowed: job.remoteAllowed,
          requiredSkills: job.requiredSkills,
        },
        weights
      );

      if (!result) {
        return null;
      }

      return {
        candidate: {
          id: candidate.id,
          name: candidate.name,
          yearsOfExperience: candidate.yearsOfExperience,
          location: candidate.location,
          expectedSalary: candidate.expectedSalary,
        },
        score: result.score,
        breakdown: result.breakdown,
      };
    })
    .filter((recommendation) => recommendation !== null)
    .sort((a, b) => b.score - a.score);

  const limitedRecommendations =
    limit !== undefined ? recommendations.slice(0, limit) : recommendations;

  return {
    job: {
      id: job.id,
      title: job.title,
    },
    recommendations: limitedRecommendations,
  };
};
