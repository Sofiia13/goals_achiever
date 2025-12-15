import { Routes, Route, useLocation } from "react-router-dom";
import { MainLayout } from "../shared/components/layouts/MainLayout";
import { Header } from "../shared/components/ui/Header";
import styles from "./App.module.scss";
import { NewGoalPage } from "../pages/NewGoalPage/NewGoalPage";
import { RegistrationPage } from "../pages/RegistrationPage";
import { LoginPage } from "../pages/LoginPage";

function App() {
  const location = useLocation();

  const hideHeaderRoutes = ["/", "/login"];
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <div className={styles.app}>
      {shouldShowHeader && <Header />}

      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tasks" element={<MainLayout />} />
        <Route path="/goals" element={<NewGoalPage />} />
      </Routes>
    </div>
  );
}

export default App;
