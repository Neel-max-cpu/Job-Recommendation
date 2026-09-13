import { Router } from "express";
import { createCandidateController } from "../controller/candidateController.js";

const router = Router();

router.post("/create", createCandidateController);

export default router;