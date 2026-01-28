import type { Task, Goal } from "../../../types/api.types";

export const useAvatarLogic = (
  tasks: Task[],
  selectedGoal: Goal | undefined,
  setAvatarCurrentPos: (pos: [number, number, number]) => void,
  setAvatarTargetPos: (pos: [number, number, number]) => void,
  setIsAvatarMoving: (moving: boolean) => void,
  setOrbitTargetZ: (z: number) => void
) => {
  const updateAvatarPosition = () => {
    console.log('Avatar update - tasks:', tasks.length);
    console.log('Tasks statuses:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
    console.log('Current station progress:', selectedGoal?.currentStationProgress);
    
    if (tasks.length === 0) {
      const startPos: [number, number, number] = [160, 15, 0];
      console.log('No tasks, setting avatar to:', startPos);
      setAvatarCurrentPos(startPos);
      setAvatarTargetPos(startPos);
      setIsAvatarMoving(false);
      setOrbitTargetZ(0);
      return;
    }

    // Фільтруємо тільки станції (не дейлі таски)
    const stations = tasks.filter(task => task.type !== "daily");
    const completedStations = stations.filter(station => station.status === "done");
    
    console.log('Completed stations:', completedStations.length, completedStations.map(t => t.id));
    
    // Індекс поточної станції (останньої завершеної)
    const lastCompletedIndex = completedStations.length > 0 
      ? stations.findIndex(station => station.id === completedStations[completedStations.length - 1].id)
      : -1;

    // Індекс наступної станції
    const currentStationIndex = lastCompletedIndex >= 0 ? lastCompletedIndex : 0;
    const nextStationIndex = currentStationIndex + 1;

    // Позиції станцій
    const currentStationPos: [number, number, number] = 
      currentStationIndex % 2 !== 0
        ? [-165, 0, currentStationIndex * -150]
        : [165, 0, currentStationIndex * -150];

    const nextStationPos: [number, number, number] = 
      nextStationIndex % 2 !== 0
        ? [-165, 0, nextStationIndex * -150]
        : [165, 0, nextStationIndex * -150];

    // Якщо є прогрес і є наступна станція
    const progress = selectedGoal?.currentStationProgress || 0;
    
    if (nextStationIndex < stations.length && progress > 0) {
      // Розраховуємо позицію аватара між двома станціями
      const progressRatio = progress / 100;
      
      const avatarPos: [number, number, number] = [
        currentStationPos[0] + (nextStationPos[0] - currentStationPos[0]) * progressRatio,
        currentStationPos[1] + (nextStationPos[1] - currentStationPos[1]) * progressRatio,
        currentStationPos[2] + (nextStationPos[2] - currentStationPos[2]) * progressRatio,
      ];

      console.log(`Avatar between stations ${currentStationIndex}-${nextStationIndex}, progress: ${progress}%`, avatarPos);
      
      setAvatarCurrentPos(avatarPos);
      setAvatarTargetPos(avatarPos);
      setIsAvatarMoving(false);
      setOrbitTargetZ(avatarPos[2]);
    } else if (nextStationIndex >= stations.length) {
      console.log('All stations completed, avatar at last station:', currentStationPos);
      setAvatarCurrentPos(currentStationPos);
      setAvatarTargetPos(currentStationPos);
      setIsAvatarMoving(false);
      setOrbitTargetZ(currentStationPos[2]);
    } else {
      console.log('No progress, avatar at current station:', currentStationPos);
      setAvatarCurrentPos(currentStationPos);
      setAvatarTargetPos(currentStationPos);
      setIsAvatarMoving(false);
      setOrbitTargetZ(currentStationPos[2]);
    }
  };

  return { updateAvatarPosition };
};
