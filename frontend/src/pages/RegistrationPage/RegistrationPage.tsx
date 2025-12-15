import type React from "react";
import { useState } from "react";
import { Input } from "../../shared/components/ui/Input";
import styles from "./RegistrationPage.module.scss";
import { AuthForm } from "../../shared/components/layouts/AuthForm";

export const RegistrationPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className={styles.registrationPage}>
      <AuthForm
        title="Create account"
        submitText="Register"
        footerText="Already have an account?"
        footerLinkText="Login"
        footerLinkTo="/login"
      >
        <Input label="First name" placeholder="First name..." value={firstName} onChange={setFirstName} />
        <Input label="Last name" placeholder="Last name..." value={lastName} onChange={setLastName} />
        <Input label="Email" placeholder="Email..." value={email} onChange={setEmail} />
        <Input
          label="Password"
          type="password"
          placeholder="Password..."
          value={password}
          onChange={setPassword}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Confirm password..."
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </AuthForm>
    </div>
  );
};
