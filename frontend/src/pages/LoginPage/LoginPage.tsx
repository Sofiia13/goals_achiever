import type React from "react";
import { useState } from "react";
import { Input } from "../../shared/components/ui/Input";
import styles from "./LoginPage.module.scss";
import { AuthForm } from "../../shared/components/layouts/AuthForm";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../shared/api/auth.api";
import { useAuth } from "../../shared/context/AuthContext";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleLogin = async () => {
    try {
      const { data } = await authApi.login({ email, password });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Оновлюємо контекст після логіну
      await refreshUser();

      navigate("/tasks");
    } catch (err: any) {
      console.error("LOGIN ERROR:", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "Помилка логіну");
    }
  };

  return (
    <div className={styles.page}>
      <AuthForm
        title="Welcome back"
        submitText="Login"
        onSubmit={handleLogin}
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
