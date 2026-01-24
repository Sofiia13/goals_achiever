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
import * as THREE from "three";

const DEFAULT_CAMERA_POS: [number, number, number] = [-50, 200, 500];
const DEFAULT_CAMERA_LOOK: [number, number, number] = [0, 0, 0];

type CameraMode = "idle" | "toTask" | "reset";

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

export const RoadMap: React.FC<Props> = ({ tasks, selectedGoalId, setSelectedGoalId }) => {
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

  const resetCamera = () => {
    setCameraMode("reset");
    setCameraTarget(DEFAULT_CAMERA_POS);
    setCameraLookAt(DEFAULT_CAMERA_LOOK);
  };

  const handleMoveToTask = (task: Task, pos: [number, number, number]) => {
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
    }
    if (mode === "reset") {
      setSelectedTaskId(null);
      setPendingTaskId(null);
    }
    stopCamera();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
    setPendingTaskId(null);
    resetCamera();
  };

  useEffect(() => {
    goalsApi.getUserGoals().then((res) => {
      setGoals(res.data);
    });
  }, []);

  useEffect(() => {
    setSelectedTaskId(null);
    setPendingTaskId(null);
    resetCamera();
    setIsModalOpen(false);
  }, [selectedGoalId]);

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

            {/* станції одна за одною */}
            {/* <Station position={[-50, 0, 0]} scale={[0.1, 0.1, 0.1]} /> */}
            {/* <Station position={[-20, 0, 0]} scale={[0.1, 0.1, 0.1]} />
        <Station position={[0, 0, 0]} scale={[0.1, 0.1, 0.1]} />
        <Station position={[50, 0, -200]} scale={[0.1, 0.1, 0.1]} />
        <Station position={[100, 0, -600]} scale={[0.1, 0.1, 0.1]} /> */}

            <OrbitControls target={[0, 0, 0]} />
          </Canvas>
        </div>
      </div>
    </>
  );
};
