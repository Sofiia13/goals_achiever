import { prisma } from "../../prisma";

export class StreakService {
  /**
   * Оновлює страйк користувача при виконанні таски
   */
  async updateUserStreak(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = user.lastActivityDate
      ? new Date(user.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
    }

    let newStreak = user.currentStreak;

    if (!lastActivity) {
      // Перша активність
      newStreak = 1;
    } else {
      const diffDays = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) {
        // Активність сьогодні вже була, нічого не змінюємо
        return;
      } else if (diffDays === 1) {
        // Послідовний день
        newStreak = user.currentStreak + 1;
      } else {
        // Страйк перервано
        newStreak = 1;
      }
    }

    const newLongestStreak = Math.max(newStreak, user.longestStreak);

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: new Date(),
      },
    });
  }

  /**
   * Отримує інформацію про страйк користувача
   */
  async getUserStreak(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Перевіряємо чи не втратив користувач страйк
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = user.lastActivityDate
      ? new Date(user.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays > 1) {
        // Страйк втрачено
        await prisma.user.update({
          where: { id: userId },
          data: { currentStreak: 0 },
        });
        return {
          currentStreak: 0,
          longestStreak: user.longestStreak,
          lastActivityDate: user.lastActivityDate,
        };
      }
    }

    return user;
  }
}
