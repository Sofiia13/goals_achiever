import type React from "react";
import styles from "./Button.module.scss";

type ButtonProps = {
  buttonText: string;
  onClick?: () => void;
  variant?: "default" | "text";
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  buttonText,
  onClick,
  variant = "default",
  disabled = false,
  className = "",
  icon,
}) => {
  const buttonClass = `${styles.button} ${
    variant === "text" ? styles.text : ""
  } ${className}`;

  return (
    <button className={buttonClass} onClick={onClick} disabled={disabled}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {buttonText}
    </button>
  );
};
