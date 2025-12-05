import type React from "react";
import type { Task } from "../../../types/api.types";
import { TaskItem } from "../../ui/Task/Task";
import styles from "./TasksList.module.scss";

type Props = {
  tasks: Task[];
};

export const TasksList: React.FC<Props> = ({ tasks }) => {
  return (
    <div className={styles.tasksList}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};
