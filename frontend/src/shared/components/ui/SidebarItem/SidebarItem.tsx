import type React from "react";
import styles from "./SidebarItem.module.scss";
import EditImg from "/icons/edit-icon.svg";
import ArrowDownImg from "/icons/arrow-down.svg";
import type { Task } from "../../../types/api.types";
import { useState } from "react";

type Props = {
  task: Task;
};

export const SidebarItem: React.FC<Props> = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.sidebarItem}>
      <div className={styles.sidebarItem__title}>
        <p>{task.title}</p>

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
        />
      </div>
      {isOpen && (
        <div className={styles.sidebarItem__description}>
          {task.description}
        </div>
      )}
    </div>
  );
};
