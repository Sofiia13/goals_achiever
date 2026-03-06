import type React from "react";
import styles from "./ManualGenarationForm.module.scss";
import { Input } from "../../ui/Input";
import { useState } from "react";
import type { Task, Goal } from "../../../types/api.types";
import { Button } from "../../ui/Button";
import { goalsApi } from "../../../api/goals.api";
import { tasksApi } from "../../../api/tasks.api";
import { useNavigate } from "react-router-dom";

export const ManualGenarationForm: React.FC = () => {
  const [goal, setGoal] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deadline, setDeadline] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const [isTaskAdding, setIsTaskAdding] = useState(false);
  const [createdGoal, setCreatedGoal] = useState<Goal | null>(null);
  const [isLoadingGoal, setIsLoadingGoal] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const navigate = useNavigate();

  const handleSubmitGoal = async () => {
    if (!goal || !deadline) {
      alert("Please fill in goal and deadline");
      return;
    }

    setIsLoadingGoal(true);
    try {
      const { data } = await goalsApi.createGoal({ title: goal, deadline });
      setCreatedGoal(data);
      setGoal("");
      setDeadline("");
    } catch (error: any) {
      console.error("Error creating goal:", error);
      alert(error.response?.data?.message || "Error creating goal");
    } finally {
      setIsLoadingGoal(false);
    }
  };

  const handleAddTask = async () => {
    if (!taskTitle || !createdGoal) {
      alert("Please fill in task title");
      return;
    }

    setIsAddingTask(true);
    try {
      const { data } = await tasksApi.createTask(createdGoal.id, {
        title: taskTitle,
        description: taskDescription,
      });
      setTasks([...tasks, data]);
      setTaskTitle("");
      setTaskDescription("");
      setIsTaskAdding(false);
    } catch (error: any) {
      console.error("Error adding task:", error);
      alert("Error adding task");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleGoToGoal = () => {
    if (createdGoal) {
      navigate(`/roadmaps/${createdGoal.id}`);
    }
  };

  if (createdGoal) {
    return (
      <div className={styles.manualGenarationForm}>
        <div className={styles.manualGenarationForm__goalSection}>
          <h2 className={styles.manualGenarationForm__goalTitle}>
            {createdGoal.title}
          </h2>
          {createdGoal.deadline && (
            <p className={styles.manualGenarationForm__goalDeadline}>
              Deadline: {new Date(createdGoal.deadline).toLocaleDateString()}
            </p>
          )}
        </div>

        <h3 className={styles.manualGenarationForm__subtitle}>
          Add tasks for your goal
        </h3>

        {isTaskAdding ? (
          <div className={styles.manualGenarationForm__addTask}>
            <div className={styles.manualGenarationForm__taskInputs}>
              <Input
                value={taskTitle}
                onChange={setTaskTitle}
                className={styles.manualGenarationForm__taskTitleInput}
                placeholder="Write task title"
              />

              <Input
                textarea
                value={taskDescription}
                onChange={setTaskDescription}
                className={styles.manualGenarationForm__taskDescriptionInput}
                placeholder="Write task description"
              />
            </div>
            <div className={styles.manualGenarationForm__addTaskButtons}>
              <Button
                variant="text"
                buttonText="Cancel"
                onClick={() => setIsTaskAdding(false)}
              />

              <Button
                buttonText={isAddingTask ? "Adding..." : "Add Task"}
                onClick={handleAddTask}
                disabled={isAddingTask}
              />
            </div>
          </div>
        ) : (
          <Button
            buttonText="Add Task"
            variant="text"
            icon={<img src="/icons/add-task.svg" alt="add" />}
            onClick={() => setIsTaskAdding(true)}
          />
        )}

        {tasks.length > 0 && (
          <div className={styles.manualGenarationForm__tasksList}>
            <h3>Tasks ({tasks.length})</h3>
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          buttonText="Go to Goal"
          onClick={handleGoToGoal}
          className={styles.manualGenarationForm__goToGoalButton}
        />
      </div>
    );
  }

  return (
    <div className={styles.manualGenarationForm}>
      <h1 className={styles.manualGenarationForm__title}>
        Write your goal and create tasks
      </h1>
      <div className={styles.manualGenarationForm__inputs}>
        <Input
          value={goal}
          onChange={setGoal}
          className={styles.manualGenarationForm__goalInput}
          placeholder="Tell what you want to achieve"
        />
        <Input
          type="date"
          value={deadline}
          onChange={setDeadline}
          className={styles.manualGenarationForm__dateInput}
        />
      </div>

      <Button
        buttonText={isLoadingGoal ? "Creating..." : "Create Goal"}
        onClick={handleSubmitGoal}
        disabled={isLoadingGoal}
      />
    </div>
  );
};
