import { JobSkill } from "./JobSkills.js";

export interface SalaryRange {
  min: number;
  max: number;
}

export interface Job {
  id: number;
  title: string;
  minYearsExperience: number;
  location: string;
  salaryRange: SalaryRange;
  remoteAllowed: boolean;
  requiredSkills: JobSkill[];
}
