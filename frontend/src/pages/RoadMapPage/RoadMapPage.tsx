import React, { useEffect, useState } from "react";
import styles from "./RoadMapPage.module.scss";
import { SideBar } from "../../shared/components/layouts/Sidebar";
import { RoadMap } from "../../shared/components/layouts/RoadMap";
import type { Task } from "../../shared/types/api.types";
import { tasksApi } from "../../shared/api/tasks.api";
import { useParams, useNavigate } from "react-router-dom";

export const RoadMapPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const { goalId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const parsed = goalId ? Number(goalId) : null;
    if (parsed && !Number.isNaN(parsed)) {
      setSelectedGoalId(parsed);
    }
  }, [goalId]);

  useEffect(() => {
    if (selectedGoalId == null) return;

    navigate(`/roadmaps/${selectedGoalId}`, { replace: true });

    tasksApi.getTasksByGoal(selectedGoalId).then((res) => {
      const nonDailyTasks = res.data.filter(
        (task: Task) => task.type !== "daily",
      );
      setTasks(nonDailyTasks);
    });
  }, [selectedGoalId, navigate]);

  return (
    <div className={styles.roadMapPage}>
      <SideBar tasks={tasks} setTasks={setTasks} />
      <RoadMap
        tasks={tasks}
        setTasks={setTasks}
        selectedGoalId={selectedGoalId}
        setSelectedGoalId={setSelectedGoalId}
      />
    </div>
  );
};
