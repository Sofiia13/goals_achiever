import { prisma } from "../../prisma.js";
import { UserService } from "../user/user.service.js";
import { StreakService } from "../../services/streak/streak.service.js";

const streakService = new StreakService();

export class TaskService {
  async getTasksByGoalId(goalId: number) {
    return prisma.task.findMany({
      where: { goalId },
      orderBy: [{ generatedAt: "asc" }, { id: "asc" }],
    });
  }

  async createTask(goalId: number, data: { title: string; description?: string; dueDate?: string }) {
    const createData = {
      title: data.title,
      goalId,
      status: "pending" as const,
      generatedAt: new Date(),
      type: "manual",
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.dueDate !== undefined ? { dueDate: new Date(data.dueDate) } : {}),
    };

    return prisma.task.create({
      data: createData,
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
        },
      },
      orderBy: { generatedAt: "desc" },
    });
  }

  async updateTaskDetails(taskId: number, title: string, description: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { title, description },
    });
  }

  async updateTaskStatus(taskId: number, status: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { goal: true },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    let coinsRewarded = 0;

    if (status === "done") {
      const coinsPerTask = 2; 
      coinsRewarded = coinsPerTask;
      await UserService.addUserMoney(task.goal.userId, coinsRewarded);
      
      // Оновлюємо страйк при виконанні таски
      await streakService.updateUserStreak(task.goal.userId);
    }

    if (status === "pending" && task.status === "done") {
      const coinsPerTask = 2;
      coinsRewarded = coinsPerTask;
      await UserService.removeUserMoney(task.goal.userId, coinsRewarded);
    }

    if (updatedTask.type === "daily" && status === "done" && updatedTask.progressContribution) {
      const newProgress = (task.goal.currentStationProgress || 0) + updatedTask.progressContribution;
      
      await prisma.goal.update({
        where: { id: task.goalId },
        data: { currentStationProgress: Math.min(newProgress, 100) },
      });

      if (newProgress >= 100 && updatedTask.station) {
        await this.completeCurrentStation(task.goalId, updatedTask.station);
      }
    }

    if (updatedTask.type === "daily" && status === "pending" && updatedTask.progressContribution) {
      const newProgress = Math.max(0, (task.goal.currentStationProgress || 0) - updatedTask.progressContribution);
      
      await prisma.goal.update({
        where: { id: task.goalId },
        data: { currentStationProgress: newProgress },
      });
    }

    return { task: updatedTask, coinsRewarded };
  }

  async completeCurrentStation(goalId: number, stationTitle: string) {
    const stationTask = await prisma.task.findFirst({
      where: {
        goalId,
        type: { not: "daily" },
        title: stationTitle,
        status: "pending",
      },
    });

    if (stationTask) {
      await prisma.task.update({
        where: { id: stationTask.id },
        data: { status: "done" },
      });

      await prisma.goal.update({
        where: { id: goalId },
        data: { currentStationProgress: 0 },
      });

      console.log(`✅ Станція "${stationTitle}" виконана! Прогрес: 100%`);
    }
  }

  async checkAndUpdateStationProgress(goalId: number, stationTitle: string) {
    const dailyTasksForStation = await prisma.task.findMany({
      where: {
        goalId,
        type: "daily",
        station: stationTitle,
        status: "done",
      },
    });

    if (dailyTasksForStation.length === 0) {
      return;
    }

    // Дістаємо goal, щоб знати дедлайн і кількість станцій що залишилися
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        tasks: {
          where: { type: { not: "daily" } },
        },
      },
    });

    if (!goal) return;

    // Рахуємо скільки днів до дедлайну
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysToDeadline = Math.max(1, Math.ceil((goal.deadline.getTime() - now.getTime()) / msPerDay));
    
    // Рахуємо скільки станцій залишилось
    const pendingStations = Math.max(
      1,
      goal.tasks.filter((t) => t.status === "pending").length
    );

    // Динамічний поріг: скільки днів на цю станцію з урахуванням дедлайну і кількості станцій
    const requiredDays = Math.max(1, Math.ceil(daysToDeadline / pendingStations));

    // Рахуємо унікальні дні роботи по цій станції
    const uniqueDays = new Set<string>();
    dailyTasksForStation.forEach((task) => {
      const date = new Date(task.generatedAt);
      const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      uniqueDays.add(dayKey);
    });

    const daysWorked = uniqueDays.size;

    if (daysWorked >= requiredDays) {
      const stationTask = await prisma.task.findFirst({
        where: {
          goalId,
          type: { not: "daily" },
          title: stationTitle,
          status: "pending",
        },
      });

      if (stationTask) {
        await prisma.task.update({
          where: { id: stationTask.id },
          data: { status: "done" },
        });

        console.log(
          `✅ Станція "${stationTitle}" виконана: ${daysWorked}/${requiredDays} днів (дедлайн через ${daysToDeadline} дн., станцій лишилось ${pendingStations})`
        );
      }
    } else {
      console.log(
        `📊 Прогрес для "${stationTitle}": ${daysWorked}/${requiredDays} днів (дедлайн через ${daysToDeadline} дн., станцій лишилось ${pendingStations})`
      );
    }
  }

  async getStationProgress(goalId: number, stationTitle: string) {
    const dailyTasksForStation = await prisma.task.findMany({
      where: {
        goalId,
        type: "daily",
        station: stationTitle,
        status: "done",
      },
    });

    // Дістаємо goal для розрахунку динамічного порогу
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        tasks: {
          where: { type: { not: "daily" } },
        },
      },
    });

    if (!goal) {
      return {
        daysWorked: 0,
        requiredDays: 5,
        totalTasks: 0,
        percentage: 0,
      };
    }

    // Рахуємо унікальні дні
    const uniqueDays = new Set<string>();
    dailyTasksForStation.forEach((task) => {
      const date = new Date(task.generatedAt);
      const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      uniqueDays.add(dayKey);
    });

    const daysWorked = uniqueDays.size;
    const totalTasks = dailyTasksForStation.length;

    // Динамічний поріг
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysToDeadline = Math.max(1, Math.ceil((goal.deadline.getTime() - now.getTime()) / msPerDay));
    const pendingStations = Math.max(
      1,
      goal.tasks.filter((t) => t.status === "pending").length
    );
    const requiredDays = Math.max(1, Math.ceil(daysToDeadline / pendingStations));

    const percentage = (daysWorked / requiredDays) * 100;

    return {
      daysWorked,
      requiredDays,
      totalTasks,
      percentage: Math.min(Math.round(percentage), 100),
    };
  }
}
