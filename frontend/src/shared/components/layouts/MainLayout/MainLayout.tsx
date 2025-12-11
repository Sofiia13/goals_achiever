import type React from "react";
import styles from "./MainLayout.module.scss";
import { Quote } from "../../ui/Quote";
import { TasksList } from "../TasksList";
import { mockTasks } from "../../../../mocks/mockTasks";

export const MainLayout: React.FC = () => {
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
          <TasksList tasks={mockTasks} />
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
