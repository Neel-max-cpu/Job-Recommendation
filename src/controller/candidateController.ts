import { Request, Response } from "express";
import { createCandidate } from "../services/candidateService.js";

export const createCandidateController = async (
  req: Request,
  res: Response
) => {
  try {
    const candidate = await createCandidate(req.body);

    res.status(200).json(candidate);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create candidate",
    });
  }
};
