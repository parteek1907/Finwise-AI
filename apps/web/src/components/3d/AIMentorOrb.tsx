"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  isThinking?: boolean;
};

export function AIMentorOrb({ isThinking = false }: Props) {
  const orbRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (orbRef.current) {
      const material = orbRef.current.material as any;
      
      // If thinking, speed up the distortion and change color slightly
      const targetSpeed = isThinking ? 4 : 1.5;
      const targetDistort = isThinking ? 0.6 : 0.3;
      
      material.speed = THREE.MathUtils.lerp(material.speed, targetSpeed, delta * 2);
      material.distort = THREE.MathUtils.lerp(material.distort, targetDistort, delta * 2);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={orbRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#3F6DB5" // Accent Blue
          distort={0.3}
          speed={1.5}
          roughness={0.1}
          metalness={0.2}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
    </Float>
  );
}
