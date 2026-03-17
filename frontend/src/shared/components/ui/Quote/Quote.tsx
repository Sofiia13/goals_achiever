import type React from "react";
import styles from "./Quote.module.scss";

export const Quote: React.FC = () => {
  return (
    <div className={styles.quote}>
      Believe in the power of small steps—every effort you make today builds the
      bridge to your dreams tomorrow.
    </div>
  );
};
