import React, { useEffect, useMemo, useState } from "react";
import styles from "./ProfilePage.module.scss";
import profileImg from "../../assets/profile.jpg";
import { useAuth } from "../../shared/context/AuthContext";
import { Button } from "../../shared/components/ui/Button";
import { userApi } from "../../shared/api/user.api";
import { goalsApi } from "../../shared/api/goals.api";
import { tasksApi } from "../../shared/api/tasks.api";
import type { Goal, Task } from "../../shared/types/api.types";

type ProfileStats = {
  money: number;
  currentStreak: number;
  longestStreak: number;
  totalGoals: number;
  completedGoals: number;
  totalTasks: number;
  completedTasks: number;
  aiTasks: number;
  manualTasks: number;
  weeklyDone: { day: string; value: number }[];
};

const AI_TYPES = ["daily", "ai", "learn", "practice", "review", "reflect"];

const initialStats: ProfileStats = {
  money: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalGoals: 0,
  completedGoals: 0,
  totalTasks: 0,
  completedTasks: 0,
  aiTasks: 0,
  manualTasks: 0,
  weeklyDone: [],
};

export const ProfilePage: React.FC = ({}) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<ProfileStats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileStats = async () => {
      if (!user) return;

      try {
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
        const completedTasks = allTasks.filter((t) => t.status === "done").length;
        const completedGoals = goals.filter((g) => !!g.completedAt).length;
        const aiTasks = allTasks.filter((t) => AI_TYPES.includes((t.type || "").toLowerCase())).length;
        const manualTasks = Math.max(0, allTasks.length - aiTasks);

        const weeklyDone = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          d.setHours(0, 0, 0, 0);

          const dayStart = d.getTime();
          const dayEnd = dayStart + 24 * 60 * 60 * 1000;

          const doneCount = allTasks.filter((task) => {
            if (task.status !== "done" || !task.generatedAt) return false;
            const taskDate = new Date(task.generatedAt).getTime();
            return taskDate >= dayStart && taskDate < dayEnd;
          }).length;

          return {
            day: d.toLocaleDateString("uk-UA", { weekday: "short" }),
            value: doneCount,
          };
        });

        setStats({
          money: moneyRes.data.money || 0,
          currentStreak: streakRes.data.currentStreak || 0,
          longestStreak: streakRes.data.longestStreak || 0,
          totalGoals: goals.length,
          completedGoals,
          totalTasks: allTasks.length,
          completedTasks,
          aiTasks,
          manualTasks,
          weeklyDone,
        });
      } catch (error) {
        console.error("Failed to load profile stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileStats();
  }, [user]);

  const gamification = useMemo(() => {
    const xp =
      stats.completedTasks * 15 +
      stats.completedGoals * 60 +
      stats.currentStreak * 10 +
      Math.floor(stats.money);

    const xpPerLevel = 250;
    const level = Math.floor(xp / xpPerLevel) + 1;
    const progressInLevel = xp % xpPerLevel;
    const progressPercent = Math.round((progressInLevel / xpPerLevel) * 100);

    const achievements = [
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

    return { xp, level, progressInLevel, progressPercent, xpPerLevel, achievements };
  }, [stats]);

  const maxWeekly = Math.max(1, ...stats.weeklyDone.map((d) => d.value));

  return (
    <div className={styles.profilePage}>
      <div className={styles.profilePage__hero}>
        <div className={styles.profilePage__main}>
          <img
            src={profileImg}
            alt={user?.name}
            className={styles.profilePage__img}
          />
          <div className={styles.profilePage__info}>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <div className={styles.profilePage__meta}>
              <span>Level {gamification.level}</span>
              <span>🔥 {stats.currentStreak} day streak</span>
              <span>💰 {stats.money} coins</span>
            </div>
          </div>
        </div>
        <Button variant="default" onClick={logout} buttonText="Logout" />
      </div>

      <div className={styles.profilePage__card}>
        <h3>XP Progress</h3>
        <p>
          {gamification.progressInLevel} / {gamification.xpPerLevel} XP to next level
        </p>
        <div className={styles.profilePage__progressTrack}>
          <div
            className={styles.profilePage__progressFill}
            style={{ width: `${gamification.progressPercent}%` }}
          />
        </div>
      </div>

      <div className={styles.profilePage__statsGrid}>
        <div className={styles.profilePage__statCard}>
          <span>🎯</span>
          <h4>{stats.totalGoals}</h4>
          <p>Total goals</p>
        </div>
        <div className={styles.profilePage__statCard}>
          <span>🏁</span>
          <h4>{stats.completedGoals}</h4>
          <p>Completed goals</p>
        </div>
        <div className={styles.profilePage__statCard}>
          <span>✅</span>
          <h4>{stats.completedTasks}</h4>
          <p>Tasks done</p>
        </div>
        <div className={styles.profilePage__statCard}>
          <span>🤖</span>
          <h4>{stats.aiTasks}</h4>
          <p>AI generated</p>
        </div>
        <div className={styles.profilePage__statCard}>
          <span>✍️</span>
          <h4>{stats.manualTasks}</h4>
          <p>Manual tasks</p>
        </div>
        <div className={styles.profilePage__statCard}>
          <span>🔥</span>
          <h4>{stats.longestStreak}</h4>
          <p>Best streak</p>
        </div>
      </div>

      <div className={styles.profilePage__grid}>
        <div className={styles.profilePage__card}>
          <h3>Weekly activity</h3>
          <div className={styles.profilePage__bars}>
            {stats.weeklyDone.map((d) => (
              <div key={d.day} className={styles.profilePage__barItem}>
                <div className={styles.profilePage__barWrap}>
                  <div
                    className={styles.profilePage__bar}
                    style={{ height: `${Math.max(8, (d.value / maxWeekly) * 100)}%` }}
                    title={`${d.value} tasks`}
                  />
                </div>
                <span>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.profilePage__card}>
          <h3>Achievements</h3>
          <div className={styles.profilePage__achievements}>
            {gamification.achievements.map((a) => (
              <div
                key={a.id}
                className={`${styles.profilePage__achievement} ${
                  a.unlocked ? styles.profilePage__achievementUnlocked : styles.profilePage__achievementLocked
                }`}
              >
                <span className={styles.profilePage__achievementIcon}>{a.icon}</span>
                <div>
                  <h4>{a.title}</h4>
                  <p>{a.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className={styles.profilePage__loading}>Loading profile stats...</p>}
    </div>
  );
};
