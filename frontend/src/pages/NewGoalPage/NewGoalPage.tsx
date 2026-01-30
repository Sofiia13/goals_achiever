import type React from "react";
import styles from "./NewGoalPage.module.scss";
import { useState } from "react";
import { Slab } from "react-loading-indicators";
import { NavLink, useLocation } from "react-router-dom";
import { AIGenerationForm } from "../../shared/components/layouts/AIGenerationForm";

export const NewGoalPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const isManual = location.pathname === "/goals/manual";

  const colors = ["#2F2418", "#4A3A28", "#6B563F", "#8C7458", "#A89172"];

  return (
    <div className={styles.newGoalPage}>
      {loading && (
        <div className={styles.newGoalPage__loading}>
          <Slab color={colors} />
        </div>
      )}
      <div className={styles.newGoalPage__tabs}>
        <NavLink
          to="/goals"
          end
          className={({ isActive }) =>
            isActive ? styles.newGoalPage__tabActive : styles.newGoalPage__tab
          }
        >
          <h2>AI Goal Generation</h2>
        </NavLink>
        <NavLink
          to="/goals/manual"
          className={({ isActive }) =>
            isActive ? styles.newGoalPage__tabActive : styles.newGoalPage__tab
          }
        >
          <h2>Manual Goal Creation</h2>
        </NavLink>
      </div>
      {!isManual && <AIGenerationForm setLoading={setLoading} />}
      {isManual && <div>Manual goal creation form (coming soon)</div>}
    </div>
  );
};
