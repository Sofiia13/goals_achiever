import React from "react";
import styles from "./RoadMap.module.scss";
import { Canvas } from "@react-three/fiber";
import { Station } from "../../ui/Station";
import { OrbitControls, Sky } from "@react-three/drei";

export const RoadMap: React.FC = () => {
  return (
    <div className={styles.roadMap} style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 20, 80], fov: 50, near: 0.1, far: 3000 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[20, 20, 10]} intensity={1} />

        {/* станції одна за одною */}
        <Station position={[-50, 0, 0]} scale={[0.1, 0.1, 0.1]} />
        <Station position={[-20, 0, 0]} scale={[0.1, 0.1, 0.1]} />
        <Station position={[0, 0, 0]} scale={[0.1, 0.1, 0.1]} />
        <Station position={[50, 0, -200]} scale={[0.1, 0.1, 0.1]} />
        <Station position={[100, 0, -600]} scale={[0.1, 0.1, 0.1]} />

      

        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
};
