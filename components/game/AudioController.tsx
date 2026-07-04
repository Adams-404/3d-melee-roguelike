'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { audioManager } from '@/lib/audioManager';

export function AudioController() {
  const {
    player,
    enemies,
  } = useGameStore();

  const prevComboRef = useRef(0);
  const prevHealthRef = useRef(player.maxHealth);
  const prevEnemyStatesRef = useRef<Record<string, string>>({});
  const musicStartedRef = useRef(false);

  // Initialize audio and start music
  useEffect(() => {
    audioManager.init();
    if (!musicStartedRef.current) {
      audioManager.playBackgroundMusic();
      musicStartedRef.current = true;
    }
  }, []);

  // Attack sounds
  useEffect(() => {
    if (player.isAttacking && player.comboCount !== prevComboRef.current) {
      audioManager.playAttackSound(player.comboCount);
      prevComboRef.current = player.comboCount;
    }
  }, [player.isAttacking, player.comboCount]);

  // Health damage sound
  useEffect(() => {
    if (player.health < prevHealthRef.current) {
      audioManager.playDamageSound();
    }
    prevHealthRef.current = player.health;
  }, [player.health]);

  // Enemy state change sounds
  useEffect(() => {
    enemies.forEach((enemy) => {
      const prevState = prevEnemyStatesRef.current[enemy.id];

      if (prevState !== enemy.state) {
        if (enemy.state === 'alert') {
          audioManager.playAlertSound();
        } else if (enemy.state === 'knockback') {
          audioManager.playHitSound();
        } else if (enemy.state === 'dead' || enemy.health <= 0) {
          audioManager.playDeathSound();
        }
      }

      prevEnemyStatesRef.current[enemy.id] = enemy.state;
    });

    // Remove dead enemies from tracking
    Object.keys(prevEnemyStatesRef.current).forEach((id) => {
      if (!enemies.find((e) => e.id === id)) {
        delete prevEnemyStatesRef.current[id];
      }
    });
  }, [enemies]);

  return null; // This is a headless component
}
