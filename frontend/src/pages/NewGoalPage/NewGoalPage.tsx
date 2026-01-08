import type React from "react";
import styles from "./NewGoalPage.module.scss";
import { Input } from "../../shared/components/ui/Input";

export const NewGoalPage: React.FC = () => {
  return (
    <div className={styles.newGoalPage}>
      <h1 className={styles.newGoalPage__title}>
        Write you goal and time duration
      </h1>
      <div>
        <Input
          value=""
          onChange={() => {}}
          placeholder="Tell what you want to achieve"
        />

        <Input
          type="date"
          value=""
          onChange={() => {}}
          placeholder="Set the deadline for your goal"
        />
      </div>
    </div>
  );
};
