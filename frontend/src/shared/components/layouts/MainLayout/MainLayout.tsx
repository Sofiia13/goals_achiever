import type React from "react";
import { useEffect, useState } from "react";
import styles from "./MainLayout.module.scss";
import { Quote } from "../../ui/Quote";
import { TasksList } from "../TasksList";
import type { Task } from "../../../types/api.types";
import { tasksApi } from "../../../api/tasks.api";

export const MainLayout: React.FC = () => {
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksApi.getDailyTasks(1).then((res) => {
      setDailyTasks(res.data || []);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to load daily tasks:", err);
      setLoading(false);
    });
  }, []);

  return (
    <div className={styles.mainLayout}>
      <div className={styles.mainLayout__topSection}>
        <h1 className={styles.mainLayout__heading}>Hello, Stranger</h1>
        <div className={styles.mainLayout__quote}>
          <Quote />
        </div>
      </div>
      <div className={styles.mainLayout__bottomSection}>
        <div className={styles.mainLayout__tasksList}>
          <p className={styles.mainLayout__tasksList__title}>
            Your tasks today:
          </p>
          {loading ? <p>Loading...</p> : <TasksList tasks={dailyTasks} />}
        </div>
        <div className={styles.mainLayout__goalProgress}>
          <p className={styles.mainLayout__daysLeft}>
            X days left to reach the goal
          </p>
        </div>
      </div>
    </div>
  );
};
