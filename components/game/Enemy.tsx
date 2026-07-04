'use client';

import { RigidBody } from '@react-three/rapier';
import { Box, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useRef, useEffect, useState } from 'react';
import { Vector3, Group } from 'three';
import { useGameStore } from '@/lib/gameStore';

interface EnemyProps {
  enemyId: string;
  ref: React.MutableRefObject<Map<string, any>>;
}

export const Enemy = forwardRef<Group, EnemyProps>(({ enemyId, ref }, groupRef) => {
  const bodyRef = useRef<any>(null);
  const [stateLocal, setStateLocal] = useState<{
    state: string;
    timer: number;
    targetAngle: number;
  }>({
    state: 'idle',
    timer: 0,
    targetAngle: 0,
  });

  const { enemies, updateEnemy, player } = useGameStore();
  const enemy = enemies.find((e) => e.id === enemyId);

  if (!enemy) return null;

  useEffect(() => {
    // Store reference for potential future use
    if (groupRef?.current && ref?.current) {
      ref.current.set(enemyId, groupRef.current);
    }
  }, [enemyId, ref, groupRef]);

  useFrame(() => {
    if (!bodyRef.current || !enemy) return;

    const pos = bodyRef.current.translation();
    const playerPos = new Vector3(player.position[0], player.position[1], player.position[2]);
    const enemyPos = new Vector3(pos.x, pos.y, pos.z);
    const distance = enemyPos.distanceTo(playerPos);

    // AI State Machine
    let newState = stateLocal.state;
    let newTimer = stateLocal.timer - 1;
    let newTargetAngle = stateLocal.targetAngle;

    const detectionRange = 15;
    const attackRange = 3;
    const alertRange = 20;

    if (newTimer <= 0) {
      if (distance < alertRange && distance > attackRange) {
        // Transition to alert
        newState = 'alert';
        newTimer = 120; // 2 seconds
      } else if (distance < attackRange) {
        // Transition to attack
        newState = 'attacking';
        newTimer = 60; // 1 second attack window
      } else if (distance > alertRange) {
        // Back to idle
        newState = 'idle';
        newTimer = 120;
      }
    }

    if (newState === 'idle') {
      // Slow wandering
      bodyRef.current.setLinvel({ x: 0, y: bodyRef.current.linvel().y, z: 0 }, true);
    } else if (newState === 'alert') {
      // Move toward player
      const dirToPlayer = new Vector3(
        playerPos.x - pos.x,
        0,
        playerPos.z - pos.z
      ).normalize();

      newTargetAngle = Math.atan2(dirToPlayer.x, dirToPlayer.z);

      bodyRef.current.setLinvel(
        {
          x: dirToPlayer.x * 12,
          y: bodyRef.current.linvel().y,
          z: dirToPlayer.z * 12,
        },
        true
      );
    } else if (newState === 'attacking') {
      // Attack behavior
      const dirToPlayer = new Vector3(
        playerPos.x - pos.x,
        0,
        playerPos.z - pos.z
      ).normalize();

      newTargetAngle = Math.atan2(dirToPlayer.x, dirToPlayer.z);

      // Slow down, prep for attack
      bodyRef.current.setLinvel(
        {
          x: dirToPlayer.x * 3,
          y: bodyRef.current.linvel().y,
          z: dirToPlayer.z * 3,
        },
        true
      );

      // Attack player if in range
      if (newTimer < 30 && distance < attackRange) {
        // Damage player
        if (player.health > 0) {
          useGameStore.getState().setPlayerHealth(player.health - 5);
        }
      }
    } else if (newState === 'knockback') {
      // Ragdoll recovery
      if (newTimer <= 0) {
        newState = 'idle';
        newTimer = 60;
      }
    }

    // Smooth rotation
    if (groupRef && 'current' in groupRef && groupRef.current) {
      const currentYaw = groupRef.current.rotation.y;
      let angleDiff = newTargetAngle - currentYaw;

      // Normalize angle difference
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      groupRef.current.rotation.y += angleDiff * 0.1;
    }

    setStateLocal({
      state: newState,
      timer: newTimer,
      targetAngle: newTargetAngle,
    });

    // Update store
    updateEnemy(enemyId, {
      position: [pos.x, pos.y, pos.z],
      state: newState as any,
      stateTimer: newTimer,
      targetAngle: newTargetAngle,
    });
  });

  const colorMap: Record<string, string> = {
    idle: '#6b7280',
    alert: '#f59e0b',
    attacking: '#ef4444',
    knockback: '#8b5cf6',
    dead: '#4b5563',
  };

  return (
    <group ref={groupRef} position={enemy.position}>
      <RigidBody ref={bodyRef} type="dynamic" linearDamping={8} angularDamping={10} colliders="cuboid">
        <group>
          {/* Torso */}
          <Box
            args={[0.7, 1, 0.6]}
            position={[0, 0, 0]}
            castShadow
          >
            <meshStandardMaterial
              color={colorMap[stateLocal.state]}
              metalness={0.4}
              roughness={0.5}
              emissive={colorMap[stateLocal.state]}
              emissiveIntensity={stateLocal.state === 'attacking' ? 0.3 : 0.1}
            />
          </Box>

          {/* Head */}
          <Sphere args={[0.3, 12, 12]} position={[0, 0.7, 0]} castShadow>
            <meshStandardMaterial
              color={colorMap[stateLocal.state]}
              metalness={0.3}
              roughness={0.6}
              emissive={colorMap[stateLocal.state]}
              emissiveIntensity={stateLocal.state === 'attacking' ? 0.4 : 0.15}
            />
          </Sphere>

          {/* Eyes */}
          <Sphere args={[0.08, 8, 8]} position={[-0.12, 0.75, 0.28]} castShadow>
            <meshStandardMaterial color="#ffffff" metalness={0} roughness={0.3} />
          </Sphere>
          <Sphere args={[0.08, 8, 8]} position={[0.12, 0.75, 0.28]} castShadow>
            <meshStandardMaterial color="#ffffff" metalness={0} roughness={0.3} />
          </Sphere>

          {/* Pupils */}
          <Sphere
            args={[0.04, 8, 8]}
            position={[-0.12, 0.75, 0.3]}
            castShadow
          >
            <meshStandardMaterial color="#000000" />
          </Sphere>
          <Sphere args={[0.04, 8, 8]} position={[0.12, 0.75, 0.3]} castShadow>
            <meshStandardMaterial color="#000000" />
          </Sphere>

          {/* Arms */}
          <Box
            args={[0.2, 0.8, 0.2]}
            position={[-0.5, 0, 0]}
            castShadow
          >
            <meshStandardMaterial
              color={colorMap[stateLocal.state]}
              metalness={0.3}
              roughness={0.6}
            />
          </Box>
          <Box
            args={[0.2, 0.8, 0.2]}
            position={[0.5, 0, 0]}
            castShadow
          >
            <meshStandardMaterial
              color={colorMap[stateLocal.state]}
              metalness={0.3}
              roughness={0.6}
            />
          </Box>

          {/* Legs */}
          <Box
            args={[0.2, 0.7, 0.25]}
            position={[-0.2, -0.75, 0]}
            castShadow
          >
            <meshStandardMaterial color="#1f2937" metalness={0.2} roughness={0.7} />
          </Box>
          <Box
            args={[0.2, 0.7, 0.25]}
            position={[0.2, -0.75, 0]}
            castShadow
          >
            <meshStandardMaterial color="#1f2937" metalness={0.2} roughness={0.7} />
          </Box>

          {/* Health indicator bar above head */}
          <mesh position={[0, 1.3, 0]}>
            <planeGeometry args={[1.2, 0.15]} />
            <meshStandardMaterial color="#000000" metalness={0} roughness={1} />
          </mesh>
          <mesh position={[0, 1.3, 0.01]}>
            <planeGeometry args={[1.2 * (enemy.health / enemy.maxHealth), 0.15]} />
            <meshStandardMaterial
              color={
                enemy.health > enemy.maxHealth * 0.5
                  ? '#10b981'
                  : enemy.health > enemy.maxHealth * 0.25
                    ? '#f59e0b'
                    : '#ef4444'
              }
              metalness={0}
              roughness={0.5}
              emissive={
                enemy.health > enemy.maxHealth * 0.5
                  ? '#10b981'
                  : enemy.health > enemy.maxHealth * 0.25
                    ? '#f59e0b'
                    : '#ef4444'
              }
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      </RigidBody>
    </group>
  );
});

Enemy.displayName = 'Enemy';
