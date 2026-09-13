import { Router } from "express";
import { createJobController } from "../controller/jobController.js";

const router = Router();

router.post("/create", createJobController);

export default router;