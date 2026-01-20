import { prisma } from "../../prisma";

export class TaskService {
  async getTasksByGoalId(goalId: number) {
    return prisma.task.findMany({
      where: { goalId },
    });
  }

  async getDailyTasksByGoalId(goalId: number) {
    return prisma.task.findMany({
      where: { 
        goalId,
        type: "daily"
      },
      orderBy: { generatedAt: "desc" },
    });
  }
}
