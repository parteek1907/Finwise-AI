"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  status?: 'scanning' | 'safe' | 'danger';
};

export function ScamShield({ status = 'scanning' }: Props) {
  const shieldGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (shieldGroupRef.current) {
      shieldGroupRef.current.rotation.y += delta * (status === 'scanning' ? 1.5 : 0.5);
    }

    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 1;
      ringRef.current.rotation.y += delta * 1.5;
      
      const material = ringRef.current.material as THREE.MeshStandardMaterial;
      if (status === 'safe') {
        material.color.lerp(new THREE.Color("#245B47"), delta * 2);
      } else if (status === 'danger') {
        material.color.lerp(new THREE.Color("#B94A48"), delta * 2);
      } else {
        material.color.lerp(new THREE.Color("#B58B4A"), delta * 2);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={shieldGroupRef}>
        {/* Core Shield Shape */}
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[1, 0]} />
          <MeshTransmissionMaterial 
            color={status === 'safe' ? "#245B47" : status === 'danger' ? "#B94A48" : "#3F6DB5"}
            transmission={0.9}
            thickness={0.5}
            roughness={0.1}
            ior={1.5}
          />
        </mesh>
        
        {/* Scanning Ring */}
        <mesh ref={ringRef} scale={[1.5, 1.5, 1.5]}>
          <torusGeometry args={[1, 0.02, 16, 100]} />
          <meshStandardMaterial 
            color="#B58B4A" 
            transparent 
            opacity={0.8} 
            emissiveIntensity={0.5} 
          />
        </mesh>
      </group>
    </Float>
  );
}
