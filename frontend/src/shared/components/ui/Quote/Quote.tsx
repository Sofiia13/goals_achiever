import type React from "react";
import styles from "./Quote.module.scss";

export const Quote: React.FC = () => {
  return (
    <div className={styles.quote}>
      Persistence is the quality of winners.
      <br />
      Successful people never, never give up.
    </div>
  );
};
