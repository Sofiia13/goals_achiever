import { goalsApi } from "../api/goals.api";
import { tasksApi } from "../api/tasks.api";
import { userApi } from "../api/user.api";
import type { Goal, Task } from "../types/api.types";

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  unlocked: boolean;
};

export type AchievementStats = {
  money: number;
  currentStreak: number;
  totalGoals: number;
  completedGoals: number;
  completedTasks: number;
  aiTasks: number;
};

const AI_TYPES = ["daily", "ai", "learn", "practice", "review", "reflect"];

export const getAchievements = (stats: AchievementStats): Achievement[] => [
  {
    id: "first-goal",
    icon: "🎯",
    title: "Перший крок",
    subtitle: "Створено 1+ ціль",
    unlocked: stats.totalGoals >= 1,
  },
  {
    id: "task-warrior",
    icon: "✅",
    title: "Task Warrior",
    subtitle: "Виконано 25+ тасок",
    unlocked: stats.completedTasks >= 25,
  },
  {
    id: "streak-keeper",
    icon: "🔥",
    title: "Streak Keeper",
    subtitle: "Серія 7+ днів",
    unlocked: stats.currentStreak >= 7,
  },
  {
    id: "ai-explorer",
    icon: "🤖",
    title: "AI Explorer",
    subtitle: "Зроблено 10+ AI задач",
    unlocked: stats.aiTasks >= 10,
  },
  {
    id: "coin-master",
    icon: "💰",
    title: "Coin Master",
    subtitle: "Накопичено 200+ монет",
    unlocked: stats.money >= 200,
  },
  {
    id: "goal-finisher",
    icon: "🏁",
    title: "Goal Finisher",
    subtitle: "Завершено 3+ цілі",
    unlocked: stats.completedGoals >= 3,
  },
];

export const loadAchievementStats = async (): Promise<AchievementStats> => {
  const [moneyRes, streakRes, goalsRes] = await Promise.all([
    userApi.getUserMoney(),
    userApi.getUserStreak(),
    goalsApi.getUserGoals(),
  ]);

  const goals: Goal[] = goalsRes.data;

  const taskResponses = await Promise.all(
    goals.map((goal) => tasksApi.getTasksByGoal(goal.id)),
  );

  const allTasks: Task[] = taskResponses.flatMap((res) => res.data);

  return {
    money: moneyRes.data.money || 0,
    currentStreak: streakRes.data.currentStreak || 0,
    totalGoals: goals.length,
    completedGoals: goals.filter((goal) => !!goal.completedAt).length,
    completedTasks: allTasks.filter((task) => task.status === "done").length,
    aiTasks: allTasks.filter((task) =>
      AI_TYPES.includes((task.type || "").toLowerCase()),
    ).length,
  };
};
