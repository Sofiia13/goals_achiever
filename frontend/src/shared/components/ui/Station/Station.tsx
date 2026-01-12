import React from "react";
import { useGLTF } from "@react-three/drei";

type Props = {
  position?: [number, number, number];
  scale?: [number, number, number];
};

export const Station: React.FC<Props> = ({
  position = [0, 0, 0],
  scale = [1, 1, 1],
}) => {
  const gltf = useGLTF("/models/floating_island.glb");

  return (
    <primitive
      object={gltf.scene}
      position={position}
      scale={scale}
    />
  );
};
