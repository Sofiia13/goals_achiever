import { Request, Response } from "express";
import { TaskService } from "./task.service.js";
import { AiService } from "../ai/ai.service.js";

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
      let tasks = await taskService.getDailyTasksByGoalId(goalId);

      if (!tasks.length) {
        const { nextStation, previousProgress } =
          await AiService.getProgressInfo(goalId);
        const generated = await AiService.generateDailyTasks(
          goalId,
          nextStation,
          previousProgress,
        );
        tasks = generated.tasks;
      }

      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async updateTaskDetails(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { taskId } = req.params;
      const { title, description } = req.body;

      if (!taskId || !title || !description) {
        return res
          .status(400)
          .json({ message: "Task ID, title and description are required" });
      }

      const task = await taskService.updateTaskDetails(
        parseInt(taskId, 10),
        title,
        description,
      );
      res.json(task);
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
        return res
          .status(400)
          .json({ message: "Task ID and status are required" });
      }

      const result = await taskService.updateTaskStatus(
        parseInt(taskId, 10),
        status,
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getStationProgress(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { goalId, stationTitle } = req.params;

      if (!goalId || !stationTitle) {
        return res
          .status(400)
          .json({ message: "Goal ID and station title are required" });
      }

      const progress = await taskService.getStationProgress(
        parseInt(goalId, 10),
        decodeURIComponent(stationTitle),
      );
      
      res.json(progress);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async createTask(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { goalId } = req.params;
      const { title, description, dueDate } = req.body;

      if (!goalId || !title) {
        return res.status(400).json({ message: "Goal ID and task title are required" });
      }

      const task = await taskService.createTask(parseInt(goalId, 10), {
        title,
        description,
        dueDate,
      });

      res.status(201).json(task);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
