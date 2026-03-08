import type React from "react";
import type { Goal } from "../../../types/api.types";
import styles from "./Item.module.scss";

type ItemProps = {
  goal: Goal;
  onSelect: (goalId: number) => void;
  onDelete?: (goalId: number) => void;
  selectedGoalId?: number | null;
};

export const Item: React.FC<ItemProps> = ({
  goal,
  selectedGoalId,
  onSelect,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`Ви впевнені, що хочете видалити ціль "${goal.title}"?`)) {
      onDelete(goal.id);
    }
  };

  return (
    <div
      className={`${styles.item} ${
        goal.id === selectedGoalId ? styles.item__active : ""
      }`}
      onClick={() => onSelect(goal.id)}
    >
      <p>{goal.title}</p>
      {onDelete && (
        <button
          onClick={handleDelete}
          className={styles.item__deleteBtn}
          title="Видалити ціль"
        >
          ×
        </button>
      )}
    </div>
  );
};
