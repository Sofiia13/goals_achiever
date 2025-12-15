import type React from "react";
import { useState } from "react";
import { Input } from "../../shared/components/ui/Input";
import styles from "./LoginPage.module.scss";
import { AuthForm } from "../../shared/components/layouts/AuthForm";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    console.log("Login data:", { email, password });
    // тут можна викликати API для логіну
  };

  return (
    <div className={styles.page}>
      <AuthForm
        title="Welcome back"
        submitText="Login"
        onSubmit={handleSubmit}
        footerText="Don't have an account?"
        footerLinkText="Register"
        footerLinkTo="/"
      >
        <Input
          label="Email"
          type="email"
          placeholder="Email..."
          value={email}
          onChange={setEmail}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Password..."
          value={password}
          onChange={setPassword}
        />
      </AuthForm>
    </div>
  );
};
