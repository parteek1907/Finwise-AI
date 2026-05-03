"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  score: number;
};

const PARTICLE_COUNT = 800; // Increased for a more solid, premium feel

export function HealthSphere({ score }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate base positions and target positions
  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const randomPositions = new Float32Array(PARTICLE_COUNT * 3);
    const spherePositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    const color = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      randomPositions[i * 3] = (Math.random() - 0.5) * 4;
      randomPositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      randomPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      const phi = Math.acos(1 - (2 * i) / PARTICLE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      
      const r = 2; // radius
      spherePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      spherePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      spherePositions[i * 3 + 2] = r * Math.cos(phi);

      positions[i * 3] = randomPositions[i * 3];
      positions[i * 3 + 1] = randomPositions[i * 3 + 1];
      positions[i * 3 + 2] = randomPositions[i * 3 + 2];

      color.setHex(0xB94A48); // Initial color (Danger Red)
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, randomPositions, spherePositions, colors };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const normalizedScore = Math.min(Math.max(score / 100, 0), 1);
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
    
    const targetColor = new THREE.Color();
    if (normalizedScore < 0.5) {
      targetColor.lerpColors(new THREE.Color("#B94A48"), new THREE.Color("#B58B4A"), normalizedScore * 2);
    } else {
      targetColor.lerpColors(new THREE.Color("#B58B4A"), new THREE.Color("#245B47"), (normalizedScore - 0.5) * 2);
    }

    pointsRef.current.rotation.y += delta * (0.2 - normalizedScore * 0.1);
    pointsRef.current.rotation.x += delta * 0.05;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const targetX = THREE.MathUtils.lerp(particles.randomPositions[i * 3], particles.spherePositions[i * 3], normalizedScore);
      const targetY = THREE.MathUtils.lerp(particles.randomPositions[i * 3 + 1], particles.spherePositions[i * 3 + 1], normalizedScore);
      const targetZ = THREE.MathUtils.lerp(particles.randomPositions[i * 3 + 2], particles.spherePositions[i * 3 + 2], normalizedScore);

      const noise = (1 - normalizedScore) * 0.2;
      const noiseX = (Math.random() - 0.5) * noise;
      const noiseY = (Math.random() - 0.5) * noise;
      const noiseZ = (Math.random() - 0.5) * noise;

      positions[i * 3] = THREE.MathUtils.lerp(positions[i * 3], targetX + noiseX, delta * 2);
      positions[i * 3 + 1] = THREE.MathUtils.lerp(positions[i * 3 + 1], targetY + noiseY, delta * 2);
      positions[i * 3 + 2] = THREE.MathUtils.lerp(positions[i * 3 + 2], targetZ + noiseZ, delta * 2);

      colors[i * 3] = THREE.MathUtils.lerp(colors[i * 3], targetColor.r, delta * 2);
      colors[i * 3 + 1] = THREE.MathUtils.lerp(colors[i * 3 + 1], targetColor.g, delta * 2);
      colors[i * 3 + 2] = THREE.MathUtils.lerp(colors[i * 3 + 2], targetColor.b, delta * 2);
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particles.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.NormalBlending} // Changed from Additive to Normal for light background
        />
      </points>
    </Float>
  );
}
