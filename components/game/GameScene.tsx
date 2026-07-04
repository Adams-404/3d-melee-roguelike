'use client';

import { Physics } from '@react-three/rapier';
import { Plane } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Arena } from './Arena';
import { AudioController } from './AudioController';
import { useGameStore } from '@/lib/gameStore';
import { effectsManager } from '@/lib/effectsManager';

function CameraShake() {
  const { camera } = useThree();
  const originalCameraPos = useRef(new Vector3(0, 8, 15));

  useFrame(() => {
    effectsManager.update();
    const shake = effectsManager.getShakeOffset();
    camera.position.x = originalCameraPos.current.x + shake.x;
    camera.position.y = originalCameraPos.current.y + shake.y;
    camera.position.z = originalCameraPos.current.z + shake.z;
  });

  return null;
}

export function GameScene() {
  const enemiesRef = useRef<Map<string, any>>(new Map());
  const enemies = useGameStore((state) => state.enemies);

  // Spawn initial enemies
  useEffect(() => {
    if (enemies.length === 0) {
      useGameStore.getState().addEnemy({
        id: 'enemy-1',
        position: [5, 2, 0],
        health: 30,
        maxHealth: 30,
        state: 'idle',
        velocity: [0, 0, 0],
        targetAngle: 0,
        stateTimer: 0,
      });
      useGameStore.getState().addEnemy({
        id: 'enemy-2',
        position: [-5, 2, 0],
        health: 30,
        maxHealth: 30,
        state: 'idle',
        velocity: [0, 0, 0],
        targetAngle: 0,
        stateTimer: 0,
      });
    }
  }, []);

  return (
    <>
      <AudioController />
      <CameraShake />
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 20, 60]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        castShadow
      />
      <pointLight position={[-10, 15, -10]} intensity={0.6} color="#4f46e5" />
      <pointLight position={[10, 15, 10]} intensity={0.6} color="#ec4899" />

      {/* Physics World */}
      <Physics gravity={[0, -20, 0]} colliders="hull">
        {/* Arena */}
        <Arena />

        {/* Player */}
        <Player />

        {/* Enemies */}
        {enemies.map((enemy, idx) => (
          <Enemy key={`${enemy.id}-${idx}`} enemyId={enemy.id} ref={enemiesRef} />
        ))}
      </Physics>
    </>
  );
}
