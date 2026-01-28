import React, { useEffect, useRef, useState } from "react";
import styles from "./RoadMap.module.scss";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Station } from "../../ui/Station";
import { OrbitControls } from "@react-three/drei";
import type { Goal, Task } from "../../../types/api.types";
import { goalsApi } from "../../../api/goals.api";
import { ItemsList } from "../../ui/ItemsList";
import { Modal } from "../../ui/Modal";
import { Bridge } from "../../ui/Bridge";
import { AvatarRig } from "../../ui/Avatar";
import * as THREE from "three";

const DEFAULT_CAMERA_POS: [number, number, number] = [-50, 200, 500];
const DEFAULT_CAMERA_LOOK: [number, number, number] = [0, 0, 0];

type CameraMode = "idle" | "toTask" | "reset" | "follow";

const CameraRig: React.FC<{
  target: [number, number, number] | null;
  lookAt: [number, number, number] | null;
  mode: CameraMode;
  onArrive?: (mode: CameraMode) => void;
}> = ({ target, lookAt, mode, onArrive }) => {
  const { camera } = useThree();
  const arrivedRef = useRef(false);

  useEffect(() => {
    arrivedRef.current = false;
  }, [target, mode]);

  useFrame((_, delta) => {
    if (!target || mode === "idle") return;

    const desired = new THREE.Vector3(...target);
    const damp = 1 - Math.exp(-3 * delta);
    camera.position.lerp(desired, damp);

    const look = lookAt
      ? new THREE.Vector3(...lookAt)
      : new THREE.Vector3(0, 0, 0);
    camera.lookAt(look);

    if (!arrivedRef.current && camera.position.distanceTo(desired) < 2) {
      arrivedRef.current = true;
      onArrive?.(mode);
    }
  });

  return null;
};

type Props = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedGoalId: number | null;
  setSelectedGoalId: React.Dispatch<React.SetStateAction<number | null>>;
};

export const RoadMap: React.FC<Props> = ({
  tasks,
  selectedGoalId,
  setSelectedGoalId,
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
  const [cameraMode, setCameraMode] = useState<CameraMode>("idle");
  const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);
  const [orbitTargetZ, setOrbitTargetZ] = useState(0);

  const [avatarCurrentPos, setAvatarCurrentPos] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [avatarTargetPos, setAvatarTargetPos] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [isAvatarMoving, setIsAvatarMoving] = useState(false);

  const resetCamera = () => {
    setCameraMode("reset");
    setCameraTarget(DEFAULT_CAMERA_POS);
    setCameraLookAt(DEFAULT_CAMERA_LOOK);
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
      setSelectedTaskId(pendingTaskId);
      setIsModalOpen(true);
      stopCamera();
      return;
    }
    if (mode === "toTask" && !pendingTaskId) {
      // Повернулася на аватара
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
    // Плавне повернення камери на аватара
    const z = isAvatarMoving ? avatarTargetPos[2] : avatarCurrentPos[2];
    setCameraMode("toTask");
    setCameraTarget([-50, 180, z + 360]);
    setCameraLookAt([0, 0, z]);
  };

  useEffect(() => {
    goalsApi.getUserGoals().then((res) => {
      setGoals(res.data);
    });
  }, []);

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
    console.log('Avatar update - tasks:', tasks.length);
    console.log('Tasks statuses:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
    
    if (tasks.length === 0) {
      // Стартова позиція на першій станції
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
            <color attach="background" args={["#f9f4ef"]} />
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

            <OrbitControls target={[0, 0, orbitTargetZ]} />
          </Canvas>
        </div>
      </div>
    </>
  );
};
