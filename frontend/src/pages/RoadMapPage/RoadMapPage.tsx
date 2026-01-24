import React, { useEffect, useState } from "react";
import styles from "./RoadMapPage.module.scss";
import { SideBar } from "../../shared/components/layouts/Sidebar";
import { RoadMap } from "../../shared/components/layouts/RoadMap";
import type { Task } from "../../shared/types/api.types";
import { tasksApi } from "../../shared/api/tasks.api";

export const RoadMapPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  useEffect(() => {
      if (!selectedGoalId) return;
  
      tasksApi.getTasksByGoal(selectedGoalId).then((res) => {
        setTasks(res.data);
      });
    }, [selectedGoalId]);

  return (
    <div className={styles.roadMapPage}>
      <SideBar tasks={tasks} />
      <RoadMap tasks={tasks} setTasks={setTasks} selectedGoalId={selectedGoalId} setSelectedGoalId={setSelectedGoalId} />
    </div>
  );
};
