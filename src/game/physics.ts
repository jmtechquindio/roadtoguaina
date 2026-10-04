import { PlayerBoat, Obstacle, Collectible, LevelConfig, Particle } from '../types/game';
import { soundManager } from '../audio/soundManager';

export function createInitialPlayer(level: LevelConfig, canvasWidth: number, canvasHeight: number): PlayerBoat {
  return {
    x: canvasWidth / 2,
    y: 520, // comfortable cruising line in lower half
    vx: 0,
    vy: 0,
    width: 32,
    height: 82,
    angle: 0, // 0 = pointing straight upriver
    angularVelocity: 0,
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    shieldDuration: 0,
    speedBoostDuration: 0,
    invulnerableTime: 0,
    paddleCycle: 0,
    isPaddlingLeft: false,
    isPaddlingRight: false,
    isPaddlingUp: false,
    isPaddlingDown: false,
    isBoosting: false,
    score: 0,
    flowersCollected: 0,
    distanceTraveled: 0,
    timeElapsed: 0,
  };
}

export function updatePlayer(
  player: PlayerBoat,
  level: LevelConfig,
  dt: number,
  input: { left: boolean; right: boolean; up: boolean; down: boolean; boost: boolean },
  riverLeft: number,
  riverRight: number,
  particles: Particle[]
): void {
  // Track level time
  player.timeElapsed += dt;

  // Grace period timer
  if (player.invulnerableTime > 0) {
    player.invulnerableTime = Math.max(0, player.invulnerableTime - dt);
  }
  if (player.shieldDuration > 0) {
    player.shieldDuration = Math.max(0, player.shieldDuration - dt);
  }
  if (player.speedBoostDuration > 0) {
    player.speedBoostDuration = Math.max(0, player.speedBoostDuration - dt);
  }

  // Stamina logic
  const isSprinting = (input.boost || (input.up && input.boost)) && player.stamina > 5;
  player.isBoosting = isSprinting;

  if (isSprinting) {
    player.stamina = Math.max(0, player.stamina - dt * 24);
  } else {
    player.stamina = Math.min(player.maxStamina, player.stamina + dt * 16);
  }

  // Record input directions
  player.isPaddlingLeft = input.left;
  player.isPaddlingRight = input.right;
  player.isPaddlingUp = input.up || isSprinting;
  player.isPaddlingDown = input.down;

  // Paddle cycle animation speed
  const isMoving = input.left || input.right || input.up || input.down || isSprinting;
  player.paddleCycle += dt * (isMoving ? 5.5 : 2.5);

  // 1. VERTICAL MOVEMENT (Up & Down on screen)
  let targetVy = 0;
  const restY = 520; // Default comfortable cruising height

  if (player.isPaddlingUp) {
    // When pressing UP: Boat climbs upriver on the screen
    let upSpeed = -150;
    if (isSprinting || player.speedBoostDuration > 0) upSpeed = -210;
    targetVy = upSpeed;

    // Upward paddle splash particles
    if (Math.random() < 0.25) {
      soundManager.playPaddleSplash(Math.random() < 0.5 ? 'left' : 'right');
      particles.push({
        x: player.x + (Math.random() - 0.5) * 36,
        y: player.y + 20,
        vx: (Math.random() - 0.5) * 20,
        vy: 35 + Math.random() * 25,
        size: 3 + Math.random() * 3,
        alpha: 0.8,
        life: 0.35,
        maxLife: 0.35,
        color: '#ccecf0',
        type: 'foam',
      });
    }
  } else if (player.isPaddlingDown) {
    // When pressing DOWN: Boat retreats downriver / back-paddles on screen
    targetVy = 135;

    // Bow counter-froth when braking
    if (Math.random() < 0.25) {
      soundManager.playPaddleSplash('left');
      particles.push({
        x: player.x + (Math.random() - 0.5) * 24,
        y: player.y - 30,
        vx: (Math.random() - 0.5) * 25,
        vy: -20 - Math.random() * 20,
        size: 3 + Math.random() * 3,
        alpha: 0.75,
        life: 0.3,
        maxLife: 0.3,
        color: '#e2f4f8',
        type: 'foam',
      });
    }
  } else {
    // Neutral: gently settle towards comfortable cruising line
    targetVy = (restY - player.y) * 1.5;
  }

  // Smooth vertical acceleration
  player.vy += (targetVy - player.vy) * Math.min(1, dt * 6.5);
  player.y += player.vy * dt;

  // Clamp vertical position: can climb to upper third (160px) or back up to bottom (630px)
  if (player.y < 160) {
    player.y = 160;
    player.vy = Math.max(0, player.vy);
  }
  if (player.y > 630) {
    player.y = 630;
    player.vy = Math.min(0, player.vy);
  }

  // 2. HORIZONTAL MOVEMENT & STEERING (Left & Right)
  let targetVx = 0;
  let targetAngle = 0;
  const steerSpeed = 145;

  if (input.left && !input.right) {
    targetVx = -steerSpeed;
    targetAngle = -0.32; // ~18 degrees left bank
    if (Math.random() < 0.3) {
      soundManager.playPaddleSplash('left');
      particles.push({
        x: player.x - 18,
        y: player.y + 10,
        vx: -25 - Math.random() * 20,
        vy: 15 + Math.random() * 15,
        size: 3 + Math.random() * 3,
        alpha: 0.8,
        life: 0.3,
        maxLife: 0.3,
        color: '#ccecf0',
        type: 'foam',
      });
    }
  } else if (input.right && !input.left) {
    targetVx = steerSpeed;
    targetAngle = 0.32; // ~18 degrees right bank
    if (Math.random() < 0.3) {
      soundManager.playPaddleSplash('right');
      particles.push({
        x: player.x + 18,
        y: player.y + 10,
        vx: 25 + Math.random() * 20,
        vy: 15 + Math.random() * 15,
        size: 3 + Math.random() * 3,
        alpha: 0.8,
        life: 0.3,
        maxLife: 0.3,
        color: '#ccecf0',
        type: 'foam',
      });
    }
  } else {
    targetVx = 0;
    targetAngle = 0;
  }

  // Smooth horizontal interpolation
  player.vx += (targetVx - player.vx) * Math.min(1, dt * 7.5);
  player.angle += (targetAngle - player.angle) * Math.min(1, dt * 6.0);
  player.x += player.vx * dt;

  // Bank collision bounds
  const margin = player.width * 0.8;
  if (player.x < riverLeft + margin) {
    player.x = riverLeft + margin;
    player.vx = 30;
    if (player.invulnerableTime <= 0 && player.shieldDuration <= 0) {
      player.health -= 3;
      soundManager.playRockCollision();
      player.invulnerableTime = 0.4;
    }
  } else if (player.x > riverRight - margin) {
    player.x = riverRight - margin;
    player.vx = -30;
    if (player.invulnerableTime <= 0 && player.shieldDuration <= 0) {
      player.health -= 3;
      soundManager.playRockCollision();
      player.invulnerableTime = 0.4;
    }
  }

  // 3. EXPEDITION DISTANCE PROGRESSION
  // Calibrated so a 900m level takes ~60-65 seconds at cruising speed
  let metersPerSec = 14.5;
  if (player.isPaddlingUp) {
    metersPerSec = isSprinting || player.speedBoostDuration > 0 ? 23 : 19.5;
  } else if (player.isPaddlingDown) {
    metersPerSec = 8.0;
  }

  player.distanceTraveled += metersPerSec * dt;

  // Score increments
  player.score += Math.round(dt * (metersPerSec * 1.2));

  // Stern wake particles
  if (Math.random() < 0.45) {
    const sternX = player.x - Math.sin(player.angle) * (player.height * 0.45);
    const sternY = player.y + Math.cos(player.angle) * (player.height * 0.45);
    particles.push({
      x: sternX + (Math.random() - 0.5) * 8,
      y: sternY + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 12,
      vy: level.riverCurrent * 0.4 + Math.random() * 15,
      size: 2 + Math.random() * 3,
      alpha: 0.65,
      life: 0.45,
      maxLife: 0.45,
      color: '#d0eff5',
      type: 'water',
    });
  }
}

