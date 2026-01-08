import type React from "react";
import styles from "./ProfilePage.module.scss";
import profileImg from "../../assets/profile.jpg";
import { useAuth } from "../../shared/context/AuthContext";
import { Button } from "../../shared/components/ui/Button";

type Props = {
  // userId?: string;
  // userName?: string;
  // userEmail?: string;
};

export const ProfilePage: React.FC<Props> = ({}) => {
  const { user, setUser, logout } = useAuth();

  

  return (
    <div className={styles.profilePage}>
      <img src={profileImg} alt={user?.name} />
      <div className={styles.profilePage__info}>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
      </div>
      <Button variant="default" onClick={logout} buttonText="Logout" />
    </div>
  );
};
