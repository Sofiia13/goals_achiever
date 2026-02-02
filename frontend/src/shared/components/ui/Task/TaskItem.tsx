import React, { useState } from "react";
import styles from "./TaskItem.module.scss";
import type { Task } from "../../../types/api.types";
import { tasksApi } from "../../../api/tasks.api";
import { Modal } from "../Modal";

type Props = {
  task: Task;
};

export const TaskItem: React.FC<Props> = ({ task }) => {
  const [checked, setChecked] = useState(task.status === "done");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coinsReward, setCoinsReward] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);

  const handleStatusChange = async () => {
    const newStatus = checked ? "pending" : "done";
    setLoading(true);

    try {
      const response = await tasksApi.updateTaskStatus(task.id, newStatus);
      setChecked(!checked);
      
      if (newStatus === "done" && response.data.coinsRewarded > 0) {
        setCoinsReward(response.data.coinsRewarded);
        setShowReward(true);
        setTimeout(() => setShowReward(false), 2000);
        window.dispatchEvent(new Event("moneyUpdated"));
      } else {
        window.dispatchEvent(new Event("moneyUpdated"));
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
      setChecked(checked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={task.title}
        >
          {task.description || "No description provided"}
        </Modal>
      )}
      <div className={styles.task}>
        <p
          className={`${styles.task__text} ${
            checked ? styles["task__text--done"] : ""
          }`}
          onClick={() => setIsModalOpen(true)}
        >
          {task?.title}
        </p>

        <label className={styles.task__checkbox}>
          <input
            type="checkbox"
            className={styles.task__input}
            checked={checked}
            onChange={handleStatusChange}
            disabled={loading}
            onClick={(e) => e.stopPropagation()}
          />
          <span className={styles.task__box}></span>
        </label>

        {showReward && coinsReward && (
          <div className={styles.task__reward}>
            +{coinsReward} 💰
          </div>
        )}
      </div>
    </>
  );
};
