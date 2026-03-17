import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { MainLayout } from "../shared/components/layouts/MainLayout";
import { Header } from "../shared/components/ui/Header";
import styles from "./App.module.scss";
import { NewGoalPage } from "../pages/NewGoalPage/NewGoalPage";
import { RegistrationPage } from "../pages/RegistrationPage";
import { LoginPage } from "../pages/LoginPage";
import { ProfilePage } from "../pages/ProfilePage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { RoadMapPage } from "../pages/RoadMapPage";
import { AchievementNotifier } from "../shared/components/ui/AchievementNotifier";
import { useAuth } from "../shared/context/AuthContext";

function App() {
  const location = useLocation();
  const { user, isAuthChecked } = useAuth();

  const hideHeaderRoutes = ["/", "/login"];
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname) && !!user;

  const privateRoute = (element: JSX.Element) => {
    if (!isAuthChecked) return null;
    return user ? element : <Navigate to="/login" replace />;
  };

  const publicRoute = (element: JSX.Element) => {
    if (!isAuthChecked) return null;
    return user ? <Navigate to="/tasks" replace /> : element;
  };

  return (
    <div className={styles.app}>
      {shouldShowHeader && <Header />}
      <AchievementNotifier />

      <Routes>
        <Route path="/" element={publicRoute(<RegistrationPage />)} />
        <Route path="/login" element={publicRoute(<LoginPage />)} />
        <Route path="/tasks" element={privateRoute(<MainLayout />)} />
        <Route path="/goals" element={privateRoute(<NewGoalPage />)} />
        <Route path="/goals/manual" element={privateRoute(<NewGoalPage />)} />
        <Route path="/profile" element={privateRoute(<ProfilePage />)} />
        <Route path="/roadmaps" element={privateRoute(<RoadMapPage />)} />
        <Route path="/roadmaps/:goalId" element={privateRoute(<RoadMapPage />)} />
        <Route path="/analytics" element={privateRoute(<AnalyticsPage />)} />
        <Route path="*" element={<Navigate to={user ? "/tasks" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
