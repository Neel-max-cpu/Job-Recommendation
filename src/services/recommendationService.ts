import prisma from "../lib/prisma.js";
import {
  DEFAULT_WEIGHTS,
  ScoringWeights,
} from "../model/scoreModel/ScoringWeights.js";
import { scoreJob } from "./scoringService.js";

export const getRecommendations = async (
  candidateId: number,
  limit?: number,
  weights: ScoringWeights = DEFAULT_WEIGHTS
) => {
  // 1. Get candidate with their skills
  const candidate = await prisma.candidate.findUnique({
    where: {
      id: candidateId,
    },
    include: {
      skills: true,
    },
  });

  if (!candidate) {
    throw new Error("Candidate not found");
  }

  // 2. Get all jobs with their required skills
  const jobs = await prisma.job.findMany({
    include: {
      requiredSkills: true,
    },
  });

  // 3. Score eligible jobs
  const recommendations = jobs
    .map((job) => {
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
        job,
        score: result.score,
        breakdown: result.breakdown,
      };
    })
    .filter((recommendation) => recommendation !== null)
    .sort((a, b) => b.score - a.score);

  // 4. Apply limit after sorting
  const limitedRecommendations =
    limit !== undefined ? recommendations.slice(0, limit) : recommendations;

  return {
    candidate: {
      id: candidate.id,
      name: candidate.name,
    },
    recommendations: limitedRecommendations,
  };
};
