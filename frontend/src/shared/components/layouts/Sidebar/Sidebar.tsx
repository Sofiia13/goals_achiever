import React, { useState } from "react";
import styles from "./Sidebar.module.scss";
import type { Task, Goal } from "../../../types/api.types";
import { SidebarItem } from "../../ui/SidebarItem";
import { Button } from "../../ui/Button";
import { tasksApi } from "../../../api/tasks.api";

type Props = {
  tasks: Task[];
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedGoal?: Goal;
};

export const SideBar: React.FC<Props> = ({ tasks, setTasks, selectedGoal }) => {
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const stations = tasks.filter((t) => t.type !== "daily");
  const currentStationIndex = stations.findIndex(
    (station) => station.status !== "done",
  );

  const handleCreateTask = async () => {
    if (!selectedGoal || !newTaskTitle.trim()) return;

    try {
      const response = await tasksApi.createTask(selectedGoal.id, {
        title: newTaskTitle,
        description: newTaskDescription,
      });

      if (setTasks) {
        setTasks((prevTasks) => [...prevTasks, response.data]);
      }

      setNewTaskTitle("");
      setNewTaskDescription("");
      setIsCreatingTask(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Не вдалося створити таску");
    }
  };

  const handleCancelCreate = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setIsCreatingTask(false);
  };

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

      {isCreatingTask ? (
        <div className={styles.sidebar__newTask}>
          <div className={styles.sidebar__newTaskTitle}>
            <input
              type="text"
              className={styles.sidebar__input}
              placeholder="Name of the task"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.sidebar__newTaskDescription}>
            <textarea
              className={styles.sidebar__textarea}
              placeholder="Description of the task"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
          </div>
          <div className={styles.sidebar__buttons}>
            <Button
              buttonText="Cancel"
              variant="text"
              className={styles.sidebar__cancelButton}
              onClick={handleCancelCreate}
            />
            <Button
              buttonText="Create"
              className={styles.sidebar__saveButton}
              onClick={handleCreateTask}
            />
          </div>
        </div>
      ) : (
        <Button
          buttonText="Add task"
          className={styles.sidebar__addBtn}
          onClick={() => setIsCreatingTask(true)}
        />
      )}
    </div>
  );
};
