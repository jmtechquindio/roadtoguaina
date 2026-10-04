export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_SUCCESS' | 'GAME_OVER' | 'EXPEDITION_COMPLETE';

export type WeatherType = 'SUNNY' | 'MIST' | 'RAIN' | 'SUNSET' | 'STORM' | 'GOLDEN_HOUR';

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  landmark: string;
  description: string;
  lore: string;
  targetDistance: number; // in meters (e.g. 800 - 3000)
  riverWidth: number; // in pixels
  riverCurrent: number; // downward drift speed
  obstacleSpawnRate: number; // frequency
  whirlpoolChance: number; // 0 - 1
  animalTypes: Array<'caiman' | 'piranha' | 'anaconda' | 'eel'>;
  weather: WeatherType;
  waterColor: string; // deep tea/amber/black water
  waterCurrentColor: string;
  backgroundTepuis: boolean; // whether Mavecure monoliths appear in background
  rewardTitle: string;
}

export interface PlayerBoat {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  angle: number; // heading in radians
  angularVelocity: number;
  health: number; // 0 to 100
  maxHealth: number;
  stamina: number; // 0 to 100 for sprinting
  maxStamina: number;
  shieldDuration: number; // seconds left of shamanic shield
  speedBoostDuration: number; // seconds left of guayacan paddle boost
  invulnerableTime: number; // temporary grace period after taking hit
  paddleCycle: number; // animation timer for rowers
  isPaddlingLeft: boolean;
  isPaddlingRight: boolean;
  isPaddlingUp: boolean;
  isPaddlingDown: boolean;
  isBoosting: boolean;
  score: number;
  flowersCollected: number;
  distanceTraveled: number; // current progress in meters
  timeElapsed: number; // seconds spent in current level
}

export type ObstacleType = 
  | 'rock_small'
  | 'rock_large'
  | 'whirlpool'
  | 'caiman'
  | 'piranha_shoal'
  | 'anaconda'
  | 'floating_log';

export interface BaseEntity {
  id: number;
  x: number;
  y: number;
  radius: number;
  active: boolean;
}

export interface Obstacle extends BaseEntity {
  type: ObstacleType;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  vx: number;
  vy: number;
  healthDamage: number;
  whirlpoolRadius?: number;
  whirlpoolStrength?: number;
  // Specific animal states
  submerged?: boolean;
  submergeTimer?: number;
  animTimer?: number;
  segments?: Array<{ x: number; y: number; angle: number }>; // for anaconda
}

export type CollectibleType = 'flower' | 'fruit' | 'shield' | 'paddle_boost' | 'dorado_fish';

export interface Collectible extends BaseEntity {
  type: CollectibleType;
  bobOffset: number;
  bobSpeed: number;
  points: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  type: 'water' | 'foam' | 'leaf' | 'sparkle' | 'wood_debris' | 'rain';
}

export interface LevelProgress {
  unlocked: boolean;
  stars: number; // 0 to 3
  highScore: number;
  completed: boolean;
}
