import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { GoalController } from "./goal.controller";

const router = Router();

router.get("/", authMiddleware, GoalController.getUserGoals);

export const goalRouter = router;
