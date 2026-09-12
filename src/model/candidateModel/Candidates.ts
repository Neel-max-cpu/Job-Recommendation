import { CandidateSkill } from "./CandidateSkills.js";

export interface Candidate {
  id: number;
  name: string;
  yearsOfExperience: number;
  location: string;
  expectedSalary: number;
  skills: CandidateSkill[];
}
