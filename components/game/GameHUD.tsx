'use client';

import { useGameStore } from '@/lib/gameStore';

export function GameHUD() {
  const { player, score, wave, enemies, resetGame, togglePause, isPaused } =
    useGameStore();

  const healthPercent = (player.health / player.maxHealth) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Bar - Score and Wave */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900 via-slate-900 to-transparent p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-white text-3xl font-bold">ROGUELIKE COMBAT</h1>
            <p className="text-slate-400 text-sm">Physics-Based Melee Combat</p>
          </div>
          <div className="text-right">
            <div className="text-indigo-400 text-4xl font-bold">{score}</div>
            <div className="text-slate-400 text-sm">SCORE</div>
          </div>
        </div>
      </div>

      {/* Health Bar - Left Side */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2">
        <div className="bg-slate-800 rounded-lg p-4 w-64">
          <div className="text-white text-sm font-semibold mb-2">HEALTH</div>
          <div className="bg-slate-700 h-8 rounded overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-200 ${
                healthPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  : healthPercent > 25
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <div className="text-slate-400 text-xs">
            {Math.round(player.health)} / {player.maxHealth}
          </div>
        </div>
      </div>

      {/* Combo Counter - Bottom Center */}
      {player.comboCount > 0 && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <div className="text-center">
            <div
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-500 to-pink-600 animate-bounce"
              style={{
                textShadow: '0 0 20px rgba(239, 68, 68, 0.8)',
              }}
            >
              COMBO {player.comboCount}
            </div>
            <div className="text-amber-300 text-sm mt-2 font-bold">+{10 + player.comboCount * 5} XP</div>
          </div>
        </div>
      )}

      {/* Enemy Count - Right Side */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        <div className="bg-slate-800 rounded-lg p-4 w-64">
          <div className="text-white text-sm font-semibold mb-3">ENEMIES</div>
          {enemies.length === 0 ? (
            <div className="text-emerald-400 font-bold">All Clear!</div>
          ) : (
            <div className="space-y-2">
              {enemies.map((enemy) => (
                <div
                  key={enemy.id}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      enemy.state === 'idle'
                        ? 'bg-gray-500'
                        : enemy.state === 'alert'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <div className="text-slate-300 text-xs flex-1">
                    {enemy.id}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {Math.round(enemy.health)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-slate-400 text-xs mb-1">MOVE</div>
              <div className="text-indigo-400 font-mono">W A S D</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">ATTACK / COMBO</div>
              <div className="text-red-400 font-mono">SPACEBAR</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">PAUSE</div>
              <div className="text-slate-400 font-mono">ESC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center pointer-events-auto">
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <h2 className="text-white text-2xl font-bold mb-4">PAUSED</h2>
            <button
              onClick={() => togglePause()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded mb-2 w-full"
            >
              Resume
            </button>
            <button
              onClick={() => {
                resetGame();
                togglePause();
              }}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded w-full"
            >
              Reset Game
            </button>
          </div>
        </div>
      )}

      {/* Wave Counter */}
      <div className="absolute top-32 left-6 text-slate-400 text-sm">
        <div>WAVE</div>
        <div className="text-2xl font-bold text-amber-400">{wave}</div>
      </div>
    </div>
  );
}
