'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameScene } from '@/components/game/GameScene';
import { GameHUD } from '@/components/game/GameHUD';

export default function Home() {
  return (
    <main className="w-full h-screen bg-slate-900 overflow-hidden">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 8, 15], fov: 60 }}
      >
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
      <GameHUD />
    </main>
  );
}
