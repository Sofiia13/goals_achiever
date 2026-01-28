import React from "react";
import styles from "./Sidebar.module.scss";
import type { Task, Goal } from "../../../types/api.types";
import { SidebarItem } from "../../ui/SidebarItem";

type Props = {
  tasks: Task[];
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedGoal?: Goal;
};

export const SideBar: React.FC<Props> = ({ tasks, setTasks, selectedGoal }) => {
  const stations = tasks.filter(t => t.type !== "daily");
  const currentStationIndex = stations.findIndex(station => station.status !== "done");
  
  const getProgressForStation = (task: Task, index: number) => {
    if (task.type === "daily") return undefined;

    if (index < currentStationIndex) {
      return 100;
    }

    if (index === currentStationIndex) {
      return selectedGoal?.currentStationProgress;
    }
    return 0;
  };

  return (
    <div className={styles.sidebar}>
      {tasks.map((task, index) => (
        <div key={task.id} className={styles.sidebar__task}>
          <SidebarItem 
            task={task} 
            setTasks={setTasks} 
            goalProgress={getProgressForStation(task, index)}
          />
        </div>
      ))}
    </div>
  );
};
