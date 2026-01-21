import { prisma } from "../../prisma";

export class TaskService {
  async getTasksByGoalId(goalId: number) {
    return prisma.task.findMany({
      where: { goalId },
    });
  }

  async getDailyTasksByGoalId(goalId: number) {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    return prisma.task.findMany({
      where: { 
        goalId,
        type: "daily",
        generatedAt: {
          gte: startOfToday,
          lte: endOfToday,
        }
      },
      orderBy: { generatedAt: "desc" },
    });
  }

  async updateTaskStatus(taskId: number, status: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }
}
