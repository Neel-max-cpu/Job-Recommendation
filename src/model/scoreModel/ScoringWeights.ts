export interface ScoringWeights {
  skills: number;
  experience: number;
  location: number;
  salary: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  skills: 50,
  experience: 20,
  location: 15,
  salary: 15,
};
