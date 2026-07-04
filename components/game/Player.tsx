'use client';

import { RigidBody, useRapier } from '@react-three/rapier';
import { Box, Sphere } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import { Vector3, Group, Mesh } from 'three';
import { useGameStore } from '@/lib/gameStore';
import { effectsManager } from '@/lib/effectsManager';

export function Player() {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<any>(null);
  const { camera } = useThree();
  const { world } = useRapier();

  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [comboTimer, setComboTimer] = useState(0);
  const [lastAttackTime, setLastAttackTime] = useState(0);
  const [attackDir, setAttackDir] = useState(0);

  const {
    player,
    setPlayerPosition,
    setPlayerHealth,
    setPlayerCombo,
    setPlayerAttacking,
    setAttackCooldown,
    enemies,
    updateEnemy,
    removeEnemy,
    addScore,
  } = useGameStore();

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
      if (e.key === ' ') {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game loop
  useFrame(() => {
    if (!bodyRef.current || !groupRef.current) return;

    const vel = bodyRef.current.linvel();
    const pos = bodyRef.current.translation();
    setPlayerPosition([pos.x, pos.y, pos.z]);

    // Movement
    let moveX = 0;
    let moveZ = 0;
    const speed = 20;

    if (keys['w']) moveZ -= speed;
    if (keys['s']) moveZ += speed;
    if (keys['a']) moveX -= speed;
    if (keys['d']) moveX += speed;

    // Camera relative movement
    const cameraDir = new Vector3();
    camera.getWorldDirection(cameraDir);
    const moveDir = new Vector3(moveX, 0, moveZ).normalize();
    const worldMove = new Vector3();

    if (moveDir.length() > 0) {
      const angle = Math.atan2(moveDir.x, moveDir.z);
      const cameraAngle = Math.atan2(cameraDir.x, cameraDir.z);
      const relativeAngle = angle + cameraAngle;
      worldMove.x = Math.sin(relativeAngle) * speed;
      worldMove.z = Math.cos(relativeAngle) * speed;
      groupRef.current.rotation.y = relativeAngle;
    }

    bodyRef.current.setLinvel(
      { x: worldMove.x, y: vel.y, z: worldMove.z },
      true
    );

    // Camera follow with offset
    const targetCamPos = new Vector3(pos.x, pos.y + 6, pos.z + 12);
    camera.position.lerp(targetCamPos, 0.1);
    const targetLook = new Vector3(pos.x, pos.y + 1, pos.z);
    camera.lookAt(targetLook);

    // Attack cooldown
    if (player.attackCooldown > 0) {
      setAttackCooldown(player.attackCooldown - 1);
    }

    // Combo timeout
    if (comboTimer > 0) {
      setComboTimer(comboTimer - 1);
    } else if (player.comboCount > 0) {
      setPlayerCombo(0);
    }

    // Attack button
    if (keys[' '] && player.attackCooldown <= 0) {
      const now = Date.now();
      const timeSinceLastAttack = now - lastAttackTime;

      // Check if it's a combo attack (within 400ms)
      let combo = player.comboCount;
      if (timeSinceLastAttack > 400) {
        combo = 0;
      }
      combo = (combo + 1) % 3;

      setPlayerCombo(combo);
      setPlayerAttacking(true);
      setLastAttackTime(now);
      setComboTimer(60); // 1 second at 60fps
      setAttackCooldown(20);

      // Perform attack
      performAttack(combo, pos);

      // Check damage to enemies
      enemies.forEach((enemy) => {
        const enemyPos = new Vector3(enemy.position[0], enemy.position[1], enemy.position[2]);
        const playerPos = new Vector3(pos.x, pos.y, pos.z);
        const distance = playerPos.distanceTo(enemyPos);

        if (distance < 3) {
          // Hit!
          const damage = 15 + combo * 5; // 15, 20, 25
          updateEnemy(enemy.id, {
            health: Math.max(0, enemy.health - damage),
            state: 'knockback',
            stateTimer: 30,
          });

          // Knockback direction
          const knockDir = new Vector3(
            enemyPos.x - playerPos.x,
            0,
            enemyPos.z - playerPos.z
          ).normalize();

          const knockForce = 25 + combo * 10;
          bodyRef.current.applyImpulse(
            { x: knockDir.x * 15, y: 0, z: knockDir.z * 15 },
            true
          );

          // Knockback enemy
          if (world.getRigidBody) {
            const enemyBody = world.getRigidBody(enemy.id);
            if (enemyBody) {
              enemyBody.applyImpulse(
                { x: knockDir.x * knockForce, y: 5, z: knockDir.z * knockForce },
                true
              );
            }
          }

          addScore(10 + combo * 5);
          // Screen shake on hit
          effectsManager.triggerShake(0.3 + combo * 0.2, 0.15);
        }
      });
    }

    // Remove dead enemies
    enemies.forEach((enemy) => {
      if (enemy.health <= 0) {
        removeEnemy(enemy.id);
        addScore(50);
      }
    });
  });

  const performAttack = (combo: number, pos: any) => {
    // Visual feedback handled by rotation
    if (groupRef.current) {
      const punchForce = 0.3 + combo * 0.1;
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.01) * punchForce;
    }

    // Play sound (will add in next task)
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body */}
      <RigidBody ref={bodyRef} type="dynamic" linearDamping={8} angularDamping={10} colliders="cuboid">
        <group>
          {/* Torso */}
          <Box args={[0.8, 1.2, 0.6]} position={[0, 0, 0]} castShadow>
            <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.6} />
          </Box>

          {/* Head */}
          <Sphere args={[0.35, 16, 16]} position={[0, 0.8, 0]} castShadow>
            <meshStandardMaterial color="#fbbf24" metalness={0.2} roughness={0.5} />
          </Sphere>

          {/* Left Arm */}
          <Box
            args={[0.25, 0.9, 0.25]}
            position={[-0.55, 0.1, 0]}
            castShadow
          >
            <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.6} />
          </Box>

          {/* Right Arm (Weapon) */}
          <group position={[0.55, 0, 0]}>
            <Box args={[0.3, 0.8, 0.3]} position={[0, 0.1, 0]} castShadow>
              <meshStandardMaterial
                color="#ef4444"
                metalness={0.3}
                roughness={0.6}
              />
            </Box>
            {/* Fist */}
            <Sphere args={[0.3, 12, 12]} position={[0, -0.5, 0]} castShadow>
              <meshStandardMaterial color="#fbbf24" metalness={0.4} roughness={0.4} />
            </Sphere>
          </group>

          {/* Legs */}
          <Box
            args={[0.25, 0.8, 0.3]}
            position={[-0.2, -0.8, 0]}
            castShadow
          >
            <meshStandardMaterial color="#1f2937" metalness={0.2} roughness={0.7} />
          </Box>
          <Box
            args={[0.25, 0.8, 0.3]}
            position={[0.2, -0.8, 0]}
            castShadow
          >
            <meshStandardMaterial color="#1f2937" metalness={0.2} roughness={0.7} />
          </Box>
        </group>
      </RigidBody>
    </group>
  );
}
