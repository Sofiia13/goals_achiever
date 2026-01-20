import React, { useState } from "react";
import styles from "./TaskItem.module.scss";
import type { Task } from "../../../types/api.types";

type Props = {
  task: Task;
};

export const TaskItem: React.FC<Props> = ({ task }) => {
  const [checked, setChecked] = useState(task.status === "done");

  return (
    <div className={styles.task}>
      <p
        className={`${styles.task__text} ${
          checked ? styles["task__text--done"] : ""
        }`}
      >
        {task?.title}
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
