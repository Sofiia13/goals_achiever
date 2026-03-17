import { prisma } from "../../prisma.js";
import { StreakService } from "../../services/streak/streak.service.js";

const streakService = new StreakService();

export class UserService {
  async getUserById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getUserMoney(userId: number) {
    const user = await this.getUserById(userId);
    return user ? user.money : null;
  }

  async c(userId: number, amount: number) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newMoney = user.money + amount;
    await prisma.user.update({
      where: { id: userId },
      data: { money: newMoney },
    });

    return newMoney;
  }

  static async addUserMoney(userId: number, amount: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { money: { increment: amount } },
    });
  }

  static async removeUserMoney(userId: number, amount: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { money: { decrement: amount } },
    });
  }

  async getUserStreak(userId: number) {
    return streakService.getUserStreak(userId);
  }
}
