import type React from "react";
import styles from "./ProfilePage.module.scss";
import profileImg from "../../assets/profile.jpg";
import { useAuth } from "../../shared/context/AuthContext";

type Props = {
  // userId?: string;
  // userName?: string;
  // userEmail?: string;
};

export const ProfilePage: React.FC<Props> = ({}) => {
  const { user, setUser, logout } = useAuth();

  console.log(user);

  return (
    <div className={styles.profilePage}>
      <img src={profileImg} alt={user?.name} />
      <div className={styles.profilePage__info}>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
      </div>
    </div>
  );
};
