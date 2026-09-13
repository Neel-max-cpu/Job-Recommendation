import { Request, Response } from "express";
import { createCandidate } from "../services/candidateService.js";
import { validateCandidate } from "../services/validationService.js";

export const createCandidateController = async (
  req: Request,
  res: Response
) => {
  try {
    const validationError = validateCandidate(req.body);
    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const candidate = await createCandidate(req.body);

    res.status(200).json(candidate);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create candidate",
    });
  }
};
