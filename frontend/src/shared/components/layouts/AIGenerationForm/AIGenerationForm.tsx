import { useState } from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import styles from "./AIGenerationForm.module.scss";
import { useNavigate } from "react-router-dom";
import { aiApi } from "../../../api/ai.api";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AIGenerationForm: React.FC<Props> = ({ setLoading }) => {
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [deadline, setDeadline] = useState("");
  const [plan, setPlan] = useState<string | null>(null);

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

      window.dispatchEvent(new Event("moneyUpdated"));

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

  return (
    <div className={styles.aiGenerationForm}>
      <h1 className={styles.aiGenerationForm__title}>
        Write you goal and the deadline to achieve it
      </h1>
      <div className={styles.aiGenerationForm__inputs}>
        <Input
          value={goal}
          onChange={setGoal}
          className={styles.aiGenerationForm__goalInput}
          placeholder="Tell what you want to achieve"
        />

        <Input
          type="date"
          value={deadline}
          onChange={setDeadline}
          className={styles.aiGenerationForm__dateInput}
        />
      </div>
      <Input
        textarea
        value={context}
        onChange={setContext}
        className={styles.aiGenerationForm__goalContextInput}
        placeholder="Give some context about your goal"
      />

      <Button
        className={styles.aiGenerationForm__createButton}
        buttonText="Generate plan"
        onClick={handleCreateGoal}
      ></Button>

      {plan && (
        <div className={styles.aiGenerationForm__plan}>
          <h2>Plan is generated</h2>
        </div>
      )}
    </div>
  );
};
