import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { GoalController } from "./goal.controller";

const router = Router();

router.get("/", authMiddleware, GoalController.getUserGoals);
router.get("/:id", authMiddleware, GoalController.getGoalById);

export const goalRouter = router;
