import type React from "react";
import styles from "./NewGoalPage.module.scss";
import { Input } from "../../shared/components/ui/Input";
import { useState } from "react";
import { Button } from "../../shared/components/ui/Button";
import { aiApi } from "../../shared/api/ai.api";

export const NewGoalPage: React.FC = () => {
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [deadline, setDeadline] = useState("");
  const [plan, setPlan] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleCreateGoal = async () => {
    if (!goal || !deadline) {
      alert("Please fill in goal and deadline");
      return;
    }

    setLoading(true);

    try {
      const { data } = await aiApi.generatePlan({ goal, deadline, context });
      setPlan(data);
    } catch (err: any) {
      console.error(
        "GENERATION ERROR:",
        err.response?.data?.message || err.message
      );
      alert(err.response?.data?.message || "Помилка генерації плану");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.newGoalPage}>
      <h1 className={styles.newGoalPage__title}>
        Write you goal and the deadline to achieve it
      </h1>
      <div className={styles.newGoalPage__inputs}>
        <Input
          value={goal}
          onChange={setGoal}
          className={styles.newGoalPage__goalInput}
          placeholder="Tell what you want to achieve"
        />

        <Input
          type="date"
          value={deadline}
          onChange={setDeadline}
          className={styles.newGoalPage__dateInput}
        />
      </div>
      <Input
        textarea
        value={context}
        onChange={setContext}
        className={styles.newGoalPage__goalContextInput}
        placeholder="Give some context about your goal"
      />

      <Button
        className={styles.newGoalPage__createButton}
        buttonText="Generate plan"
        onClick={handleCreateGoal}
      ></Button>

      {plan && (
        <div className={styles.newGoalPage__plan}>
          <h2>Generated Plan:</h2>
          <ul>
            {/* {plan.tasks.map((task, i) => (
              <li key={i}>
                <strong>{task.title}</strong> {task.description && `- ${task.description}`}
              </li>
            ))} */}
          </ul>
        </div>
      )}
    </div>
  );
};
