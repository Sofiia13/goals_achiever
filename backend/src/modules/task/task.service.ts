import { prisma } from "../../prisma";

export class TaskService {
  async getTasksByGoalId(goalId: number) {
    return prisma.task.findMany({
      where: { goalId },
      orderBy: [{ generatedAt: "asc" }, { id: "asc" }],
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
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    // Якщо це daily task і він виконаний, перевіряємо чи потрібно оновити станцію
    if (updatedTask.type === "daily" && status === "done" && updatedTask.station) {
      await this.checkAndUpdateStationProgress(updatedTask.goalId, updatedTask.station);
    }

    return updatedTask;
  }

  async checkAndUpdateStationProgress(goalId: number, stationTitle: string) {
    // Знаходимо всі daily tasks для цієї станції
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

    // Рахуємо унікальні дні, коли були виконані daily tasks
    const uniqueDays = new Set<string>();
    dailyTasksForStation.forEach(task => {
      const date = new Date(task.generatedAt);
      const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      uniqueDays.add(dayKey);
    });

    const daysWorked = uniqueDays.size;

    // Якщо користувач працював над станцією протягом 5+ днів, відмічаємо станцію як виконану
    const REQUIRED_DAYS = 5;
    
    if (daysWorked >= REQUIRED_DAYS) {
      // Знаходимо roadmap task (станцію) з таким title
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

        console.log(`✅ Станція "${stationTitle}" автоматично відмічена як виконана! (${daysWorked} днів роботи)`);
      }
    } else {
      console.log(`📊 Прогрес для "${stationTitle}": ${daysWorked}/${REQUIRED_DAYS} днів`);
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

    // Рахуємо унікальні дні
    const uniqueDays = new Set<string>();
    dailyTasksForStation.forEach(task => {
      const date = new Date(task.generatedAt);
      const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      uniqueDays.add(dayKey);
    });

    const daysWorked = uniqueDays.size;
    const totalTasks = dailyTasksForStation.length;
    const requiredDays = 5;
    const percentage = (daysWorked / requiredDays) * 100;

    return {
      daysWorked,
      requiredDays,
      totalTasks,
      percentage: Math.min(Math.round(percentage), 100),
    };
  }
}
