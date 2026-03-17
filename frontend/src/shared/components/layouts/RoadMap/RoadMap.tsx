import React, { useEffect, useState, useCallback } from "react";
import styles from "./RoadMap.module.scss";
import { Canvas } from "@react-three/fiber";
import { Station } from "../../ui/Station";
import { OrbitControls } from "@react-three/drei";
import type { Goal, Task } from "../../../types/api.types";
import { goalsApi } from "../../../api/goals.api";
import { ItemsList } from "../../ui/ItemsList";
import { Modal } from "../../ui/Modal";
import { Bridge } from "../../ui/Bridge";
import { AvatarRig } from "../../ui/Avatar";
import { CameraRig } from "./CameraRig";
import { useAvatarLogic } from "./useAvatarLogic";
import { useCameraHandlers } from "./useCameraHandlers";

// const DEFAULT_CAMERA_POS: [number, number, number] = [-50, 200, 500];
const DEFAULT_CAMERA_POS: [number, number, number] = [-50, 200, 500];

type Props = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedGoalId: number | null;
  setSelectedGoalId: React.Dispatch<React.SetStateAction<number | null>>;
  onDeleteGoal?: (goalId: number) => void;
};

export const RoadMap: React.FC<Props> = ({
  tasks,
  selectedGoalId,
  setSelectedGoalId,
  onDeleteGoal,
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<
    [number, number, number] | null
  >(null);
  const [cameraLookAt, setCameraLookAt] = useState<
    [number, number, number] | null
  >(null);
  const [cameraMode, setCameraMode] = useState<
    "idle" | "toTask" | "reset" | "follow"
  >("idle");
  const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);
  const [orbitTargetZ, setOrbitTargetZ] = useState(0);

  const [avatarCurrentPos, setAvatarCurrentPos] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [avatarTargetPos, setAvatarTargetPos] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [isAvatarMoving, setIsAvatarMoving] = useState(false);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  const { updateAvatarPosition: updateAvatarPositionFn } = useAvatarLogic(
    tasks,
    selectedGoal,
    avatarCurrentPos,
    setAvatarCurrentPos,
    setAvatarTargetPos,
    setIsAvatarMoving,
    setOrbitTargetZ,
  );

  const resetCamera = useCallback(() => {
    setCameraMode("reset");
    setCameraTarget([-50, 200, 500]);
    setCameraLookAt([0, 0, 0]);
  }, []);

  const updateAvatarPosition = useCallback(() => {
    updateAvatarPositionFn();
  }, [updateAvatarPositionFn]);

  const { handleMoveToTask, handleArrive, handleCloseModal } =
    useCameraHandlers(
      setCameraTarget,
      setCameraLookAt,
      setCameraMode,
      avatarCurrentPos,
      avatarTargetPos,
      isAvatarMoving,
      setIsModalOpen,
      setSelectedTaskId,
      setPendingTaskId,
      pendingTaskId,
    );

  useEffect(() => {
    goalsApi.getUserGoals().then((res) => {
      setGoals(res.data);
    });
  }, []);

  const refreshGoals = useCallback(() => {
    goalsApi.getUserGoals().then((res) => {
      setGoals(res.data);
    });
  }, []);

  const handleDeleteGoal = useCallback(
    async (goalId: number) => {
      if (onDeleteGoal) {
        await onDeleteGoal(goalId);
        refreshGoals();
      }
    },
    [onDeleteGoal, refreshGoals],
  );

  useEffect(() => {
    if (!selectedGoalId && goals.length > 0) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId, setSelectedGoalId]);

  useEffect(() => {
    setSelectedTaskId(null);
    setPendingTaskId(null);
    resetCamera();
    setIsModalOpen(false);
  }, [selectedGoalId]);

  useEffect(() => {
    console.log("Avatar update - tasks:", tasks.length);
    console.log(
      "Tasks statuses:",
      tasks.map((t) => ({ id: t.id, title: t.title, status: t.status })),
    );
    updateAvatarPosition();
  }, [tasks]);

  const handleAvatarReachTarget = () => {
    setIsAvatarMoving(false);
    setAvatarCurrentPos(avatarTargetPos);
  };

  return (
    <>
      {isModalOpen && selectedTaskId && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={tasks.find((task) => task.id === selectedTaskId)?.title}
        >
          {tasks.find((task) => task.id === selectedTaskId)?.description}
        </Modal>
      )}
      <div className={styles.roadMapContainer}>
        <ItemsList
          goals={goals}
          selectedGoalId={selectedGoalId}
          onSelect={setSelectedGoalId}
          onDelete={handleDeleteGoal}
        />
        <div className={styles.roadMap} style={{ height: "100vh" }}>
          <Canvas
            camera={{
              position: DEFAULT_CAMERA_POS,
              fov: 50,
              near: 0.1,
              far: 3000,
            }}
          >
            <color attach="background" args={["#f2ebd9"]} />
            <fog attach="fog" args={["#fbf7f2", 500, 1400]} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[20, 40, 20]} intensity={1.15} />

            <CameraRig
              target={cameraTarget}
              lookAt={cameraLookAt}
              mode={cameraMode}
              onArrive={handleArrive}
            />

            {tasks.map((task, index) => {
              const currentPos: [number, number, number] =
                index % 2 !== 0
                  ? [-200, 0, index * -150]
                  : [200, 0, index * -150];

              const nextPos: [number, number, number] =
                index % 2 === 0
                  ? [-200, 0, (index + 1) * -150]
                  : [200, 0, (index + 1) * -150];

              return (
                <React.Fragment key={task.id}>
                  <Station
                    position={currentPos}
                    scale={[0.1, 0.1, 0.1]}
                    onClick={() => handleMoveToTask(task, currentPos)}
                    active={
                      selectedTaskId === task.id || pendingTaskId === task.id
                    }
                  />

                  {index < tasks.length - 1 && (
                    <Bridge start={currentPos} end={nextPos} />
                  )}
                </React.Fragment>
              );
            })}

            <AvatarRig
              currentPosition={avatarCurrentPos}
              targetPosition={avatarTargetPos}
              isMoving={isAvatarMoving}
              onReachTarget={handleAvatarReachTarget}
            />

            <OrbitControls
              target={cameraMode === "idle" ? [0, 0, 0] : [0, 0, orbitTargetZ]}
            />
          </Canvas>
        </div>
      </div>
    </>
  );
};
