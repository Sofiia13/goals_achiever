import React, { useEffect, useState } from "react";
import styles from "./RoadMap.module.scss";
import { Canvas } from "@react-three/fiber";
import { Station } from "../../ui/Station";
import { OrbitControls } from "@react-three/drei";
import type { Goal, Task } from "../../../types/api.types";
import { goalsApi } from "../../../api/goals.api";
import { tasksApi } from "../../../api/tasks.api";
import { ItemsList } from "../../ui/ItemsList";
import { Modal } from "../../ui/Modal";
import { Bridge } from "../../ui/Bridge";

// type RoadMapProps = {
//   plan: Task[];
// };

export const RoadMap: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (task: Task) => {
    setSelectedTaskId(task.id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    goalsApi.getUserGoals().then((res) => {
      setGoals(res.data);
    });
  }, []);

  useEffect(() => {
    if (!selectedGoalId) return;

    tasksApi.getTasksByGoal(selectedGoalId).then((res) => {
      setTasks(res.data);
    });
  }, [selectedGoalId]);

  return (
    <>
      {isModalOpen && selectedTaskId && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
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
        <div
          className={styles.roadMap}
          style={{ width: "100vw", height: "100vh" }}
        >
          <Canvas
            camera={{ position: [0, 20, 80], fov: 50, near: 0.1, far: 3000 }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[20, 20, 10]} intensity={1} />

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
                    onClick={() => handleOpenModal(task)}
                    active={selectedTaskId === task.id}
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
