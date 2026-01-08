import type React from "react";
import styles from "./ProfilePage.module.scss";
import profileImg from "../../assets/profile.jpg";
import { useAuth } from "../../shared/context/AuthContext";
import { Button } from "../../shared/components/ui/Button";

export const ProfilePage: React.FC = ({}) => {
  const { user, logout } = useAuth();

  return (
    <div className={styles.profilePage}>
      <div className={styles.profilePage__main}>
        <img
          src={profileImg}
          alt={user?.name}
          className={styles.profilePage__img}
        />
        <div className={styles.profilePage__info}>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
      </div>
      <Button variant="default" onClick={logout} buttonText="Logout" />
    </div>
  );
};
