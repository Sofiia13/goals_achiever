import type React from "react";
import styles from "./AuthForm.module.scss";
import { Button } from "../../ui/Button";
import { NavLink } from "react-router-dom";

type AuthFormProps = {
  title: string;
  submitText: string;
  onSubmit?: () => void;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkTo?: string;
};

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  submitText,
  onSubmit,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}) => {
  return (
    <form
      className={styles.authForm}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <h1 className={styles.authForm__title}>{title}</h1>

      <div className={styles.authForm__fields}>{children}</div>

      <Button
        variant="default"
        className={styles.authForm__submitButton}
        buttonText={submitText}
      />

      {footerText && footerLinkTo && (
        <p className={styles.authForm__text}>
          {footerText}{" "}
          <NavLink to={footerLinkTo} className={styles.authForm__link}>
            {footerLinkText}
          </NavLink>
        </p>
      )}
    </form>
  );
};
