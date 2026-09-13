import { Request, Response } from "express";
import { createJob } from "../services/jobService.js";

export const createJobController = async (req: Request, res: Response) => {
  try {
    const job = await createJob(req.body);

    res.status(201).json(job);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create job",
    });
  }
};
