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

  async updateTaskStatus(taskId: number, status: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }
}
