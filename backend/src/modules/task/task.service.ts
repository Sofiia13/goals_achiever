import { prisma } from "../../prisma";

export class TaskService {
  async getTasksByGoalId(goalId: number) {
    return prisma.task.findMany({
      where: { goalId },
    });
  }
}
