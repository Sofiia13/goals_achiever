import type React from "react";
import styles from "./NewGoalPage.module.scss";
import { Input } from "../../shared/components/ui/Input";
import { useState } from "react";
import { Button } from "../../shared/components/ui/Button";
import { aiApi } from "../../shared/api/ai.api";
import { Slab } from "react-loading-indicators";
import { useNavigate } from "react-router-dom";

export const NewGoalPage: React.FC = () => {
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [deadline, setDeadline] = useState("");
  const [plan, setPlan] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateGoal = async () => {
    if (!goal || !deadline) {
      alert("Please fill in goal and deadline");
      return;
    }

    setLoading(true);

    try {
      const { data } = await aiApi.generatePlan({ goal, deadline, context });
      setPlan(data);
      
      if (data?.id) {
        navigate(`/roadmaps/${data.id}`);
      } else {
        navigate("/roadmaps");
      }

      setGoal("");
      setContext("");
      setDeadline("");
    } catch (err: any) {
      console.error(
        "GENERATION ERROR:",
        err.response?.data?.message || err.message,
      );
      alert(err.response?.data?.message || "Помилка генерації плану");
    } finally {
      setLoading(false);
    }
  };

  const colors = ["#2F2418", "#4A3A28", "#6B563F", "#8C7458", "#A89172"];

  return (
    <div className={styles.newGoalPage}>
      {loading && (
        <div className={styles.newGoalPage__loading}>
          <Slab color={colors} />
        </div>
      )}
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
          <h2>Plan is generated</h2>
        </div>
      )}
    </div>
  );
};
