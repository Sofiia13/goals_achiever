import { useGLTF } from "@react-three/drei";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

type Props = {
  start?: [number, number, number];
  end?: [number, number, number];
};

export const Bridge: React.FC<Props> = ({ start, end }) => {
  const { scene } = useGLTF("/models/rope_bridge1.glb");
  const bridgeRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!bridgeRef.current || !start || !end) return;

    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const distance = startVec.distanceTo(endVec);

    // Позиціонуємо в середину між двома точками
    const middle = startVec.clone().add(endVec).multiplyScalar(0.5);
    // Трохи піднімаємо міст над островами
    middle.y -= 2;
    bridgeRef.current.position.copy(middle);

    // Обертаємо міст у напрямку до другого острова
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const angle = Math.atan2(direction.x, direction.z);
    bridgeRef.current.rotation.y = angle + Math.PI / 2; // Додаємо 90 градусів

    // Однаковий масштаб по всіх осях - просто збільшуємо
    const scale = 110;
    bridgeRef.current.scale.set(scale + 90, scale, scale);
  }, [start, end]);

  return (
    <group ref={bridgeRef}>
      <primitive object={clonedScene} />
    </group>
  );
};
