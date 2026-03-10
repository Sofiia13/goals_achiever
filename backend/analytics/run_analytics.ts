import { prisma } from "../src/prisma.js";
import { writeFileSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("📦 Fetching data from database...");

  const users = await prisma.user.findMany({
    include: {
      goals: {
        include: {
          tasks: true,
        },
      },
    },
  });

  // Формуємо плоский формат для Python
  const usersData = users.map((u) => ({
    id: u.id,
    name: u.name,
    money: u.money,
    currentStreak: u.currentStreak,
    longestStreak: u.longestStreak,
    totalGoals: u.goals.length,
    completedGoals: u.goals.filter((g) => g.completedAt !== null).length,
    avgProgress:
      u.goals.length > 0
        ? u.goals.reduce((sum, g) => sum + (g.currentStationProgress ?? 0), 0) /
          u.goals.length
        : 0,
    aiGoals: u.goals.filter((g) => g.context?.startsWith("AI")).length,
    manualGoals: u.goals.filter((g) => !g.context?.startsWith("AI")).length,
  }));

  const goalsData = users.flatMap((u) =>
    u.goals.map((g) => ({
      id: g.id,
      userId: u.id,
      userName: u.name,
      title: g.title,
      isAI: g.context?.startsWith("AI") ?? false,
      progress: g.currentStationProgress ?? 0,
      completed: g.completedAt !== null,
      taskCount: g.tasks.length,
      tasksDone: g.tasks.filter((t) => t.status === "done").length,
    })),
  );

  const tasksData = users.flatMap((u) =>
    u.goals.flatMap((g) =>
      g.tasks.map((t) => ({
        id: t.id,
        goalId: g.id,
        userId: u.id,
        isAI: g.context?.startsWith("AI") ?? false,
        type: t.type,
        status: t.status,
        estimatedMinutes: t.estimatedMinutes,
      })),
    ),
  );

  const output = { users: usersData, goals: goalsData, tasks: tasksData };

  const outPath = path.join(__dirname, "analytics_data.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(
    `✅ Saved analytics_data.json (${users.length} users, ${goalsData.length} goals, ${tasksData.length} tasks)`,
  );

  // Запускаємо Python скрипт
  console.log("🐍 Running Python analytics...");
  try {
    execSync("python3 analytics.py", {
      cwd: __dirname,
      stdio: "inherit",
    });
  } catch {
    console.error("❌ Python failed. Make sure dependencies are installed:");
    console.error("   pip3 install numpy pandas matplotlib scikit-learn scipy");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
