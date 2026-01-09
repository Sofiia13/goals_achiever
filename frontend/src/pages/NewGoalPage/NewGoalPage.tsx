import type React from "react";
import styles from "./NewGoalPage.module.scss";
import { Input } from "../../shared/components/ui/Input";
import { useState } from "react";

export const NewGoalPage: React.FC = () => {
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");

  return (
    <div className={styles.newGoalPage}>
      <h1 className={styles.newGoalPage__title}>
        Write you goal and the deadline to achieve it
      </h1>
      <div className={styles.newGoalPage__inputs}>
        <Input
          value={goal}
          onChange={setGoal}
          className={styles.newGoalPage__goalInput}
          placeholder="Tell what you want to achieve"
        />

        <Input
          type="date"
          value={deadline}
          onChange={setDeadline}
          className={styles.newGoalPage__dateInput}
        />
      </div>
    </div>
  );
};
