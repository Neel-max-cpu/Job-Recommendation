import { SkillType } from "@prisma/client";
export { SkillType };

export interface JobSkill {
  id: number;
  skill: string;
  type: SkillType;
  jobId: number;
}
