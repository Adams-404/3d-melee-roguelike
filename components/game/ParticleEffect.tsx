'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Particle {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export function ParticleEffect({
  position,
  color = '#ff0000',
  count = 12,
  velocity = 5,
}: {
  position: [number, number, number];
  color?: string;
  count?: number;
  velocity?: number;
}) {
  const [particles, setParticles] = useState<Particle[]>(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const vx = Math.cos(angle) * velocity;
      const vy = (Math.random() - 0.5) * velocity;
      const vz = Math.sin(angle) * velocity;

      newParticles.push({
        id: i,
        position,
        velocity: [vx, vy, vz],
        life: 1,
        maxLife: 1,
        color,
        size: 0.3,
      });
    }
    return newParticles;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            position: [
              p.position[0] + p.velocity[0] * 0.016,
              p.position[1] + p.velocity[1] * 0.016 - 9.8 * 0.016 * 0.016,
              p.position[2] + p.velocity[2] * 0.016,
            ] as [number, number, number],
            velocity: [p.velocity[0] * 0.95, p.velocity[1] * 0.95 - 9.8 * 0.016, p.velocity[2] * 0.95] as [number, number, number],
            life: p.life - 0.016,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  if (particles.length === 0) return null;

  return (
    <>
      {particles.map((p) => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[p.size, 4, 4]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={p.life * 0.8}
            transparent
            opacity={p.life * 0.8}
          />
        </mesh>
      ))}
    </>
  );
}

// Particle manager for the game
export function ParticleManager() {
  const [effects, setEffects] = useState<Array<{
    id: number;
    position: [number, number, number];
    color: string;
    count: number;
    velocity: number;
  }>>([]);

  const createEffect = (
    position: [number, number, number],
    color: string = '#ff0000',
    count: number = 12,
    velocity: number = 5
  ) => {
    const id = Date.now();
    setEffects((prev) => [...prev, { id, position, color, count, velocity }]);

    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 1000);
  };

  return {
    effects,
    createEffect,
    ParticlesComponent: () => (
      <>
        {effects.map((effect) => (
          <ParticleEffect
            key={effect.id}
            position={effect.position}
            color={effect.color}
            count={effect.count}
            velocity={effect.velocity}
          />
        ))}
      </>
    ),
  };
}
