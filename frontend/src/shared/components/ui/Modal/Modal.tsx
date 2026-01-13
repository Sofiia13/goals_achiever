import React, { useEffect } from "react";
import styles from "./Modal.module.scss";
import { Button } from "../Button";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modal__title}>{title}</h2>
        <p className={styles.modal__content}>{children}</p>
        <Button
          buttonText="Okay"
          onClick={onClose}
          className={styles.modal__button}
        />
      </div>
    </div>
  );
};
