import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { AiController } from "./ai.controller.js";

const router = Router();

router.post("/plan", authMiddleware, AiController.generatePlan);
router.post("/daily-tasks", authMiddleware, AiController.generateDailyTasks);

export const aiRouter = router;
