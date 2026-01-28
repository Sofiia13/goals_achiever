import type React from "react";
import { useEffect, useState } from "react";
import styles from "./MainLayout.module.scss";
import { Quote } from "../../ui/Quote";
import { TasksList } from "../TasksList";
import type { Task, Goal } from "../../../types/api.types";
import { tasksApi } from "../../../api/tasks.api";
import { goalsApi } from "../../../api/goals.api";
import { aiApi } from "../../../api/ai.api";
import { useAuth } from "../../../context/AuthContext";

export const MainLayout: React.FC = () => {
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    goalsApi.getUserGoals().then((res) => {
      setGoals(res.data);
      if (res.data.length > 0) {
        setSelectedGoalId(res.data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedGoalId) return;

    setLoading(true);
    tasksApi
      .getDailyTasks(selectedGoalId)
      .then((res) => {
        setDailyTasks(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load daily tasks:", err);
        setLoading(false);
      });
  }, [selectedGoalId]);

  const handleGenerateDailyTasks = async () => {
    if (!selectedGoalId) return;

    setGenerating(true);
    try {
      await aiApi.generateDailyTasks(selectedGoalId);
      const res = await tasksApi.getDailyTasks(selectedGoalId);
      setDailyTasks(res.data || []);
    } catch (err) {
      console.error("Failed to generate daily tasks:", err);
      alert("Failed to generate daily tasks. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.mainLayout}>
      <div className={styles.mainLayout__topSection}>
        <h1 className={styles.mainLayout__heading}>
          Hello, {user?.name || "Stranger"}
        </h1>
        <div className={styles.mainLayout__quote}>
          <Quote />
        </div>
      </div>
      <div className={styles.mainLayout__bottomSection}>
        <div className={styles.mainLayout__tasksList}>
          {goals.length > 0 && (
            <div className={styles.mainLayout__goalTabs}>
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  className={`${styles.mainLayout__goalTab} ${
                    selectedGoalId === goal.id
                      ? styles.mainLayout__goalTab_active
                      : ""
                  }`}
                  onClick={() => setSelectedGoalId(goal.id)}
                >
                  {goal.title}
                </button>
              ))}
            </div>
          )}

          <div className={styles.mainLayout__tasksHeader}>
            <p className={styles.mainLayout__tasksList__title}>
              Your tasks today:
            </p>
          </div>
          {loading ? <p>Loading...</p> : <TasksList tasks={dailyTasks} />}
        </div>
        <div className={styles.mainLayout__goalProgress}>
          <p className={styles.mainLayout__daysLeft}>
            67 days left to reach the goal
          </p>
        </div>
      </div>
    </div>
  );
};
