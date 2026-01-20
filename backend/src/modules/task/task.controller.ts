import { Request, Response } from "express";
import { TaskService } from "./task.service";

const taskService = new TaskService();

export class TaskController {
  static async getTasksByGoalId(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.params.goalId) {
        return res.status(400).json({ message: "Goal ID is required" });
      }

      const goalId = parseInt(req.params.goalId, 10);
      const tasks = await taskService.getTasksByGoalId(goalId);
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getDailyTasksByGoalId(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.params.goalId) {
        return res.status(400).json({ message: "Goal ID is required" });
      }

      const goalId = parseInt(req.params.goalId, 10);
      const tasks = await taskService.getDailyTasksByGoalId(goalId);
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async updateTaskStatus(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { taskId } = req.params;
      const { status } = req.body;

      if (!taskId || !status) {
        return res.status(400).json({ message: "Task ID and status are required" });
      }

      const task = await taskService.updateTaskStatus(parseInt(taskId, 10), status);
      res.json(task);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
