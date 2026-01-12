import { prisma } from "../../prisma";

export class GoalService {
  async getGoalsByUserId(userId: number) {
    return prisma.goal.findMany({
      where: { userId },
    });
  }
}