/**
 * Circle-based multi-point collision for elongated boat
 */
export function checkBoatCollisionWithCircle(
  player: PlayerBoat,
  circleX: number,
  circleY: number,
  circleRadius: number
): boolean {
  const offsets = [-player.height * 0.35, 0, player.height * 0.35];
  const boatCircleRadius = player.width * 0.55;

  for (const offset of offsets) {
    const cx = player.x + Math.sin(player.angle) * offset;
    const cy = player.y - Math.cos(player.angle) * offset;
    const distSq = (cx - circleX) ** 2 + (cy - circleY) ** 2;
    const radSum = boatCircleRadius + circleRadius;
    if (distSq < radSum * radSum) {
      return true;
    }
  }
  return false;
}

export function updateObstacles(
  obstacles: Obstacle[],
  player: PlayerBoat,
  level: LevelConfig,
  dt: number,
  particles: Particle[]
): void {
  for (const obs of obstacles) {
    if (!obs.active) continue;

    // Movement: river current brings them downward
    obs.y += (level.riverCurrent + obs.vy) * dt;
    obs.x += obs.vx * dt;
    obs.rotation += obs.rotationSpeed * dt;

    if (obs.type === 'whirlpool') {
      const pullRadius = obs.whirlpoolRadius || 110;
      const strength = obs.whirlpoolStrength || 200;
      const dx = obs.x - player.x;
      const dy = obs.y - player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < pullRadius) {
        // Gravitational inward pull
        const normalizedDist = Math.max(0.1, dist / pullRadius);
        const pullFactor = (1 - normalizedDist) * strength;
        const dirX = dx / dist;
        const dirY = dy / dist;

        const vortexResistance = player.speedBoostDuration > 0 ? 0.3 : 0.85;
        player.x += dirX * pullFactor * dt * 0.9 * vortexResistance;
        player.y += dirY * pullFactor * dt * 0.9 * vortexResistance;

        // Tangential swirl
        const tangX = -dirY;
        const tangY = dirX;
        player.x += tangX * pullFactor * dt * 0.6 * vortexResistance;
        player.y += tangY * pullFactor * dt * 0.6 * vortexResistance;
        player.angle += (1 - normalizedDist) * 1.5 * dt * vortexResistance;

        soundManager.playWhirlpoolWarning(1 - normalizedDist);

        if (Math.random() < 0.3) {
          const pAngle = Math.random() * Math.PI * 2;
          const pDist = 25 + Math.random() * (pullRadius - 25);
          particles.push({
            x: obs.x + Math.cos(pAngle) * pDist,
            y: obs.y + Math.sin(pAngle) * pDist,
            vx: -Math.cos(pAngle) * 40 - Math.sin(pAngle) * 45,
            vy: -Math.sin(pAngle) * 40 + Math.cos(pAngle) * 45,
            size: 2 + Math.random() * 3,
            alpha: 0.6,
            life: 0.35,
            maxLife: 0.35,
            color: '#a0e4e0',
            type: 'foam',
          });
        }

        if (dist < 30 && player.invulnerableTime <= 0 && player.shieldDuration <= 0) {
          player.health -= 10 * dt;
          soundManager.playRockCollision();
        }
      }
    } else if (obs.type === 'caiman') {
      obs.animTimer = (obs.animTimer || 0) + dt * 3.5;
      const dx = player.x - obs.x;
      const dy = player.y - obs.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 180 && dy > -40) {
        obs.vx = (dx / dist) * 55;
        obs.vy = 18;
        if (Math.random() < 0.04) {
          soundManager.playAnimalEncounter('caiman');
        }
      }
    } else if (obs.type === 'piranha_shoal') {
      obs.animTimer = (obs.animTimer || 0) + dt * 6;
      obs.vx = Math.sin(obs.animTimer * 0.8) * 60;
      if (Math.random() < 0.06) {
        soundManager.playAnimalEncounter('piranha');
      }
    } else if (obs.type === 'anaconda') {
      obs.animTimer = (obs.animTimer || 0) + dt * 2.8;
      obs.vx = Math.cos(obs.animTimer * 0.5) * 50;
      if (!obs.segments) {
        obs.segments = Array.from({ length: 6 }, () => ({ x: obs.x, y: obs.y, angle: 0 }));
      }
      for (let i = 0; i < obs.segments.length; i++) {
        const seg = obs.segments[i];
        const lag = (i + 1) * 0.25;
        seg.x = obs.x + Math.sin(obs.animTimer - lag) * 14 * (i + 1);
        seg.y = obs.y - (i + 1) * 16;
      }
    }

    // Check collision with boat
    if (obs.type !== 'whirlpool') {
      const isColliding = checkBoatCollisionWithCircle(player, obs.x, obs.y, obs.radius);
      if (isColliding) {
        if (player.shieldDuration > 0) {
          obs.active = false;
          player.score += 150;
          soundManager.playCollectItem('shield');
          for (let p = 0; p < 8; p++) {
            particles.push({
              x: obs.x,
              y: obs.y,
              vx: (Math.random() - 0.5) * 100,
              vy: (Math.random() - 0.5) * 100,
              size: 4 + Math.random() * 4,
              alpha: 0.9,
              life: 0.45,
              maxLife: 0.45,
              color: '#facc15',
              type: 'sparkle',
            });
          }
        } else if (player.invulnerableTime <= 0) {
          player.health -= obs.healthDamage;
          player.invulnerableTime = 0.8;
          soundManager.playRockCollision();

          const bAngle = Math.atan2(player.y - obs.y, player.x - obs.x);
          player.vx += Math.cos(bAngle) * 140;
          player.vy += Math.sin(bAngle) * 80;

          for (let i = 0; i < 6; i++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 80,
              vy: (Math.random() - 0.5) * 80,
              size: 3 + Math.random() * 3,
              alpha: 1,
              life: 0.5,
              maxLife: 0.5,
              color: '#854d0e',
              type: 'wood_debris',
            });
          }

          if (obs.type === 'caiman' || obs.type === 'piranha_shoal') {
            soundManager.playAnimalEncounter(obs.type === 'caiman' ? 'caiman' : 'piranha');
          }
        }
      }
    }

    if (obs.y > 760) {
      obs.active = false;
    }
  }
}

