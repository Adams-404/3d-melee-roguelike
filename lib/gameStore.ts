import { create } from 'zustand';
import { Vector3 } from 'three';

export interface PlayerState {
  position: [number, number, number];
  health: number;
  maxHealth: number;
  comboCount: number;
  isAttacking: boolean;
  attackCooldown: number;
}

export interface Enemy {
  id: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  state: 'idle' | 'alert' | 'attacking' | 'knockback' | 'dead';
  velocity: [number, number, number];
  targetAngle: number;
  stateTimer: number;
}

export interface GameState {
  // Player
  player: PlayerState;
  setPlayerPosition: (pos: [number, number, number]) => void;
  setPlayerHealth: (health: number) => void;
  setPlayerCombo: (combo: number) => void;
  setPlayerAttacking: (attacking: boolean) => void;
  setAttackCooldown: (cooldown: number) => void;
  
  // Enemies
  enemies: Enemy[];
  addEnemy: (enemy: Enemy) => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  removeEnemy: (id: string) => void;
  
  // Game
  isPaused: boolean;
  score: number;
  wave: number;
  togglePause: () => void;
  addScore: (points: number) => void;
  nextWave: () => void;
  resetGame: () => void;
}

const initialPlayerState: PlayerState = {
  position: [0, 2, 0],
  health: 100,
  maxHealth: 100,
  comboCount: 0,
  isAttacking: false,
  attackCooldown: 0,
};

export const useGameStore = create<GameState>((set) => ({
  player: initialPlayerState,
  setPlayerPosition: (pos) =>
    set((state) => ({
      player: { ...state.player, position: pos },
    })),
  setPlayerHealth: (health) =>
    set((state) => ({
      player: { ...state.player, health },
    })),
  setPlayerCombo: (combo) =>
    set((state) => ({
      player: { ...state.player, comboCount: combo },
    })),
  setPlayerAttacking: (attacking) =>
    set((state) => ({
      player: { ...state.player, isAttacking: attacking },
    })),
  setAttackCooldown: (cooldown) =>
    set((state) => ({
      player: { ...state.player, attackCooldown: cooldown },
    })),

  enemies: [],
  addEnemy: (enemy) =>
    set((state) => ({
      enemies: [...state.enemies, enemy],
    })),
  updateEnemy: (id, updates) =>
    set((state) => ({
      enemies: state.enemies.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),
  removeEnemy: (id) =>
    set((state) => ({
      enemies: state.enemies.filter((e) => e.id !== id),
    })),

  isPaused: false,
  score: 0,
  wave: 1,
  togglePause: () =>
    set((state) => ({
      isPaused: !state.isPaused,
    })),
  addScore: (points) =>
    set((state) => ({
      score: state.score + points,
    })),
  nextWave: () =>
    set((state) => ({
      wave: state.wave + 1,
      enemies: [],
    })),
  resetGame: () =>
    set({
      player: initialPlayerState,
      enemies: [],
      isPaused: false,
      score: 0,
      wave: 1,
    }),
}));
