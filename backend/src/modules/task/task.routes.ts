import { authMiddleware } from "../../middlewares/auth.middleware";
import { TaskController } from "./task.controller";
import { Router } from "express";

const router = Router();

router.get("/goals/:goalId/", authMiddleware, TaskController.getTasksByGoalId);
router.get("/goals/:goalId/daily-tasks", authMiddleware, TaskController.getDailyTasksByGoalId);
router.patch("/:taskId/status", authMiddleware, TaskController.updateTaskStatus);

export const taskRouter = router;
