import { useRef } from "react";
import type { Task, Goal } from "../../../types/api.types";

export const useAvatarLogic = (
  tasks: Task[],
  selectedGoal: Goal | undefined,
  avatarCurrentPos: [number, number, number],
  setAvatarCurrentPos: (pos: [number, number, number]) => void,
  setAvatarTargetPos: (pos: [number, number, number]) => void,
  setIsAvatarMoving: (moving: boolean) => void,
  setOrbitTargetZ: (z: number) => void
) => {
  const hasInitializedRef = useRef(false);

  const syncAvatarPosition = (nextPos: [number, number, number]) => {
    const distance = Math.hypot(
      avatarCurrentPos[0] - nextPos[0],
      avatarCurrentPos[1] - nextPos[1],
      avatarCurrentPos[2] - nextPos[2],
    );

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setAvatarCurrentPos(nextPos);
      setAvatarTargetPos(nextPos);
      setIsAvatarMoving(false);
      setOrbitTargetZ(nextPos[2]);
      return;
    }

    if (distance > 1) {
      setAvatarTargetPos(nextPos);
      setIsAvatarMoving(true);
      setOrbitTargetZ(nextPos[2]);
      return;
    }

    setAvatarCurrentPos(nextPos);
    setAvatarTargetPos(nextPos);
    setIsAvatarMoving(false);
    setOrbitTargetZ(nextPos[2]);
  };

  const updateAvatarPosition = () => {
    console.log('Avatar update - tasks:', tasks.length);
    console.log('Tasks statuses:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
    console.log('Current station progress:', selectedGoal?.currentStationProgress);
    
    if (tasks.length === 0) {
      const startPos: [number, number, number] = [160, 15, 0];
      console.log('No tasks, setting avatar to:', startPos);
      syncAvatarPosition(startPos);
      return;
    }

    const stations = tasks.filter(task => task.type !== "daily");
    const completedStations = stations.filter(station => station.status === "done");
    
    console.log('Completed stations:', completedStations.length, completedStations.map(t => t.id));
    
    const lastCompletedIndex = completedStations.length > 0 
      ? stations.findIndex(station => station.id === completedStations[completedStations.length - 1].id)
      : -1;

    const currentStationIndex =
      lastCompletedIndex >= 0
        ? Math.min(lastCompletedIndex + 1, stations.length - 1)
        : 0;
    const nextStationIndex = currentStationIndex + 1;

    const currentStationPos: [number, number, number] = 
      currentStationIndex % 2 !== 0
        ? [-165, 0, currentStationIndex * -150]
        : [165, 0, currentStationIndex * -150];

    const nextStationPos: [number, number, number] = 
      nextStationIndex % 2 !== 0
        ? [-165, 0, nextStationIndex * -150]
        : [165, 0, nextStationIndex * -150];

    const progress = selectedGoal?.currentStationProgress || 0;
    
    if (nextStationIndex < stations.length && progress > 0) {
      const progressRatio = progress / 100;
      
      const avatarPos: [number, number, number] = [
        currentStationPos[0] + (nextStationPos[0] - currentStationPos[0]) * progressRatio,
        currentStationPos[1] + (nextStationPos[1] - currentStationPos[1]) * progressRatio,
        currentStationPos[2] + (nextStationPos[2] - currentStationPos[2]) * progressRatio,
      ];

      console.log(`Avatar between stations ${currentStationIndex}-${nextStationIndex}, progress: ${progress}%`, avatarPos);

      syncAvatarPosition(avatarPos);
    } else if (nextStationIndex >= stations.length) {
      console.log('All stations completed, avatar at last station:', currentStationPos);
      syncAvatarPosition(currentStationPos);
    } else {
      console.log('No progress, avatar at current station:', currentStationPos);
      syncAvatarPosition(currentStationPos);
    }
  };

  return { updateAvatarPosition };
};
