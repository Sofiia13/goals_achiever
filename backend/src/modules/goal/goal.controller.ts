import { Request, Response } from "express";
import { GoalService } from "./goal.service.js";

const goalService = new GoalService();

export class GoalController {
  static async getUserGoals(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const goals = await goalService.getGoalsByUserId(user.id);
      res.json(goals);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getGoalById(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.params.id) {
        return res.status(400).json({ message: "Goal ID is required" });
      }

      const goalId = parseInt(req.params.id, 10);
      const goal = await goalService.getGoalById(goalId);

      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.json(goal);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getDaysTillDeadline(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.params.id) {
        return res.status(400).json({ message: "Goal ID is required" });
      }

      const goalId = parseInt(req.params.id, 10);
      const daysTillDeadline = await goalService.getDaysTillDeadline(goalId);

      res.json({ daysTillDeadline });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async createGoal(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { title, deadline } = req.body;

      if (!title || !deadline) {
        return res.status(400).json({ message: "Title and deadline are required" });
      }

      const goal = await goalService.createGoal(user.id, { title, deadline });

      res.status(201).json(goal);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async deleteGoal(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.params.id) {
        return res.status(400).json({ message: "Goal ID is required" });
      }

      const goalId = parseInt(req.params.id, 10);
      await goalService.deleteGoal(goalId, user.id);

      res.status(204).send();
    } catch (err: any) {
      if (err.message.includes("not found") || err.message.includes("permission")) {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: err.message });
    }
  }
}
