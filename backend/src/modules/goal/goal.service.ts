import { prisma } from "../../prisma";

export class GoalService {
  async getGoalsByUserId(userId: number) {
    return prisma.goal.findMany({
      where: { userId },
    });
  }

  async getGoalById(goalId: number) {
    return prisma.goal.findUnique({
      where: { id: goalId },
    });
  }

  async createGoal(userId: number, data: { title: string; deadline: string }) {
    return prisma.goal.create({
      data: {
        title: data.title,
        deadline: new Date(data.deadline),
        userId,
      },
    });
  }

  async getDaysTillDeadline(goalId: number) {
    const goal = await this.getGoalById(goalId);
    if (!goal || !goal.deadline) {
      throw new Error("Goal not found or deadline not set");
    }

    const currentDate = new Date();
    const deadlineDate = new Date(goal.deadline);
    const timeDiff = deadlineDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
  }

  async deleteGoal(goalId: number, userId: number) {
    // Перевіряємо чи існує ціль і чи належить вона користувачу
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: userId,
      },
    });

    if (!goal) {
      throw new Error("Goal not found or you don't have permission to delete it");
    }

    return prisma.goal.delete({
      where: { id: goalId },
    });
  }
}
