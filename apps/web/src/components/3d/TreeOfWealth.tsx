"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

export function TreeOfWealth() {
  const scroll = useScroll();
  const treeRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const branchesRef = useRef<THREE.Group>(null);

  // Procedural abstract branches (cleaner, fewer for light theme)
  const branches = useMemo(() => {
    const items = [];
    for (let i = 0; i < 25; i++) {
      const radius = Math.random() * 2 + 0.5;
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 4;
      items.push({
        position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius] as [number, number, number],
        scale: Math.random() * 0.2 + 0.05,
      });
    }
    return items;
  }, []);

  useFrame((state, delta) => {
    // scroll.offset goes from 0 to 1 as the user scrolls
    const offset = scroll ? scroll.offset : 0.5;
    
    if (treeRef.current) {
      const targetScale = 1 + offset * 0.5; 
      treeRef.current.scale.setScalar(
        THREE.MathUtils.lerp(treeRef.current.scale.x, targetScale, delta * 2)
      );
      treeRef.current.rotation.y += delta * 0.05;
    }

    if (orbRef.current) {
      // Gentle pulsing instead of intense neon glow
      const material = orbRef.current.material as THREE.MeshStandardMaterial;
      material.roughness = 0.1 + (Math.sin(state.clock.elapsedTime) * 0.1);
    }
    
    if (branchesRef.current) {
      branchesRef.current.children.forEach((child, i) => {
        const threshold = i / branchesRef.current!.children.length;
        const visible = offset > threshold * 0.3;
        const targetScale = visible ? branches[i].scale : 0;
        child.scale.setScalar(THREE.MathUtils.lerp(child.scale.x, targetScale, delta * 3));
      });
    }
  });

  return (
    <group ref={treeRef} position={[0, -1, 0]}>
      {/* Central Core */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere ref={orbRef} args={[0.8, 64, 64]} position={[0, 1.5, 0]}>
          <MeshDistortMaterial
            color="#245B47" // Accent green
            distort={0.3}
            speed={1.5}
            roughness={0.1}
            metalness={0.1}
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Sphere>
      </Float>

      {/* Abstract Branches / Nodes */}
      <group ref={branchesRef}>
        {branches.map((branch, i) => (
          <mesh key={i} position={branch.position}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color="#B58B4A" // Gold
              roughness={0.2}
              metalness={0.5}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
