import { CreateCandidateRequest } from "../model/dtos/CreateCandidateRequest.js";
import { CreateJobRequest } from "../model/dtos/CreateJobRequest.js";

export const validateCandidate = (
  data: CreateCandidateRequest
): string | null => {
  if (!data.name || typeof data.name !== "string") {
    return "Name is required";
  }

  if (
    !Array.isArray(data.skills) ||
    data.skills.length === 0 ||
    data.skills.some(
      (skill) => typeof skill !== "string" || skill.trim() === ""
    )
  ) {
    return "At least one valid skill is required";
  }

  if (
    typeof data.yearsOfExperience !== "number" ||
    data.yearsOfExperience < 0
  ) {
    return "Years of experience must be a non-negative number";
  }

  if (!data.location || typeof data.location !== "string") {
    return "Location is required";
  }

  if (typeof data.expectedSalary !== "number" || data.expectedSalary < 0) {
    return "Expected salary must be a non-negative number";
  }

  return null;
};

export const validateJob = (data: CreateJobRequest): string | null => {
  if (!data.title || typeof data.title !== "string") {
    return "Job title is required";
  }

  if (!Array.isArray(data.requiredSkills) || data.requiredSkills.length === 0) {
    return "At least one required skill is needed";
  }

  if (
    data.requiredSkills.some(
      (skill) => !skill.skill || typeof skill.skill !== "string" || !skill.type
    )
  ) {
    return "Each required skill must have a skill name and type";
  }

  if (
    typeof data.minYearsExperience !== "number" ||
    data.minYearsExperience < 0
  ) {
    return "Minimum experience must be a non-negative number";
  }

  if (!data.location || typeof data.location !== "string") {
    return "Location is required";
  }

  if (
    typeof data.salaryRange?.min !== "number" ||
    typeof data.salaryRange?.max !== "number"
  ) {
    return "Salary range must contain numeric min and max values";
  }

  if (
    data.salaryRange.min < 0 ||
    data.salaryRange.max < 0 ||
    data.salaryRange.min > data.salaryRange.max
  ) {
    return "Salary range is invalid";
  }

  if (typeof data.remoteAllowed !== "boolean") {
    return "remoteAllowed must be a boolean";
  }

  return null;
};
