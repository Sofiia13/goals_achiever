import type React from "react";
import styles from "./SidebarItem.module.scss";
import EditImg from "/icons/edit-icon.svg";
import ArrowDownImg from "/icons/arrow-down.svg";
import type { Task } from "../../../types/api.types";
import { useState} from "react";
import { Button } from "../Button";
import { tasksApi } from "../../../api/tasks.api";

type Props = {
  task: Task;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  goalProgress?: number;
};

export const SidebarItem: React.FC<Props> = ({ task, setTasks, goalProgress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState<string>(task.title || "");
  const [draftDescription, setDraftDescription] = useState<string>(
    task.description ?? "",
  );

  const handleStartEditing = () => {
    setDraftTitle(task.title);
    setDraftDescription(task.description || "");
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleSaveChanges = async () => {
    try {
      await tasksApi.updateTaskDetails(task.id, draftTitle, draftDescription);
      if (setTasks) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, title: draftTitle, description: draftDescription }
              : t,
          ),
        );
      }
      setIsEditing(false);
      setIsOpen(false);
    } catch (err) {
      console.error("ERROR UPDATING TASK DETAILS:", err);
      alert("Failed to save changes. Please try again.");
    }
  };

  return (
    <div className={styles.sidebarItem}>
      <div className={styles.sidebarItem__title}>
        {isEditing ? (
          <input
            type="text"
            className={styles.sidebarItem__editInput}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
          />
        ) : (
          <p
            className={styles.sidebarItem__text}
            style={{
              textDecoration: task.status === "done" ? "line-through" : "none",
              opacity: task.status === "done" ? 0.6 : 1,
            }}
          >
            {task.title}
          </p>
        )}

        <img
          src={ArrowDownImg}
          alt="Dropdown"
          className={styles.sidebarItem__editIcon}
          onClick={() => setIsOpen(!isOpen)}
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />

        <img
          src={EditImg}
          alt="Edit"
          className={styles.sidebarItem__editIcon}
          onClick={handleStartEditing}
        />
      </div>

      {isOpen && (
        <div className={styles.sidebarItem__description}>
          {isEditing ? (
            <textarea
              className={styles.sidebarItem__editTextarea}
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
            />
          ) : (
            <p className={styles.sidebarItem__text}>{task.description}</p>
          )}
        </div>
      )}

      {isEditing && (
        <div className={styles.sidebarItem__buttons}>
          <Button
            buttonText="Cancel"
            variant="text"
            className={styles.sidebarItem__cancelButton}
            onClick={() => {
              setDraftTitle(task.title);
              setDraftDescription(task.description || "");
              setIsEditing(false);
              setIsOpen(false);
            }}
          />
          <Button
            buttonText="Save"
            className={styles.sidebarItem__saveButton}
            onClick={handleSaveChanges}
          />
        </div>
      )}
      {goalProgress !== undefined && goalProgress > 0 && (
        <div className={styles.sidebarItem__progress}>
          <div className={styles.sidebarItem__progressBar}>
            <div
              className={styles.sidebarItem__progressFill}
              style={{ width: `${goalProgress}%` }}
            >
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
