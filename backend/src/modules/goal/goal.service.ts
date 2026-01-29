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
}
