import { authMiddleware } from "../../middlewares/auth.middleware";
import { TaskController } from "./task.controller";
import { Router } from "express";

const router = Router();

router.get("/goals/:goalId/", authMiddleware, TaskController.getTasksByGoalId);
router.get(
  "/goals/:goalId/daily-tasks",
  authMiddleware,
  TaskController.getDailyTasksByGoalId,
);
router.get(
  "/goals/:goalId/stations/:stationTitle/progress",
  authMiddleware,
  TaskController.getStationProgress,
);
router.patch(
  "/:taskId/status",
  authMiddleware,
  TaskController.updateTaskStatus,
);
router.patch(
  "/:taskId/details",
  authMiddleware,
  TaskController.updateTaskDetails,
);

export const taskRouter = router;
