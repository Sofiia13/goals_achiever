import type React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Header.module.scss";

const navItems = [
  { label: "Goals", path: "/goals" },
  { label: "Tasks", path: "/tasks" },
  { label: "Roadmaps", path: "/roadmaps" },
  { label: "Analytics", path: "/analytics" },
];

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.header__nav}>
        <ul className={styles.header__list}>
          {navItems.map((item) => (
            <li key={item.label} className={styles.header__item}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.header__link} ${styles.header__linkActive}`
                    : styles.header__link
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.header__user}>
          <svg height="28" width="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
      </nav>
    </header>
  );
};
