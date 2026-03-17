import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { GoalController } from "./goal.controller.js";

const router = Router();

router.get("/", authMiddleware, GoalController.getUserGoals);
router.post("/", authMiddleware, GoalController.createGoal);
router.get("/:id", authMiddleware, GoalController.getGoalById);
router.delete("/:id", authMiddleware, GoalController.deleteGoal);
router.get(
  "/:id/days-till-deadline",
  authMiddleware,
  GoalController.getDaysTillDeadline,
);

export const goalRouter = router;
