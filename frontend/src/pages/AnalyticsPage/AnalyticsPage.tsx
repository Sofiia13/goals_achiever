import React, { useEffect, useState } from "react";
import styles from "./AnalyticsPage.module.scss";
import { goalsApi } from "../../shared/api/goals.api";
import { tasksApi } from "../../shared/api/tasks.api";
import { userApi } from "../../shared/api/user.api";
import type { Goal, Task } from "../../shared/types/api.types";

interface Analytics {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  money: number;
  goalsWithDeadlines: {
    overdue: number;
    upcoming: number;
  };
  tasksPerGoal: { goalTitle: string; count: number; completed: number }[];
  recentActivity: { date: string; completedTasks: number }[];
}

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    money: 0,
    goalsWithDeadlines: {
      overdue: 0,
      upcoming: 0,
    },
    tasksPerGoal: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [goalsRes, moneyRes] = await Promise.all([
          goalsApi.getUserGoals(),
          userApi.getUserMoney(),
        ]);

        const goals: Goal[] = goalsRes.data;
        const money = moneyRes.data.money || 0;

        console.log("Goals:", goals);
        console.log("Money:", money);

        const tasksPromises = goals.map((goal) =>
          tasksApi.getTasksByGoal(goal.id),
        );
        const tasksResponses = await Promise.all(tasksPromises);
        const allTasks: Task[] = tasksResponses.flatMap((res) => res.data);

        console.log("All tasks:", allTasks);

        const completedGoals = goals.filter((g) => g.completedAt).length;
        const completedTasks = allTasks.filter((t) => t.status === "done").length;
        const pendingTasks = allTasks.filter((t) => t.status === "pending").length;

        const now = new Date();
        let overdue = 0;
        let upcoming = 0;

        goals.forEach((goal) => {
          if (goal.deadline && !goal.completedAt) {
            const deadline = new Date(goal.deadline);
            if (deadline < now) {
              overdue++;
            } else {
              upcoming++;
            }
          }
        });

        const tasksPerGoal = goals.map((goal) => {
          const goalTasks = allTasks.filter((t) => t.goalId === goal.id);
          return {
            goalTitle: goal.title,
            count: goalTasks.length,
            completed: goalTasks.filter((t) => t.status === "done").length,
          };
        });

        console.log("Tasks per goal:", tasksPerGoal);

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });

        const recentActivity = last7Days.map((date) => {
          const dateStr = date.toISOString().split("T")[0];
          const tasksOnDate = allTasks.filter((task) => {
            if (!task.generatedAt) return false;
            const taskDate = new Date(task.generatedAt).toISOString().split("T")[0];
            return taskDate === dateStr && task.status === "done";
          });
          
          const dayNum = date.getDate();
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthName = monthNames[date.getMonth()];
          
          return {
            date: `${dayNum} ${monthName}`,
            completedTasks: tasksOnDate.length,
          };
        });

        console.log("Recent activity:", recentActivity);

        const completionRate =
          allTasks.length > 0
            ? Math.round((completedTasks / allTasks.length) * 100)
            : 0;

        console.log("Final analytics:", {
          totalGoals: goals.length,
          completedGoals,
          activeGoals: goals.length - completedGoals,
          totalTasks: allTasks.length,
          completedTasks,
          pendingTasks,
          completionRate,
          money,
        });

        setAnalytics({
          totalGoals: goals.length,
          completedGoals,
          activeGoals: goals.length - completedGoals,
          totalTasks: allTasks.length,
          completedTasks,
          pendingTasks,
          completionRate,
          money,
          goalsWithDeadlines: {
            overdue,
            upcoming,
          },
          tasksPerGoal,
          recentActivity,
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={styles.analyticsPage}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  console.log("Rendering with analytics:", analytics);

  const maxActivity = Math.max(...analytics.recentActivity.map((a) => a.completedTasks), 1);

  return (
    <div className={styles.analyticsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Analytics</h1>
          <p className={styles.subtitle}>Track your progress and achievements</p>
        </div>

        {/* Main Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statCard__icon}>🎯</div>
            <div className={styles.statCard__content}>
              <h3 className={styles.statCard__value}>{analytics.totalGoals}</h3>
              <p className={styles.statCard__label}>Total Goals</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCard__icon}>✅</div>
            <div className={styles.statCard__content}>
              <h3 className={styles.statCard__value}>{analytics.completedTasks}</h3>
              <p className={styles.statCard__label}>Completed Tasks</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCard__icon}>⏳</div>
            <div className={styles.statCard__content}>
              <h3 className={styles.statCard__value}>{analytics.pendingTasks}</h3>
              <p className={styles.statCard__label}>Pending Tasks</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCard__icon}>💰</div>
            <div className={styles.statCard__content}>
              <h3 className={styles.statCard__value}>{analytics.money}</h3>
              <p className={styles.statCard__label}>Money Earned</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.chartsGrid}>
          {/* Completion Rate Circle */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartCard__title}>Overall Progress</h2>
            <div className={styles.circleChart}>
              <svg viewBox="0 0 200 200" className={styles.circleChart__svg}>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#8b6f47"
                  strokeWidth="20"
                  strokeDasharray={`${(analytics.completionRate * 502.65) / 100} 502.65`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  dy=".3em"
                  className={styles.circleChart__text}
                >
                  {analytics.completionRate}%
                </text>
              </svg>
              <p className={styles.chartCard__description}>
                {analytics.completedTasks} out of {analytics.totalTasks} tasks completed
              </p>
            </div>
          </div>

          {/* Activity Chart */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartCard__title}>Weekly Activity</h2>
            <div className={styles.barChart}>
              {analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.map((day, index) => (
                  <div key={index} className={styles.barChart__item}>
                    <div className={styles.barChart__barWrapper}>
                      <div
                        className={styles.barChart__bar}
                        style={{
                          height: day.completedTasks > 0 ? `${(day.completedTasks / maxActivity) * 100}%` : '10%',
                          minHeight: day.completedTasks > 0 ? '30px' : '10px',
                        }}
                      >
                        {day.completedTasks > 0 && (
                          <span className={styles.barChart__value}>{day.completedTasks}</span>
                        )}
                      </div>
                    </div>
                    <span className={styles.barChart__label}>{day.date}</span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No activity data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartCard__title}>Goals Progress</h2>
          <div className={styles.progressList}>
            {analytics.tasksPerGoal.length > 0 ? (
              analytics.tasksPerGoal.map((goal, index) => {
                const percentage = goal.count > 0 ? Math.round((goal.completed / goal.count) * 100) : 0;
                const goalTitle = goal.goalTitle || `Goal ${index + 1}`;
                return (
                  <div key={index} className={styles.progressItem}>
                    <div className={styles.progressItem__header}>
                      <span className={styles.progressItem__title}>{goalTitle}</span>
                      <span className={styles.progressItem__stats}>
                        {goal.completed}/{goal.count} {goal.count === 1 ? 'task' : goal.count < 5 ? 'tasks' : 'tasks'}
                      </span>
                    </div>
                    <div className={styles.progressItem__bar}>
                      <div
                        className={styles.progressItem__fill}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={styles.progressItem__percentage}>{percentage}%</span>
                  </div>
                );
              })
            ) : (
              <p className={styles.emptyState}>No goals available for display</p>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className={styles.additionalStats}>
          <div className={styles.statBox}>
            <h3 className={styles.statBox__title}>Goals Status</h3>
            <div className={styles.statBox__content}>
              <div className={styles.statItem}>
                <span className={styles.statItem__label}>Active</span>
                <span className={`${styles.statItem__value} ${styles.statItem__value_primary}`}>
                  {analytics.activeGoals}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statItem__label}>Completed</span>
                <span className={`${styles.statItem__value} ${styles.statItem__value_success}`}>
                  {analytics.completedGoals}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.statBox}>
            <h3 className={styles.statBox__title}>Deadlines</h3>
            <div className={styles.statBox__content}>
              <div className={styles.statItem}>
                <span className={styles.statItem__label}>Overdue</span>
                <span className={`${styles.statItem__value} ${styles.statItem__value_danger}`}>
                  {analytics.goalsWithDeadlines.overdue}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statItem__label}>Upcoming</span>
                <span className={`${styles.statItem__value} ${styles.statItem__value_warning}`}>
                  {analytics.goalsWithDeadlines.upcoming}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
