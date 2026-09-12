export enum SkillType {
  MUST_HAVE = "MUST_HAVE",
  NICE_TO_HAVE = "NICE_TO_HAVE",
}

export interface JobSkill {
  id: number;
  skill: string;
  type: SkillType;
  jobId: number;
}
