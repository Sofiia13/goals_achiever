import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../Modal";
import { useAuth } from "../../../context/AuthContext";
import {
  getAchievements,
  loadAchievementStats,
  type Achievement,
} from "../../../utils/achievements";

const getStorageKey = (userId: string) => `achievement-seen:${userId}`;

export const AchievementNotifier: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Achievement[]>([]);

  const storageKey = useMemo(
    () => (user?.id ? getStorageKey(String(user.id)) : null),
    [user?.id],
  );

  const checkAchievements = useCallback(async (initialize = false) => {
    if (!user || !storageKey) return;

    try {
      const stats = await loadAchievementStats();
      const unlocked = getAchievements(stats).filter((achievement) => achievement.unlocked);
      const seenIds = new Set<string>(
        JSON.parse(localStorage.getItem(storageKey) || "[]") as string[],
      );

      if (initialize) {
        localStorage.setItem(
          storageKey,
          JSON.stringify(unlocked.map((achievement) => achievement.id)),
        );
        return;
      }

      const newAchievements = unlocked.filter(
        (achievement) => !seenIds.has(achievement.id),
      );

      if (newAchievements.length === 0) return;

      localStorage.setItem(
        storageKey,
        JSON.stringify([
          ...new Set([
            ...Array.from(seenIds),
            ...newAchievements.map((achievement) => achievement.id),
          ]),
        ]),
      );

      setQueue((prevQueue) => {
        const existingIds = new Set(prevQueue.map((achievement) => achievement.id));
        const additions = newAchievements.filter(
          (achievement) => !existingIds.has(achievement.id),
        );
        return [...prevQueue, ...additions];
      });
    } catch (error) {
      console.error("Failed to check achievements:", error);
    }
  }, [storageKey, user]);

  useEffect(() => {
    if (!user || !storageKey) {
      setQueue([]);
      return;
    }

    void checkAchievements(true);
  }, [checkAchievements, storageKey, user]);

  useEffect(() => {
    if (!user) return;

    const handleProgressUpdate = () => {
      void checkAchievements(false);
    };

    window.addEventListener("progressUpdated", handleProgressUpdate);
    window.addEventListener("moneyUpdated", handleProgressUpdate);
    window.addEventListener("streakUpdated", handleProgressUpdate);

    return () => {
      window.removeEventListener("progressUpdated", handleProgressUpdate);
      window.removeEventListener("moneyUpdated", handleProgressUpdate);
      window.removeEventListener("streakUpdated", handleProgressUpdate);
    };
  }, [checkAchievements, user]);

  const currentAchievement = queue[0] ?? null;

  return (
    <Modal
      isOpen={!!currentAchievement}
      onClose={() => setQueue((prevQueue) => prevQueue.slice(1))}
      title="Congratulations!"
    >
      {currentAchievement
        ? `${currentAchievement.icon} You achieved ${currentAchievement.title} — ${currentAchievement.subtitle}`
        : undefined}
    </Modal>
  );
};
