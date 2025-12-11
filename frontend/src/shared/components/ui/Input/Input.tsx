import type React from "react";
import styles from "./Input.module.scss";

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
};

export const Input: React.FC<InputProps> = ({
  onChange,
  placeholder = "",
  type = "text",
  className = "",
}) => {
  const inputClass = `${styles.input} ${className}`;

  return (
    <input
      className={inputClass}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
};
