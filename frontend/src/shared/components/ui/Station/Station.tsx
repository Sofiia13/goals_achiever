import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

type Props = {
  position?: [number, number, number];
  scale?: [number, number, number];
};

export const Station: React.FC<Props> = ({ position, scale }) => {
  const { scene } = useGLTF("/models/floating_island.glb");

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <group position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};
