import type { Task } from "../../../types/api.types";

type CameraMode = "idle" | "toTask" | "reset" | "follow";

export const useCameraHandlers = (
  setCameraTarget: (target: [number, number, number] | null) => void,
  setCameraLookAt: (lookAt: [number, number, number] | null) => void,
  setCameraMode: (mode: CameraMode) => void,
  avatarCurrentPos: [number, number, number],
  avatarTargetPos: [number, number, number],
  isAvatarMoving: boolean,
  setIsModalOpen: (open: boolean) => void,
  setSelectedTaskId: (id: number | null) => void,
  setPendingTaskId: (id: number | null) => void,
  pendingTaskId: number | null
) => {
  const resetCamera = () => {
    setCameraMode("reset");
    setCameraTarget([-50, 200, 500]);
    setCameraLookAt([0, 0, 0]);
  };

  const handleMoveToTask = (task: Task, pos: [number, number, number]) => {
    setSelectedTaskId(task.id);
    setPendingTaskId(task.id);
    setCameraMode("toTask");
    setCameraTarget([pos[0], pos[1] + 60, pos[2] + 180]);
    setCameraLookAt([pos[0], pos[1] + 10, pos[2]]);
  };

  const stopCamera = () => {
    setCameraTarget(null);
    setCameraLookAt(null);
    setCameraMode("idle");
  };

  const handleArrive = (mode: CameraMode) => {
    if (mode === "toTask" && pendingTaskId) {
      setIsModalOpen(true);
      stopCamera();
      return;
    }
    if (mode === "toTask" && !pendingTaskId) {
      stopCamera();
      return;
    }
    if (mode === "reset") {
      setSelectedTaskId(null);
      setPendingTaskId(null);
      stopCamera();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
    setPendingTaskId(null);
    const z = isAvatarMoving ? avatarTargetPos[2] : avatarCurrentPos[2];
    setCameraMode("toTask");
    setCameraTarget([-50, 180, z + 360]);
    setCameraLookAt([0, 0, z]);
  };

  return {
    resetCamera,
    handleMoveToTask,
    stopCamera,
    handleArrive,
    handleCloseModal,
  };
};
