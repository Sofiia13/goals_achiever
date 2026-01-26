import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Avatar } from "./Avatar";

type Props = {
  currentPosition: [number, number, number];
  targetPosition: [number, number, number];
  isMoving: boolean;
  onReachTarget?: () => void;
};

export const AvatarRig: React.FC<Props> = ({
  currentPosition,
  targetPosition,
  isMoving,
  onReachTarget,
}) => {
  const posRef = useRef<THREE.Vector3>(new THREE.Vector3(...currentPosition));
  const [displayPos, setDisplayPos] = useState<[number, number, number]>(currentPosition);
  const reachedRef = useRef(false);

  useEffect(() => {
    posRef.current.set(...currentPosition);
    setDisplayPos(currentPosition);
    reachedRef.current = false;
  }, [currentPosition[0], currentPosition[1], currentPosition[2]]);

  useFrame((_, delta) => {
    if (!isMoving) return;

    const target = new THREE.Vector3(...targetPosition);
    const damp = 1 - Math.exp(-1.5 * delta);
    posRef.current.lerp(target, damp);

    setDisplayPos([posRef.current.x, posRef.current.y, posRef.current.z]);

    if (!reachedRef.current && posRef.current.distanceTo(target) < 5) {
      reachedRef.current = true;
      onReachTarget?.();
    }
  });

  return <Avatar position={displayPos} isMoving={isMoving} />;
};
