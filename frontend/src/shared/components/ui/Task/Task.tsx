import React, { useState } from "react";
import styles from "./Task.module.scss";

export const Task: React.FC = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div className={styles.task}>
      <p className={`${styles.task__text} ${checked ? styles["task__text--done"] : ""}`}>
        Some task
      </p>

      <label className={styles.task__checkbox}>
        <input
          type="checkbox"
          className={styles.task__input}
          checked={checked}
          onChange={() => setChecked(!checked)}
        />
        <span className={styles.task__box}></span>
      </label>
    </div>
  );
};