export function updateCollectibles(
  collectibles: Collectible[],
  player: PlayerBoat,
  level: LevelConfig,
  dt: number,
  particles: Particle[]
): void {
  for (const item of collectibles) {
    if (!item.active) continue;

    item.y += level.riverCurrent * dt;
    item.bobOffset = Math.sin(item.bobSpeed * Date.now() * 0.003) * 5;

    const isCollected = checkBoatCollisionWithCircle(player, item.x, item.y + item.bobOffset, item.radius);
    if (isCollected) {
      item.active = false;
      player.score += item.points;

      if (item.type === 'flower') {
        player.flowersCollected += 1;
        soundManager.playCollectItem('flower');
      } else if (item.type === 'fruit') {
        player.health = Math.min(player.maxHealth, player.health + 25);
        soundManager.playCollectItem('fruit');
      } else if (item.type === 'shield') {
        player.shieldDuration = 8;
        soundManager.playCollectItem('shield');
      } else if (item.type === 'paddle_boost') {
        player.speedBoostDuration = 8;
        soundManager.playCollectItem('boost');
      } else if (item.type === 'dorado_fish') {
        player.score += 400;
        soundManager.playCollectItem('boost');
      }

      for (let i = 0; i < 8; i++) {
        particles.push({
          x: item.x,
          y: item.y,
          vx: (Math.random() - 0.5) * 70,
          vy: (Math.random() - 0.5) * 70,
          size: 3 + Math.random() * 3,
          alpha: 1,
          life: 0.45,
          maxLife: 0.45,
          color: item.type === 'flower' ? '#f43f5e' : item.type === 'shield' ? '#38bdf8' : '#eab308',
          type: 'sparkle',
        });
      }
    }

    if (item.y > 760) {
      item.active = false;
    }
  }
}

export function updateParticles(particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.alpha = Math.max(0, p.life / p.maxLife);

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}
