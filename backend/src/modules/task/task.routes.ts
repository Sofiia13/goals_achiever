import { authMiddleware } from "../../middlewares/auth.middleware";
import { TaskController } from "./task.controller";
import { Router } from "express";

const router = Router();

router.get("/goals/:goalId/", authMiddleware, TaskController.getTasksByGoalId);

export const taskRouter = router;
