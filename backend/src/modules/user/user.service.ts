import { prisma } from "../../prisma";

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
}
