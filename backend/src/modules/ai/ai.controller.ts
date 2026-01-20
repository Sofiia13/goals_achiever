import { Request, Response } from "express";
import { AiService } from "./ai.service.js";
import { Models } from "@google/genai";

export class AiController {
  static async generatePlan(req: Request, res: Response) {
    // const models = await Models.list();
    // console.log("Models:", models);

    console.log("=== POST /plan endpoint hit ===");
    console.log("Request body:", req.body);

    const { goal, deadline, context } = req.body;

    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    console.log("Extracted params:", { goal, deadline, context });

    try {
      const plan = await AiService.generatePlan(
        user.id,
        goal,
        deadline,
        context,
      );

      res.json(plan);
    } catch (err: any) {
      console.error("Error in /plan endpoint:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async generateDailyTasks(req: Request, res: Response) {
    console.log("=== POST /daily-tasks endpoint hit ===");
    console.log("Request body:", req.body);

    const { goalId } = req.body;

    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (!goalId) {
      return res.status(400).json({ error: "goalId is required" });
    }

    try {
      const { nextStation, previousProgress } = await AiService.getProgressInfo(
        Number(goalId)
      );

      console.log("Progress info:", { nextStation, previousProgress });

      const dailyTasks = await AiService.generateDailyTasks(
        Number(goalId),
        nextStation,
        previousProgress
      );

      res.json(dailyTasks);
    } catch (err: any) {
      console.error("Error in /daily-tasks endpoint:", err);
      res.status(500).json({ error: err.message });
    }
  }
}
