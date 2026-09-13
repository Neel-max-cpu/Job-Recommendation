import {
  DEFAULT_WEIGHTS,
  ScoringWeights,
} from "../model/scoreModel/ScoringWeights.js";

export const getWeightsFromQuery = (
  query: Record<string, unknown>
): ScoringWeights => {
  const weights: ScoringWeights = {
    skills: parseWeight(query.skillsWeight, DEFAULT_WEIGHTS.skills),
    experience: parseWeight(query.experienceWeight, DEFAULT_WEIGHTS.experience),
    location: parseWeight(query.locationWeight, DEFAULT_WEIGHTS.location),
    salary: parseWeight(query.salaryWeight, DEFAULT_WEIGHTS.salary),
  };

  const total =
    weights.skills + weights.experience + weights.location + weights.salary;

  if (total !== 100) {
    throw new Error("Scoring weights must add up to 100");
  }

  return weights;
};

const parseWeight = (value: unknown, defaultValue: number): number => {
  if (value === undefined) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Scoring weights must be valid non-negative numbers");
  }

  return parsed;
};
