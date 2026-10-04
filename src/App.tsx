/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, LevelConfig, PlayerBoat, Obstacle, Collectible, Particle, LevelProgress } from './types/game';
import { LEVELS } from './game/levels';
import { createInitialPlayer, updatePlayer, updateObstacles, updateCollectibles, updateParticles } from './game/physics';
import { renderGameScene } from './game/renderer';
import { soundManager } from './audio/soundManager';
import { TopNav } from './components/TopNav';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { TitleScreen } from './components/TitleScreen';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LoreModal } from './components/LoreModal';
import { ControlsModal } from './components/ControlsModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';

const STORAGE_KEY = 'road_to_guainia_save_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showLevelModal, setShowLevelModal] = useState<boolean>(false);
  const [showLoreModal, setShowLoreModal] = useState<boolean>(false);
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false);

  // Saved progress
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Default initial state
    }
    const init: Record<number, LevelProgress> = {};
    LEVELS.forEach((lvl) => {
      init[lvl.id] = {
        unlocked: lvl.id === 1,
        stars: 0,
        highScore: 0,
        completed: false,
      };
    });
    return init;
  });

  const saveProgress = useCallback((newProgress: Record<number, LevelProgress>) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // LocalStorage quota or safe ignore
    }
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active level config
  const currentLevel = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Game references
  const playerRef = useRef<PlayerBoat>(createInitialPlayer(currentLevel, 740, 700));
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const nextSpawnTimeRef = useRef<number>(1.2);
  const nextItemSpawnRef = useRef<number>(2.5);
  const lightningTimerRef = useRef<number>(0);
  const nextLightningRef = useRef<number>(5);

  // Input states
  const [inputState, setInputState] = useState({
    left: false,
    right: false,
    up: false,
    down: false,
    boost: false,
  });
  const inputRef = useRef(inputState);
  inputRef.current = inputState;

  // Track latest player for HUD renders
  const [hudPlayer, setHudPlayer] = useState<PlayerBoat>(playerRef.current);
  const [endStars, setEndStars] = useState<number>(1);

  // Start a given level
  const startLevel = useCallback((levelId: number) => {
    const lvl = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    setCurrentLevelId(levelId);
    playerRef.current = createInitialPlayer(lvl, 740, 700);
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    particlesRef.current = [];
    nextSpawnTimeRef.current = 1.0;
    nextItemSpawnRef.current = 2.0;
    lightningTimerRef.current = 0;
    setHudPlayer({ ...playerRef.current });
    setGameState('PLAYING');
    soundManager.startRiverAmbiance();
  }, []);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs or modals
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setInputState((prev) => ({ ...prev, left: true }));
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setInputState((prev) => ({ ...prev, right: true }));
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setInputState((prev) => ({ ...prev, up: true }));
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setInputState((prev) => ({ ...prev, down: true }));
      } else if (e.code === 'Space') {
        setInputState((prev) => ({ ...prev, boost: true }));
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
          soundManager.stopRiverAmbiance();
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
          soundManager.startRiverAmbiance();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setInputState((prev) => ({ ...prev, left: false }));
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setInputState((prev) => ({ ...prev, right: false }));
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setInputState((prev) => ({ ...prev, up: false }));
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setInputState((prev) => ({ ...prev, down: false }));
      } else if (e.code === 'Space') {
        setInputState((prev) => ({ ...prev, boost: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let hudTimer = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const riverMargin = (canvas.width - currentLevel.riverWidth) / 2;
    const riverLeft = Math.max(30, riverMargin);
    const riverRight = canvas.width - riverLeft;

    const gameLoop = (now: number) => {
      const dt = Math.min(0.08, (now - lastTime) / 1000);
      lastTime = now;

      if (gameState === 'PLAYING') {
        const player = playerRef.current;
        const obstacles = obstaclesRef.current;
        const collectibles = collectiblesRef.current;
        const particles = particlesRef.current;

        // 1. Update Player
        updatePlayer(player, currentLevel, dt, inputRef.current, riverLeft, riverRight, particles);

        // 2. Spawn Obstacles
        nextSpawnTimeRef.current -= dt;
        if (nextSpawnTimeRef.current <= 0) {
          spawnObstacle(currentLevel, riverLeft, riverRight, obstacles);
          nextSpawnTimeRef.current = (1.1 / currentLevel.obstacleSpawnRate) + Math.random() * 0.7;
        }

        // 3. Spawn Collectibles
        nextItemSpawnRef.current -= dt;
        if (nextItemSpawnRef.current <= 0) {
          spawnCollectible(riverLeft, riverRight, collectibles);
          nextItemSpawnRef.current = 2.8 + Math.random() * 2.2;
        }

        // 4. Update Entities
        updateObstacles(obstacles, player, currentLevel, dt, particles);
        updateCollectibles(collectibles, player, currentLevel, dt, particles);
        updateParticles(particles, dt);

        // 5. Weather lightning timer
        if (currentLevel.weather === 'STORM') {
          nextLightningRef.current -= dt;
          if (nextLightningRef.current <= 0) {
            lightningTimerRef.current = 0.25;
            nextLightningRef.current = 4 + Math.random() * 5;
          }
        }
        if (lightningTimerRef.current > 0) {
          lightningTimerRef.current = Math.max(0, lightningTimerRef.current - dt);
        }

        // 6. Check Win/Loss conditions
        if (player.health <= 0) {
          soundManager.playGameOver();
          soundManager.stopRiverAmbiance();
          setGameState('GAME_OVER');
        } else if (player.distanceTraveled >= currentLevel.targetDistance) {
          soundManager.playLevelSuccess();
          soundManager.stopRiverAmbiance();

          // Calculate stars (1 to 3)
          let starsEarned = 1;
          if (player.health >= 70 && player.flowersCollected >= 1) starsEarned = 3;
          else if (player.health >= 40) starsEarned = 2;
          setEndStars(starsEarned);

          // Update progression
          const updated = { ...progress };
          const cur = updated[currentLevel.id] || { unlocked: true, stars: 0, highScore: 0, completed: false };
          updated[currentLevel.id] = {
            unlocked: true,
            stars: Math.max(cur.stars, starsEarned),
            highScore: Math.max(cur.highScore, player.score),
            completed: true,
          };

          // Unlock next level
          if (currentLevel.id < LEVELS.length) {
            const nextLvl = updated[currentLevel.id + 1] || { unlocked: false, stars: 0, highScore: 0, completed: false };
            updated[currentLevel.id + 1] = { ...nextLvl, unlocked: true };
          }

          saveProgress(updated);

          if (currentLevel.id === LEVELS.length) {
            setGameState('EXPEDITION_COMPLETE');
          } else {
            setGameState('LEVEL_SUCCESS');
          }
        }

        // 7. Sync React HUD state throttled to 15 Hz for smooth UI without React overhead
        hudTimer += dt;
        if (hudTimer > 0.065) {
          hudTimer = 0;
          setHudPlayer({ ...player });
        }
      }

      // Render Scene
      renderGameScene({
        canvas,
        ctx,
        player: playerRef.current,
        obstacles: obstaclesRef.current,
        collectibles: collectiblesRef.current,
        particles: particlesRef.current,
        level: currentLevel,
        riverLeft,
        riverRight,
        time: now * 0.001,
        lightningTimer: lightningTimerRef.current,
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, currentLevel, progress, saveProgress]);

  // Next level handler
  const handleNextLevel = () => {
    if (currentLevelId < LEVELS.length) {
      startLevel(currentLevelId + 1);
    } else {
      setGameState('MENU');
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleTogglePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
      soundManager.stopRiverAmbiance();
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
      soundManager.startRiverAmbiance();
    }
  };

  return (
    <div className="min-h-screen bg-[#060e0a] text-slate-100 flex flex-col items-center justify-between select-none overflow-hidden font-sans">
      {/* Universal Top Bar */}
      <TopNav
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isPaused={gameState === 'PAUSED'}
        onTogglePause={handleTogglePause}
        onOpenLevels={() => setShowLevelModal(true)}
        onOpenLore={() => setShowLoreModal(true)}
        onOpenControls={() => setShowControlsModal(true)}
        currentLevelName={currentLevel.name}
      />

      {/* Main View Area */}
      <main className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {gameState === 'MENU' ? (
          <TitleScreen
            onStartGame={() => startLevel(1)}
            onOpenLevels={() => setShowLevelModal(true)}
            onOpenLore={() => setShowLoreModal(true)}
            onOpenControls={() => setShowControlsModal(true)}
          />
        ) : (
          <div className="relative w-full max-w-[740px] h-[calc(100vh-53px)] max-h-[820px] flex items-center justify-center bg-[#07130e] shadow-2xl overflow-hidden">
            {/* Game Canvas */}
            <canvas
              ref={canvasRef}
              width={740}
              height={700}
              className="w-full h-full object-contain"
            />

            {/* In-Game HUD */}
            <HUD
              player={hudPlayer}
              level={currentLevel}
              totalLevels={LEVELS.length}
            />

            {/* Tactile / Mobile Controls */}
            {gameState === 'PLAYING' && (
              <TouchControls
                inputState={inputState}
                onInputStateChange={setInputState}
              />
            )}

            {/* Paused Overlay */}
            {gameState === 'PAUSED' && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center z-40 p-4">
                <span className="text-amber-400 font-mono text-xs uppercase tracking-widest mb-1">
                  Expedición en Pausa
                </span>
                <h2 className="font-serif text-2xl font-bold text-slate-100 mb-4">
                  {currentLevel.name}
                </h2>
                <div className="flex flex-col gap-2.5 w-48">
                  <button
                    onClick={handleTogglePause}
                    className="py-2.5 px-4 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md transition-colors cursor-pointer"
                  >
                    Reanudar Viaje
                  </button>
                  <button
                    onClick={() => startLevel(currentLevel.id)}
                    className="py-2 px-4 text-xs font-semibold bg-[#1a3828] hover:bg-[#234d37] border border-[#2d6146] text-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    Reiniciar Nivel
                  </button>
                  <button
                    onClick={() => {
                      soundManager.stopRiverAmbiance();
                      setGameState('MENU');
                    }}
                    className="py-2 px-4 text-xs font-semibold bg-black/50 hover:bg-black/70 text-slate-400 hover:text-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    Menú Principal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showLevelModal && (
        <LevelSelectModal
          levels={LEVELS}
          progress={progress}
          currentLevelId={currentLevelId}
          onSelectLevel={(id) => startLevel(id)}
          onClose={() => setShowLevelModal(false)}
        />
      )}

      {showLoreModal && (
        <LoreModal onClose={() => setShowLoreModal(false)} />
      )}

      {showControlsModal && (
        <ControlsModal onClose={() => setShowControlsModal(false)} />
      )}

      {(gameState === 'LEVEL_SUCCESS' || gameState === 'EXPEDITION_COMPLETE') && (
        <VictoryModal
          level={currentLevel}
          player={hudPlayer}
          stars={endStars}
          isGameComplete={gameState === 'EXPEDITION_COMPLETE'}
          onNextLevel={handleNextLevel}
          onReplayLevel={() => startLevel(currentLevel.id)}
          onOpenLevelSelect={() => {
            setShowLevelModal(true);
            setGameState('MENU');
          }}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverModal
          level={currentLevel}
          player={hudPlayer}
          onRetry={() => startLevel(currentLevel.id)}
          onOpenLevelSelect={() => {
            setShowLevelModal(true);
            setGameState('MENU');
          }}
        />
      )}
    </div>
  );
}

// Spawner Helpers
let entityCounter = 1;

function spawnObstacle(
  level: LevelConfig,
  riverLeft: number,
  riverRight: number,
  obstacles: Obstacle[]
) {
  const riverW = riverRight - riverLeft;
  const laneX = riverLeft + 35 + Math.random() * (riverW - 70);

  // Decide if whirlpool or standard obstacle
  const isWhirlpool = Math.random() < level.whirlpoolChance;

  if (isWhirlpool) {
    obstacles.push({
      id: entityCounter++,
      type: 'whirlpool',
      x: laneX,
      y: -60,
      radius: 38,
      active: true,
      width: 80,
      height: 80,
      rotation: 0,
      rotationSpeed: 3.2,
      vx: (Math.random() - 0.5) * 15,
      vy: 0,
      healthDamage: 10,
      whirlpoolRadius: 95,
      whirlpoolStrength: 240,
    });
    return;
  }

  // Animal spawn vs rock spawn
  const hasAnimals = level.animalTypes.length > 0;
  const isAnimal = hasAnimals && Math.random() < 0.45;

  if (isAnimal) {
    const animal = level.animalTypes[Math.floor(Math.random() * level.animalTypes.length)];
    if (animal === 'caiman') {
      obstacles.push({
        id: entityCounter++,
        type: 'caiman',
        x: laneX,
        y: -50,
        radius: 20,
        active: true,
        width: 24,
        height: 56,
        rotation: 0,
        rotationSpeed: 0,
        vx: 0,
        vy: 10,
        healthDamage: 22,
        animTimer: Math.random() * 5,
      });
    } else if (animal === 'piranha') {
      obstacles.push({
        id: entityCounter++,
        type: 'piranha_shoal',
        x: laneX,
        y: -40,
        radius: 28,
        active: true,
        width: 50,
        height: 50,
        rotation: 0,
        rotationSpeed: 0,
        vx: (Math.random() - 0.5) * 40,
        vy: 15,
        healthDamage: 18,
        animTimer: Math.random() * 5,
      });
    } else if (animal === 'anaconda') {
      obstacles.push({
        id: entityCounter++,
        type: 'anaconda',
        x: laneX,
        y: -50,
        radius: 22,
        active: true,
        width: 30,
        height: 60,
        rotation: 0,
        rotationSpeed: 0,
        vx: 20,
        vy: 10,
        healthDamage: 25,
        animTimer: Math.random() * 5,
      });
    }
    return;
  }

  // Rock or Log spawn
  const isLog = Math.random() < 0.35;
  if (isLog) {
    obstacles.push({
      id: entityCounter++,
      type: 'floating_log',
      x: laneX,
      y: -40,
      radius: 18,
      active: true,
      width: 42,
      height: 16,
      rotation: (Math.random() - 0.5) * 0.4,
      rotationSpeed: (Math.random() - 0.5) * 0.5,
      vx: 0,
      vy: 15,
      healthDamage: 14,
    });
  } else {
    const isLarge = Math.random() < 0.35;
    obstacles.push({
      id: entityCounter++,
      type: isLarge ? 'rock_large' : 'rock_small',
      x: laneX,
      y: -40,
      radius: isLarge ? 26 : 18,
      active: true,
      width: isLarge ? 50 : 36,
      height: isLarge ? 50 : 36,
      rotation: Math.random() * Math.PI,
      rotationSpeed: 0,
      vx: 0,
      vy: 0,
      healthDamage: isLarge ? 24 : 15,
    });
  }
}

function spawnCollectible(riverLeft: number, riverRight: number, collectibles: Collectible[]) {
  const riverW = riverRight - riverLeft;
  const laneX = riverLeft + 40 + Math.random() * (riverW - 80);

  const roll = Math.random();
  let type: Collectible['type'] = 'flower';
  let points = 250;

  if (roll < 0.4) {
    type = 'flower'; // Flor de Inírida
    points = 300;
  } else if (roll < 0.65) {
    type = 'fruit'; // Chontaduro heals canoe!
    points = 150;
  } else if (roll < 0.82) {
    type = 'shield'; // Amuleto Chamánico
    points = 200;
  } else if (roll < 0.94) {
    type = 'paddle_boost'; // Remos de Guayacán
    points = 200;
  } else {
    type = 'dorado_fish'; // Bonus fish
    points = 500;
  }

  collectibles.push({
    id: entityCounter++,
    type,
    x: laneX,
    y: -30,
    radius: 16,
    active: true,
    bobOffset: 0,
    bobSpeed: 1.5 + Math.random(),
    points,
  });
}
