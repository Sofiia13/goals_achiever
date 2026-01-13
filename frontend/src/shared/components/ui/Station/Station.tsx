import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";

type Props = {
  position?: [number, number, number];
  scale?: [number, number, number];
  onClick?: () => void;
  active?: boolean;
};

export const Station: React.FC<Props> = ({
  position,
  scale,
  onClick,
  active,
}) => {
  const { scene } = useGLTF("/models/floating_island.glb");

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <group
      position={position}
      scale={scale}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <primitive object={clonedScene} />
    </group>
  );
};
