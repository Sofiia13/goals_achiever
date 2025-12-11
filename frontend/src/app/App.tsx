import { MainLayout } from "../shared/components/layouts/MainLayout";
import { Header } from "../shared/components/ui/Header";
import styles from "./App.module.scss";

function App() {
  return (
    <div className={styles.app}>
      <Header />

      <MainLayout />
    </div>
  );
}

export default App;
