import type React from "react";
import type { Goal } from "../../../types/api.types";
import styles from "./Item.module.scss";

type ItemProps = {
  goal: Goal;
  onSelect: (goalId: number) => void;
  selectedGoalId?: number | null;
};

export const Item: React.FC<ItemProps> = ({
  goal,
  selectedGoalId,
  onSelect,
}) => {
  return (
    <div
      className={`${styles.item} ${
        goal.id === selectedGoalId ? styles.item__active : ""
      }`}
      onClick={() => onSelect(goal.id)}
    >
      <p>{goal.title}</p>
    </div>
  );
};
