import { Router } from "express";
import { getRecommendationsController } from "../controller/recommendationController.js";
import { getJobRecommendationsController } from "../controller/jobRecommendationController.js";

const router = Router();

router.get("/candidates/:id", getRecommendationsController);
router.get("/jobs/:id", getJobRecommendationsController);

export default router;
