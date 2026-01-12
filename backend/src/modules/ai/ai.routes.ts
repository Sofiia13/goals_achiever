import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { AiController } from "./ai.controller";

const router = Router();

router.post("/plan", authMiddleware, AiController.generatePlan);

export const aiRouter = router;
