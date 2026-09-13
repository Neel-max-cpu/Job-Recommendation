import { SkillType } from "../jobModel/JobSkills.js";


export interface CreateJobRequest {
  title: string;
  requiredSkills: {
    skill: string;
    type: SkillType;
  }[];
  minYearsExperience: number;
  location: string;
  salaryRange: {
    min: number;
    max: number;
  };
  remoteAllowed: boolean;
}