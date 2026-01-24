import React from "react";
import styles from "./Sidebar.module.scss";
import type { Task } from "../../../types/api.types";

type Props = {
  tasks: Task[];
};

export const SideBar: React.FC<Props> = ({ tasks }) => {
  return (
    <div className={styles.sidebar}>
      {tasks.map((task) => (
        <div key={task.id} className={styles.sidebar__task}>
          {task.title}
        </div>
      ))}
    </div>
  );
};
