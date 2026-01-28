import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type CameraMode = "idle" | "toTask" | "reset" | "follow";

type Props = {
  target: [number, number, number] | null;
  lookAt: [number, number, number] | null;
  mode: CameraMode;
  onArrive?: (mode: CameraMode) => void;
};

export const CameraRig: React.FC<Props> = ({ target, lookAt, mode, onArrive }) => {
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
