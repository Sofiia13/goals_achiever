import type { Task } from "../../../types/api.types";


export const useAvatarLogic = (
  tasks: Task[],
  setAvatarCurrentPos: (pos: [number, number, number]) => void,
  setAvatarTargetPos: (pos: [number, number, number]) => void,
  setIsAvatarMoving: (moving: boolean) => void,
  setOrbitTargetZ: (z: number) => void
) => {
  const updateAvatarPosition = () => {
    console.log('Avatar update - tasks:', tasks.length);
    console.log('Tasks statuses:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
    
    if (tasks.length === 0) {
      const startPos: [number, number, number] = [200, 15, 0];
      console.log('No tasks, setting avatar to:', startPos);
      setAvatarCurrentPos(startPos);
      setAvatarTargetPos(startPos);
      setIsAvatarMoving(false);
      setOrbitTargetZ(0);
      return;
    }

    const completedTasks = tasks.filter(task => task.status === "done");
    console.log('Completed tasks:', completedTasks.length, completedTasks.map(t => t.id));
    
    const lastCompletedIndex = completedTasks.length > 0 
      ? tasks.findIndex(task => task.id === completedTasks[completedTasks.length - 1].id)
      : -1;

    let currentIndex = lastCompletedIndex >= 0 ? lastCompletedIndex : 0;
    const currentPos: [number, number, number] = 
      currentIndex % 2 !== 0
        ? [-165, 15, currentIndex * -150]
        : [165, 15, currentIndex * -150];

    console.log('Last completed index:', lastCompletedIndex);
    console.log('Current index:', currentIndex, 'Position:', currentPos);

    const nextTask = tasks[currentIndex + 1];
    console.log('Next task:', nextTask ? { id: nextTask.id, title: nextTask.title, status: nextTask.status } : 'none');
    
    if (nextTask && completedTasks.length > 0) {
      const nextIndex = currentIndex + 1;
      const nextPos: [number, number, number] = 
        nextIndex % 2 !== 0
          ? [-170, 15, nextIndex * -150]
          : [170, 15, nextIndex * -150];
      
      console.log('Moving to next position:', nextPos, 'isMoving: true');
      setAvatarCurrentPos(currentPos);
      setAvatarTargetPos(nextPos);
      setIsAvatarMoving(true);
      setOrbitTargetZ(nextPos[2]);
    } else {
      console.log('Staying at current position:', currentPos, 'isMoving: false');
      setAvatarCurrentPos(currentPos);
      setAvatarTargetPos(currentPos);
      setIsAvatarMoving(false);
      setOrbitTargetZ(currentPos[2]);
    }
  };

  return { updateAvatarPosition };
};
