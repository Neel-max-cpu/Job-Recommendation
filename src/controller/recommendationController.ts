import { Request, Response } from "express";
import { getRecommendations } from "../services/recommendationService.js";
import { getWeightsFromQuery } from "../services/weightService.js";

export const getRecommendationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const candidateId = Number(req.params.id);

    if (!Number.isInteger(candidateId) || candidateId <= 0) {
      return res.status(400).json({
        message: "Invalid candidate id",
      });
    }

    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
      return res.status(400).json({
        message: "Limit must be a positive integer",
      });
    }

    // extra bonus
    const weights = getWeightsFromQuery(req.query);

    const recommendations = await getRecommendations(
      candidateId,
      limit,
      weights
    );

    return res.status(200).json(recommendations);
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      (error.message === "Scoring weights must add up to 100" ||
        error.message === "Scoring weights must be valid non-negative numbers")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Candidate not found") {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    return res.status(500).json({
      message: "Failed to generate recommendations",
    });
  }
};
