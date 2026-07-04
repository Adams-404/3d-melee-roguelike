# 3D Physics-Based Melee Combat Roguelike

A browser-based action game combining fast-paced melee combat mechanics inspired by Sifu, the roguelike structure of Hades, and the absurdist physics chaos of Rock of Ages. Built with React Three Fiber, Rapier physics, and procedurally generated assets—designed as a solo-dev playground for months of iterative development.

## Table of Contents

- [Quick Start](#quick-start)
- [How to Play](#how-to-play)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Code Structure](#code-structure)
- [Key Systems](#key-systems)
- [Development Guide](#development-guide)
- [Future Expansion](#future-expansion)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- **Node.js 18+** (check with `node --version`)
- **pnpm** (recommended) or npm/yarn

### Installation & Running

```bash
# Clone or navigate to the project directory
cd v0-project

# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Open http://localhost:3000 in your browser
```

The game will automatically reload on code changes thanks to Next.js Hot Module Replacement (HMR).

**First-time build:** The initial build compiles Three.js, Rapier, and R3F, which takes ~30-60 seconds. Subsequent reloads are instant.

---

## How to Play

### Core Mechanics

**Objective:** Defeat all enemies in the arena to progress to the next wave.

### Controls

| Input | Action |
|-------|--------|
| **W / A / S / D** | Move forward / left / backward / right |
| **Mouse** | Camera follows player position (mouse movement unused, but camera auto-follows) |
| **Spacebar** | Attack (tap repeatedly for 3-hit combo) |

### Combat System

**Attack Combo:**
- **Hit 1:** Base damage, applies knockback to enemies
- **Hit 2:** Increased damage (+25%), stronger knockback
- **Hit 3:** Critical damage (+50%), massive knockback
- **Combo Bonus:** Each successful hit grants +5 score + (combo count × 5) bonus score
- **Combo Cooldown:** Combo resets if you don't hit within 2 seconds

**Enemy Knockback:**
- Enemies are pushed backward on hit and take time to recover
- Use the recovery window to land additional hits
- Knockback is physics-driven: heavier enemies resist more

**Health System:**
- Player starts with 100 HP
- Each enemy hit deals 25 HP damage
- Game Over when health reaches 0
- Enemies have 40 HP each

### HUD Elements

**Top-Left: Health Bar**
- Green bar showing current HP
- Red background showing max HP (100)

**Top-Right: Combo Counter**
- Displays current combo count (resets after 2 seconds of inactivity)
- Shows damage multiplier (1.0x → 1.25x → 1.5x)

**Bottom-Left: Enemy List**
- Displays all active enemies in the wave
- Shows each enemy's current health
- Red indicator = alert state, yellow = attacking

**Bottom-Right: Controls & Wave Info**
- Quick reference for WASD + Space controls
- Current wave number
- Total enemies defeated

### Audio Feedback

- **Punch sounds:** Retro 8-bit beeps respond to combo count
- **Enemy alert:** Low-frequency tone when enemy spots you
- **Enemy hit:** Ascending pitch when you damage an enemy
- **Death:** Descending tone when enemy dies
- **Background music:** Looping synth track with varied intensity
- **Master volume control:** Right-click menu or modify `audioManager.ts`

---

## Tech Stack

### Core Framework & Rendering

- **Next.js 16** — App Router, Server Components, optimized bundling
- **React 19** — Component-based UI with Hooks and Suspense
- **Three.js** — 3D graphics rendering and scene management
- **React Three Fiber (R3F)** — React renderer for Three.js scenes
- **@react-three/drei** — High-level helpers (Box, Sphere, Plane, etc.)

### Physics Engine

- **@react-three/rapier** — React wrapper for Rapier physics
- **Rapier 3D** — Robust rigid-body dynamics, collision detection, and constraints

### State Management

- **Zustand** — Lightweight, reactive state store for game data
- Direct JavaScript refs for performance-critical updates (enemy tracking, input handling)

### Styling

- **Tailwind CSS v4** — Utility-first CSS framework with design tokens
- **Inline styles** — Three.js materials use dynamic color properties

### Audio

- **Web Audio API** — Native browser audio synthesis (no external libraries)
- Procedural sound generation: frequencies, oscillators, gain envelopes
- ADSR (Attack-Decay-Sustain-Release) envelope implementation

### Development & Build

- **TypeScript** — Full type safety across game logic
- **ESLint** — Code quality and consistency
- **PostCSS** — CSS preprocessing
- **Turbopack** — Next.js 16's stable bundler (much faster than Webpack)

---

## Project Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────┐
│  Browser / Client                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  app/page.tsx (Entry Point)                     │
│       ↓                                         │
│  <Canvas> (Three.js / R3F)                      │
│       ├─ GameScene.tsx                          │
│       │   ├─ Physics World (Rapier)             │
│       │   ├─ Arena.tsx (Floor + Pillars)        │
│       │   ├─ Player.tsx (Character + AI)        │
│       │   ├─ Enemy.tsx[] (Enemy instances)      │
│       │   ├─ AudioController.tsx                │
│       │   └─ CameraShake Hook                   │
│       │                                         │
│       ├─ Zustand Store (gameStore.ts)           │
│       ├─ Effects Manager (effectsManager.ts)    │
│       └─ Audio Manager (audioManager.ts)        │
│                                                 │
│  GameHUD.tsx (UI Overlay)                       │
│       ├─ Health Bar                             │
│       ├─ Combo Counter                          │
│       ├─ Enemy List                             │
│       └─ Controls & Wave Info                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Data Flow

**Input → Update State → Physics Simulation → Render → Audio**

1. **Input Handling:** Keyboard events captured in `Player.tsx`
2. **State Updates:** Zustand store manages player health, combo, enemies, score
3. **Physics Simulation:** Rapier updates every frame (60 FPS target)
4. **Collision Detection:** Custom logic checks for hit detection within attack range
5. **Rendering:** R3F renders 3D scene based on updated transforms
6. **Audio:** `AudioController.tsx` monitors state changes and triggers sound effects
7. **Visual Effects:** `ParticleEffect.tsx` and screen shake respond to impact events

---

## Code Structure

### File Organization

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Game entry point (Canvas + HUD)
│   └── globals.css         # Tailwind setup + design tokens
│
├── components/
│   └── game/
│       ├── GameScene.tsx        # Main 3D scene & physics setup
│       ├── Arena.tsx            # Floor, walls, decorative pillars
│       ├── Player.tsx           # Player character + combat system
│       ├── Enemy.tsx            # Enemy character + AI logic
│       ├── GameHUD.tsx          # Overlay UI (health, combo, info)
│       ├── AudioController.tsx  # Audio system integration
│       └── ParticleEffect.tsx   # Particle system (future use)
│
├── lib/
│   ├── gameStore.ts        # Zustand state management
│   ├── audioManager.ts     # Web Audio API synthesis
│   ├── effectsManager.ts   # Screen shake & visual effects
│   └── utils.ts            # Helper functions (cn for class merging)
│
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind theme & design tokens
├── next.config.mjs         # Next.js configuration
└── README.md               # This file

```

### Key Files Deep Dive

#### **app/page.tsx** (Entry Point)
```tsx
// Main component that sets up the Three.js canvas
// - Initializes camera at position [0, 8, 15] with 60° FOV
// - Renders GameScene for 3D content
// - Renders GameHUD overlay on top
```

#### **lib/gameStore.ts** (State Management)
```tsx
// Zustand store with game state:
// - player: { position, health, combo, score, attacking }
// - enemies: [{ id, position, health, state }]
// - actions: addScore, damagePlayer, addEnemy, removeEnemy, etc.
//
// Usage in components:
// const { player, enemies, addScore } = useGameStore();
```

#### **components/game/Player.tsx** (Player Logic)
```tsx
// Responsibilities:
// 1. Render player character (Box body + Sphere head + Arms)
// 2. Handle WASD input & movement via Rapier RigidBody
// 3. Detect spacebar attacks & trigger combo system
// 4. Perform raycast hit detection in front of player
// 5. Apply forces to hit enemies
// 6. Update state (health, score, combo)
// 7. Trigger audio & visual effects on hit
//
// Key methods:
// - handleAttack() — raycast & apply knockback
// - updateCombo() — track and reset combo state
```

#### **components/game/Enemy.tsx** (Enemy AI)
```tsx
// Responsibilities:
// 1. Render enemy character (procedural geometry)
// 2. Implement state machine AI: idle → alert → attack → knockback
// 3. Distance-based detection (range = 15 units)
// 4. Pathfinding toward player
// 5. Melee attack with cooldown
// 6. Health tracking & death detection
// 7. Visual state feedback (color change on alert)
//
// Key states:
// - "idle": Waiting for player
// - "alert": Player detected, moving closer
// - "attack": Within range, charging attack
// - "knockback": Hit by player, recovering
```

#### **lib/audioManager.ts** (Audio Synthesis)
```tsx
// Web Audio API synthesis:
// - playPunch(pitch, combo) — Retro beep for attacks
// - playAlert() — Enemy detection tone
// - playHit(pitch) — Hit feedback (ascending)
// - playDeath() — Death tone (descending)
// - playBackgroundMusic() — Looping synth track
//
// Frequency-based:
// - Combo 1: 400 Hz
// - Combo 2: 600 Hz
// - Combo 3: 800 Hz
```

#### **lib/effectsManager.ts** (Visual Effects)
```tsx
// Screen shake implementation:
// - triggerShake(magnitude, duration) — Called on hit
// - update() — Updates shake state each frame
// - getShakeOffset() — Returns current camera offset {x, y, z}
//
// Uses perlin-like noise for smooth, organic shake motion
```

---

## Key Systems

### 1. Combat System

**Attack Detection:**
- Uses Rapier raycast from player position forward 2 units
- Raycast captures all enemies in a cone
- Only hits if enemy is within range and visible

**Damage Calculation:**
```
baseDamage = 25
comboMultiplier = 1.0 + (combo * 0.25)
finalDamage = baseDamage * comboMultiplier
```

**Knockback Physics:**
```
knockbackForce = 30 + (combo * 10)
direction = normalize(enemy.position - player.position)
enemy.applyImpulse(direction * knockbackForce)
```

**Combo Mechanics:**
- Each hit increments combo counter
- Combo resets after 2 seconds of no attacks
- Visual feedback: combo counter glows in top-right HUD

### 2. Enemy AI State Machine

```
┌─────────┐
│  IDLE   │ ← Standing, waiting
└────┬────┘
     │ Player detected (distance < 15)
     ↓
┌─────────┐
│ ALERT   │ ← Moving toward player
└────┬────┘
     │ In attack range (distance < 3)
     ↓
┌─────────┐
│ ATTACK  │ ← Charging, attacking
└────┬────┘
     │ Hit by player (knockback force applied)
     ↓
┌──────────┐
│ KNOCKBACK│ ← Recovering (3 sec cooldown)
└────┬─────┘
     │ Cooldown expires
     └───→ ALERT / IDLE
```

### 3. Physics Integration

**Rapier Configuration:**
- Gravity: 0, 0, -9.81 (Earth-like downward)
- Linear damping: 8 (air resistance)
- Angular damping: 10 (rotation friction)
- Collision groups: Player, enemies, and environment all interact

**RigidBody Types:**
- **Player & Enemies:** `type="dynamic"` (affected by forces & gravity)
- **Arena floor & walls:** `type="fixed"` (immovable)

**Collider Shapes:**
- **Player:** Cuboid (0.4 × 0.8 × 0.4) centered on body
- **Enemies:** Cuboid (0.4 × 0.7 × 0.4) for detection
- **Arena floor:** Cuboid (25 × 1 × 25) for ground collision

### 4. Audio System

**Procedural Synthesis:**
- All sounds generated in real-time using Web Audio API
- No pre-recorded audio files
- Frequencies map to game events (combo level, damage type)

**Sound Categories:**
- **Music:** 50 Hz sine wave, modulated with envelope
- **SFX:** 200–800 Hz beeps with envelope shaping
- **Master volume:** 0.3 (reasonable game audio level)

**ADSR Envelope:**
```
Attack: 0.05s  (fade in)
Decay: 0.1s    (adjust to peak)
Sustain: 0.3s  (hold note)
Release: 0.2s  (fade out)
```

### 5. Rendering Pipeline

**Three.js Scene Graph:**
```
Scene
├── Lighting
│   ├── Ambient Light (base illumination)
│   ├── Directional Light (sun-like)
│   └── Point Lights (arena, enemy glow)
│
├── Environment
│   ├── Arena (floor + walls + pillars)
│   └── Background fog (atmospheric)
│
├── Characters
│   ├── Player (Box + Sphere + geometry)
│   └── Enemies[] (procedural shapes)
│
└── Effects (particles, etc.)
```

**Material Properties:**
- **Player body:** Metallic blue with emission
- **Enemy:** Bright red with glow on alert
- **Floor:** Dark slate with specular highlight

---

## Development Guide

### Running Locally

```bash
# Start dev server with HMR
pnpm dev

# The game runs on http://localhost:3000
# Changes to .tsx, .ts, .css files auto-reload instantly
```

### Building for Production

```bash
# Create optimized production build
pnpm build

# Test production build locally
pnpm start

# Deploy to Vercel (recommended)
vercel deploy
```

### Modifying Game Balance

**Player Health & Damage:**
Open `lib/gameStore.ts`:
```ts
// Change initial player health
const initialState = {
  player: {
    health: 100,  // ← Modify here
    ...
  }
}

// Change damage per hit
// In Player.tsx around line 160:
const damage = 25 * (1 + combo * 0.25);  // ← Adjust multiplier
```

**Enemy Difficulty:**
Open `components/game/Enemy.tsx`:
```ts
// Enemy health
const ENEMY_HEALTH = 40;  // ← Line ~30

// Detection range (units)
const DETECTION_RANGE = 15;  // ← Line ~35

// Attack range
const ATTACK_RANGE = 3;  // ← Line ~36

// Attack cooldown (seconds)
const ATTACK_COOLDOWN = 1.5;  // ← Line ~37
```

**Camera Position:**
Open `app/page.tsx`:
```tsx
camera={{ position: [0, 8, 15], fov: 60 }}
//                    ↑  ↑  ↑       ↑
//                    X  Y  Z      FOV angle
// Increase Z for wider view, Y for higher angle
```

### Adding New Features

**Example: Add a new sound effect**

1. **Add function to `audioManager.ts`:**
```ts
export function playLevelUp() {
  const audioContext = getAudioContext();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.frequency.value = 1000;  // 1kHz tone
  osc.connect(gain);
  gain.connect(audioContext.destination)
  gain.gain.setValueAtTime(0.2, audioContext.currentTime);
  
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.5);  // 500ms duration
}
```

2. **Call from game logic** (e.g., in `GameScene.tsx`):
```ts
import { playLevelUp } from '@/lib/audioManager';

// Inside useFrame or event handler:
if (waveComplete) {
  playLevelUp();
}
```

**Example: Add a new enemy type**

1. **Create `EnemyRanged.tsx`** based on `Enemy.tsx`
2. **Change geometry:**
```tsx
// Instead of sphere, use cone shape
<Cone args={[0.4, 1.2, 8]} position={[0, 0, 0]} />
```

3. **Modify AI in `useFrame`:**
```ts
// Keep distance, shoot projectiles instead of melee
if (distance < ATTACK_RANGE * 2) {
  // Fire projectile logic
}
```

4. **Spawn in `GameScene.tsx`:**
```tsx
<EnemyRanged key={`ranged-${idx}`} id={`ranged-${idx}`} />
```

### Debugging Tips

**Enable console logging:**
```ts
// In Player.tsx or Enemy.tsx, add:
console.log("[v0] Combo count:", combo);
console.log("[v0] Enemy position:", position);
console.log("[v0] Hit detected:", hitResult);
```

**Inspect Rapier physics:**
```tsx
// In GameScene.tsx, enable debug visualization:
<Physics debug={true}>
  {/* Scene content */}
</Physics>
```

**Check Three.js scene:**
```ts
// In browser console:
scene.traverse((obj) => console.log(obj.name));
```

**Profile performance:**
- Open DevTools → Performance tab
- Click Record, play the game, stop recording
- Look for frame drops (should stay at 60 FPS)
- Check for render time spikes (usually from physics or raycasts)

---

## Future Expansion

### Phase 1: Core Gameplay Polish (1-2 weeks)
- [ ] Add screen shake effect framework
- [ ] Particle system for hit effects
- [ ] Enemy knockdown animation states
- [ ] Combo visual feedback (screen zoom on hit)
- [ ] Difficulty progression (more enemies per wave)

### Phase 2: Roguelike Structure (2-3 weeks)
- [ ] Multiple arenas/levels with different layouts
- [ ] Run progression system (unlocks, power-ups)
- [ ] Weapon drops with different attack patterns
- [ ] Upgrade system (speed, damage, health multipliers)
- [ ] Persistent progression tracking

### Phase 3: Enemy Variety (2-3 weeks)
- [ ] **Tank Enemy:** High health, slow, powerful attacks
- [ ] **Ranged Enemy:** Fires projectiles, keeps distance
- [ ] **Caster Enemy:** Area attacks, status effects
- [ ] **Elite Enemies:** Variants with special abilities
- [ ] **Boss Encounters:** Unique attack patterns, multiple phases

### Phase 4: Procedural Content (2-3 weeks)
- [ ] Procedurally generated arenas (walls, obstacles)
- [ ] Randomized enemy waves (difficulty scaling)
- [ ] Procedural music that responds to combat intensity
- [ ] Dynamic weather/lighting based on progression

### Phase 5: Polish & Optimization (1-2 weeks)
- [ ] Mobile touch controls (swipe to attack, tilt to move)
- [ ] Accessibility: colorblind modes, key rebinding
- [ ] Performance optimization (LOD for enemies, culling)
- [ ] Sound design refinement (audio mixing, music intensity)
- [ ] Tutorial / onboarding flow

---

## Troubleshooting

### Game Won't Start

**Error:** "Cannot find module '@react-three/fiber'"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

**Error:** Port 3000 already in use
```bash
# Kill the process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use a different port
pnpm dev -- -p 3001
```

### Performance Issues

**Frame rate drops (below 60 FPS):**
1. Disable debug visualization: `<Physics debug={false}>`
2. Reduce enemy count temporarily
3. Check browser DevTools → Performance tab for bottlenecks
4. Reduce shadow quality or disable shadows in scene

**Audio crackling or stuttering:**
1. Close other audio applications
2. Reduce number of simultaneous sounds (max 4-5)
3. Lower master volume in `audioManager.ts`

### Visual Glitches

**Player clipping through floor:**
- Check RigidBody `colliders="cuboid"` is set
- Verify floor is `type="fixed"` with proper size

**Enemies not moving:**
- Ensure `type="dynamic"` on enemy RigidBody
- Check `linearDamping` isn't too high (should be 8)
- Verify `applyImpulse()` is being called

**Camera not following player:**
- Check `CameraShake` component in `GameScene.tsx`
- Verify camera position updates in `useFrame` hook

### Input Not Responding

**WASD/Spacebar not working:**
1. Click on the game canvas first (focus required)
2. Check browser console for keyboard event errors
3. Verify event listeners are attached in `Player.tsx`

**Mouse not controlling camera:**
- Note: Current build uses auto-follow camera (no mouse input)
- To add mouse control, modify camera update logic in `GameScene.tsx`

---

## Resources & References

### Documentation
- **Three.js:** https://threejs.org/docs/
- **React Three Fiber:** https://r3f.docs.pmnd.rs/
- **Rapier Physics:** https://rapier.rs/javascript/
- **Zustand:** https://github.com/pmndrs/zustand
- **Web Audio API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

### Learning Resources
- R3F Course: https://threejs-journey.com/
- Game Development with Three.js: https://www.youtube.com/watch?v=x_47clQDpXI
- Physics Simulation Basics: https://www.youtube.com/results?search_query=physics+engine+tutorial

### Similar Projects
- **Sifu** (inspiration for melee combat mechanics)
- **Hades** (roguelike structure and progression)
- **Rock of Ages** (physics-based absurdism)

---

## License & Attribution

This project is built with open-source libraries. Respect their licenses:
- Three.js: MIT
- React Three Fiber: MIT
- Rapier: Apache 2.0
- Zustand: MIT
- Next.js: MIT
- Tailwind CSS: MIT

---

## Support & Contribution

**Found a bug?**
1. Check the Troubleshooting section above
2. Review `console.log` output for error messages
3. Test with `pnpm dev` in isolation

**Want to contribute?**
- Fork the repository
- Create a feature branch
- Test locally: `pnpm dev`
- Submit a pull request with description

**Questions?**
- Refer to component comments in the codebase
- Check React/Three.js official docs
- Review the architecture diagram in this README

---

**Happy developing! This is your foundation for a roguelike action game. Build something awesome.** 🎮

