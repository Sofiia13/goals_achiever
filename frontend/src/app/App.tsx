import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../shared/components/layouts/MainLayout";
import { Header } from "../shared/components/ui/Header";
import styles from "./App.module.scss";
import { NewGoalPage } from "../pages/NewGoalPage/NewGoalPage";

function App() {
  return (
    <div className={styles.app}>
      <Header />

      <Routes>
        <Route path="/tasks" element={<MainLayout />} />
        <Route path="/goals" element={<NewGoalPage />} />
      </Routes>
    </div>
  );
}

export default App;
