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
}
