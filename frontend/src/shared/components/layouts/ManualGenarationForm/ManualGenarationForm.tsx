import type React from "react";
import styles from "./ManualGenarationForm.module.scss";
import { Input } from "../../ui/Input";
import { useState } from "react";
import type { Task } from "../../../types/api.types";
import { Button } from "../../ui/Button";

export const ManualGenarationForm: React.FC = () => {
  const [goal, setGoal] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  return (
    <div className={styles.manualGenarationForm}>
      <Input
        value={goal}
        onChange={setGoal}
        className={styles.manualGenarationForm__goalInput}
        placeholder="Tell what you want to achieve"
      />
      <Button
        buttonText="Add Task"
        variant="text"
        icon={
          <img
            src="/icons/add-task.svg"
            alt="add"
          />
        }
      />
    </div>
  );
};
