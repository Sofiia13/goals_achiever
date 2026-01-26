import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  position: [number, number, number];
  isMoving?: boolean;
};

export const Avatar: React.FC<Props> = ({ position, isMoving = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    timeRef.current += delta;

    const baseY = position[1] + 10; // трохи піднімаємо над станцією
    const bounce = isMoving
      ? Math.sin(timeRef.current * 5) * 3 + 8
      : Math.sin(timeRef.current * 2) * 1 + 6;

    groupRef.current.position.set(position[0], baseY + bounce, position[2]);
    groupRef.current.rotation.y = timeRef.current * 0.6;
  });

  return (
    <group ref={groupRef} position={[position[0], position[1] + 10, position[2]]} scale={[2, 2, 2]}>
      {/* Тіло */}
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[3, 8, 16, 32]} />
        <meshStandardMaterial color="#1f6feb" emissive="#0e3ea8" emissiveIntensity={0.35} metalness={0.35} roughness={0.35} />
      </mesh>
      
      {/* Голова */}
      <mesh castShadow position={[0, 8, 0]}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial color="#4da3ff" emissive="#214f9f" emissiveIntensity={0.25} metalness={0.25} roughness={0.35} />
      </mesh>
      
      {/* Очі */}
      <mesh position={[-1.5, 8.5, 3.2]} frustumCulled={false}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#1f6feb" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[1.5, 8.5, 3.2]} frustumCulled={false}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#1f6feb" emissiveIntensity={0.4} />
      </mesh>
      
      {/* Зіниці */}
      <mesh position={[-1.5, 8.5, 3.9]} frustumCulled={false}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[1.5, 8.5, 3.9]} frustumCulled={false}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Посмішка */}
      <mesh position={[0, 6.5, 3.8]} rotation={[0, 0, 0]} frustumCulled={false}>
        <torusGeometry args={[1.6, 0.25, 16, 100, Math.PI]} />
        <meshStandardMaterial color="#333333" emissive="#111111" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Світло навколо */}
      <pointLight intensity={0.9} distance={50} color="#6cb5ff" />
      
      {/* Тінь */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} frustumCulled={false}>
        <circleGeometry args={[7, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};
