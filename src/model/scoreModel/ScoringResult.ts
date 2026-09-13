export interface ScoringBreakdown {
  skills: number;
  experience: number;
  location: number;
  salary: number;
}

export interface ScoringResult {
  score: number;
  breakdown: ScoringBreakdown;
}
