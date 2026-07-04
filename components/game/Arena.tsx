'use client';

import { RigidBody } from '@react-three/rapier';
import { Box, Sphere } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

export function Arena() {
  const floorRef = useRef<Mesh>(null);
  const wallRefs = useRef<Mesh[]>([]);

  // Procedural decoration pillars
  const pillars = [
    { pos: [8, 0, 8], color: '#6366f1' },
    { pos: [-8, 0, 8], color: '#8b5cf6' },
    { pos: [8, 0, -8], color: '#ec4899' },
    { pos: [-8, 0, -8], color: '#f43f5e' },
  ];

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box
          ref={floorRef}
          args={[30, 1, 30]}
          position={[0, -0.5, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.3}
            roughness={0.7}
          />
        </Box>
      </RigidBody>

      {/* Walls */}
      {[
        { pos: [15, 0, 0], rotation: [0, 0, 0] },
        { pos: [-15, 0, 0], rotation: [0, 0, 0] },
        { pos: [0, 0, 15], rotation: [0, 0, 0] },
        { pos: [0, 0, -15], rotation: [0, 0, 0] },
      ].map((wall, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid">
          <Box
            args={[2, 10, 30]}
            position={[wall.pos[0], wall.pos[1], wall.pos[2]]}
            castShadow
          >
            <meshStandardMaterial
              color="#334155"
              metalness={0.2}
              roughness={0.8}
            />
          </Box>
        </RigidBody>
      ))}

      {/* Decorative Pillars */}
      {pillars.map((pillar, i) => (
        <group key={`pillar-${i}`}>
          <RigidBody type="fixed" colliders="ball">
            <Sphere
              args={[1.5, 16, 16]}
              position={[pillar.pos[0], 2, pillar.pos[1]]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={pillar.color}
                metalness={0.6}
                roughness={0.4}
                emissive={pillar.color}
                emissiveIntensity={0.2}
              />
            </Sphere>
          </RigidBody>
        </group>
      ))}

      {/* Center Arena Marker */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[8, 8, 0.1, 32]} />
        <meshStandardMaterial
          color="#4f46e5"
          emissive="#4f46e5"
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}
