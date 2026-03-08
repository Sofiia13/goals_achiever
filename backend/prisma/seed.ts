import { prisma } from "../src/prisma";
import * as bcrypt from "bcryptjs";

const generateHash = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

async function main() {
  console.log("🌱 Starting seed...");

  // Очищуємо базу
  await prisma.task.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.user.deleteMany({});

  const users = [
    {
      name: "Sofiia Stanishevska",
      email: "sophiyastanish@gmail.com",
      password: generateHash("Sofiia1305"),
      money: 15,
      currentStreak: 7,
      longestStreak: 15,
    },
    {
      name: "Sofiia Kuzniak",
      email: "sofiia.kuzniak@gmail.com",
      password: generateHash("password123"),
      money: 15,
      currentStreak: 7,
      longestStreak: 15,
    },
    {
      name: "Bohuslav Stanishevskyy",
      email: "bohuStan@gmail.com",
      password: generateHash("password123"),
      money: 28,
      currentStreak: 12,
      longestStreak: 25,
    },
    {
      name: "Anastasiia Kasatkina",
      email: "nastiakasat@gmail.com",
      password: generateHash("password123"),
      money: 9,
      currentStreak: 2,
      longestStreak: 10,
    },
    {
      name: "Illya Shuliak",
      email: "lqduser@gmail.com",
      password: generateHash("password123"),
      money: 32,
      currentStreak: 14,
      longestStreak: 30,
    },
    {
      name: "Roman Pelekh",
      email: "tkdfjzlg@gmail.com",
      password: generateHash("password123"),
      money: 21,
      currentStreak: 5,
      longestStreak: 12,
    },
    {
      name: "Sofiia Pylnyk",
      email: "hatikuji@gmail.com",
      password: generateHash("password123"),
      money: 45,
      currentStreak: 18,
      longestStreak: 31,
    },
    {
      name: "Oleksandr Poliakov",
      email: "viyd12@gmail.com",
      password: generateHash("password123"),
      money: 18,
      currentStreak: 8,
      longestStreak: 20,
    },
    {
      name: "Ruslana Kovtunovych",
      email: "rusyakovtunovych@gmail.com",
      password: generateHash("password123"),
      money: 54,
      currentStreak: 21,
      longestStreak: 50,
    },
    {
      name: "Olena Struk",
      email: "o_struk@gmail.com",
      password: generateHash("password123"),
      money: 12,
      currentStreak: 3,
      longestStreak: 8,
    },
    {
      name: "Sofiia Huliy",
      email: "sofiia.h@gmail.com",
      password: generateHash("password123"),
      money: 36,
      currentStreak: 15,
      longestStreak: 35,
    },
    {
      name: "Iryna Bilous",
      email: "bilous_i@gmail.com",
      password: generateHash("password123"),
      money: 24,
      currentStreak: 9,
      longestStreak: 18,
    },
    {
      name: "Oleh Korniichuk",
      email: "isntlazy@gmail.com",
      password: generateHash("password123"),
      money: 60,
      currentStreak: 25,
      longestStreak: 43,
    },
    {
      name: "Yulia Rovetska",
      email: "playfullcreator@gmail.com",
      password: generateHash("password123"),
      money: 17,
      currentStreak: 6,
      longestStreak: 14,
    },
    {
      name: "Yuliia Kovaliv",
      email: "kovaliv_y@gmail.com",
      password: generateHash("password123"),
      money: 42,
      currentStreak: 16,
      longestStreak: 40,
    },
    {
      name: "Olivia Harris",
      email: "olivia@example.com",
      password: generateHash("password123"),
      money: 31,
      currentStreak: 13,
      longestStreak: 28,
    },
    {
      name: "Viktoriia Savytska",
      email: "savytska@gmail.com",
      password: generateHash("password123"),
      money: 50,
      currentStreak: 20,
      longestStreak: 48,
    },
    {
      name: "Andriy Stanishevskyy",
      email: "sandr463@gmail.com",
      password: generateHash("password123"),
      money: 19,
      currentStreak: 7,
      longestStreak: 16,
    },
    {
      name: "Nataliia Stanishevska",
      email: "n_stanish@ukr.net",
      password: generateHash("password123"),
      money: 38,
      currentStreak: 11,
      longestStreak: 32,
    },
    {
      name: "Volodymyr Stanishevskyy",
      email: "stanish@ukr.net",
      password: generateHash("password123"),
      money: 26,
      currentStreak: 10,
      longestStreak: 22,
    },
    {
      name: "Ostap Kokoshko",
      email: "ostap.kokoshko@gmail.com",
      password: generateHash("password123"),
      money: 68,
      currentStreak: 8,
      longestStreak: 10,
    },
  ];

  const createdUsers = await Promise.all(
    users.map((user) =>
      prisma.user.create({
        data: user,
      }),
    ),
  );

  console.log(`✅ Created ${createdUsers.length} users`);

  // Створюємо цілі та таски для кожного користувача
  let totalGoals = 0;
  let totalTasks = 0;

  for (const user of createdUsers) {
    const goalCount = Math.floor(Math.random() * 3) + 2; // 2-4 цілі

    const goalTitles = [
      "Learn React",
      "Learn French",
      "Improve efficiency",
      "Master TypeScript",
      "Complete Diploma",
      "Build a project",
      "Read 12 books",
      "Run a marathon",
      "Learn Spanish",
      "Start a business",
    ];

    for (let i = 0; i < goalCount; i++) {
      const deadline = new Date();
      deadline.setMonth(
        deadline.getMonth() + Math.floor(Math.random() * 6) + 1,
      );

      const isCompleted = Math.random() > 0.7;
      const completedAt = isCompleted
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        : null;

      const goal = await prisma.goal.create({
        data: {
          title: goalTitles[Math.floor(Math.random() * goalTitles.length)],
          context: `Personal goal to improve my skills and knowledge`,
          deadline,
          userId: user.id,
          completedAt,
          currentStationProgress: Math.random() * 100,
        },
      });

      totalGoals++;

      // Створюємо таски для цілі
      const taskCount = Math.floor(Math.random() * 8) + 3; // 3-10 тасок

      const taskTitles = [
        "Complete lesson 1",
        "Watch tutorial videos",
        "Do practice exercises",
        "Build small project",
        "Review concepts",
        "Take quiz",
        "Write summary",
        "Create notes",
        "Practice daily",
        "Read documentation",
      ];

      for (let j = 0; j < taskCount; j++) {
        const isTaskDone = Math.random() > 0.3;
        const taskStatus = isTaskDone ? "done" : "pending";
        const generatedDate = new Date();
        generatedDate.setDate(
          generatedDate.getDate() - Math.floor(Math.random() * 30),
        );

        await prisma.task.create({
          data: {
            title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
            description: `Task for ${goal.title}`,
            status: taskStatus,
            type: "task",
            goalId: goal.id,
            generatedAt: generatedDate,
            progressContribution: Math.random() * 10 + 5,
          },
        });

        totalTasks++;
      }

      // Додаємо деякі daily таски
      const dailyTaskCount = Math.floor(Math.random() * 3) + 1;

      for (let k = 0; k < dailyTaskCount; k++) {
        const isDailyDone = Math.random() > 0.4;

        await prisma.task.create({
          data: {
            title: `Daily practice ${k + 1}`,
            description: "Daily task for consistency",
            status: isDailyDone ? "done" : "pending",
            type: "daily",
            goalId: goal.id,
            generatedAt: new Date(),
            progressContribution: 10,
          },
        });

        totalTasks++;
      }
    }
  }

  console.log(`✅ Created ${totalGoals} goals`);
  console.log(`✅ Created ${totalTasks} tasks`);
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
