import { Request, Response } from "express";
import { createJob } from "../services/jobService.js";
import { validateJob } from "../services/validationService.js";

export const createJobController = async (req: Request, res: Response) => {
  try {
    const validationError = validateJob(req.body);
    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const job = await createJob(req.body);

    res.status(201).json(job);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create job",
    });
  }
};
