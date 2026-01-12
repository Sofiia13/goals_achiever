import React from "react";
import styles from "./RoadMap.module.scss";
import { Canvas } from "@react-three/fiber";
import { Station } from "../../ui/Station";
import { OrbitControls, Sky } from "@react-three/drei";

export const RoadMap: React.FC = () => {
  return (
    <div className={styles.roadMap} style={{ width: "100vw", height: "100vh" }}>
      {" "}
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50, near: 0.1, far: 1000 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* <Sky sunPosition={[100, 20, 100]} /> */}
        <Station position={[-100, 0, 0]} scale={[0.1, 0.1, 0.1]} />

        <OrbitControls />
      </Canvas>
    </div>
  );
};
