import type React from "react";
import styles from "./Input.module.scss";

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  label?: string;
  textarea?: boolean;
  className?: string;
  id?: string;
};

export const Input: React.FC<InputProps> = ({
  onChange,
  value,
  placeholder = "",
  type = "text",
  textarea = false,
  label = "",
  className = "",
  id,
}) => {
  const inputClass = `${styles.input} ${className}`;

  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      {textarea ? (
        <textarea
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={inputClass}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </>
  );
};
