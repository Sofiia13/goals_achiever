import type React from "react";
import styles from "./NewGoalPage.module.scss";
import { Input } from "../../shared/components/ui/Input";

export const NewGoalPage: React.FC = () => {
  return (
    <div className={styles.newGoalPage}>
      <h1 className={styles.newGoalPage__title}>
        Write you goal and time duration
      </h1>
      <Input
        value=""
        onChange={() => {}}
        placeholder="Tell what you want to achieve"
      />
    </div>
  );
};
