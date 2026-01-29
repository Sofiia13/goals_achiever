import type React from "react";
import styles from "./MoneyItem.module.scss";

type Props = {
  money: number;
};

export const MoneyItem: React.FC<Props> = ({ money }) => {
  return <div className={styles.moneyItem}>{money} coins</div>;
};
