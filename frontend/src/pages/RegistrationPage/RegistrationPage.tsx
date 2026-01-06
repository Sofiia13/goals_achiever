import type React from "react";
import { useState } from "react";
import { Input } from "../../shared/components/ui/Input";
import styles from "./RegistrationPage.module.scss";
import { AuthForm } from "../../shared/components/layouts/AuthForm";
import { authApi } from "../../shared/api/auth.api";
import { useNavigate } from "react-router-dom";

export const RegistrationPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const { data } = await authApi.register({
        email,
        password,
        firstName,
        lastName,
      });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      navigate("/login");
    } catch (err: any) {
      console.error(
        "REGISTRATION ERROR:",
        err.response?.data?.message || err.message
      );
      alert(err.response?.data?.message || "Помилка реєстрації");
    }
  };

  return (
    <div className={styles.registrationPage}>
      <AuthForm
        title="Create account"
        submitText="Register"
        onSubmit={handleRegister}
        footerText="Already have an account?"
        footerLinkText="Login"
        footerLinkTo="/login"
      >
        <Input
          label="First name"
          placeholder="First name..."
          value={firstName}
          onChange={setFirstName}
        />
        <Input
          label="Last name"
          placeholder="Last name..."
          value={lastName}
          onChange={setLastName}
        />
        <Input
          label="Email"
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
