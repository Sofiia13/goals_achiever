import type React from "react";
import type { Goal } from "../../../types/api.types";
import { Item } from "../Item/Item";
import styles from "./ItemsList.module.scss";

type ItemsListProps = {
  goals: Goal[];
  selectedGoalId?: number | null;
  onSelect: (goalId: number) => void;
};

export const ItemsList: React.FC<ItemsListProps> = ({
  goals,
  selectedGoalId,
  onSelect,
}) => {
  return (
    <div className={styles.itemsList}>
      {goals.map((goal) => (
        <Item
          key={goal.id}
          goal={goal}
          selectedGoalId={selectedGoalId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
