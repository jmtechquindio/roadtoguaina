import { PlayerBoat, Obstacle, Collectible, LevelConfig, Particle } from '../types/game';
import { soundManager } from '../audio/soundManager';

export function createInitialPlayer(level: LevelConfig, canvasWidth: number, canvasHeight: number): PlayerBoat {
  return {
    x: canvasWidth / 2,
    y: canvasHeight - 160,
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
    isBoosting: false,
    score: 0,
    flowersCollected: 0,
    distanceTraveled: 0,
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
  const isSprinting = (input.boost || input.up) && player.stamina > 5;
  player.isBoosting = isSprinting;

  if (isSprinting) {
    player.stamina = Math.max(0, player.stamina - dt * 26);
  } else {
    player.stamina = Math.min(player.maxStamina, player.stamina + dt * 18);
  }

  // Rowers paddle animation cycle
  const speed = Math.hypot(player.vx, player.vy);
  player.paddleCycle += dt * (4 + speed * 0.05);

  // Steering torque
  const turnPower = 4.2;
  player.isPaddlingLeft = input.left;
  player.isPaddlingRight = input.right;

  if (input.left) {
    player.angularVelocity -= turnPower * dt;
    // Splash particles from left paddle
    if (Math.random() < 0.35) {
      soundManager.playPaddleSplash('left');
      particles.push({
        x: player.x - 18,
        y: player.y + 10,
        vx: -20 - Math.random() * 20,
        vy: 20 + Math.random() * 20,
        size: 3 + Math.random() * 4,
        alpha: 0.8,
        life: 0.35,
        maxLife: 0.35,
        color: '#ccecf0',
        type: 'foam'
      });
    }
  }
  if (input.right) {
    player.angularVelocity += turnPower * dt;
    if (Math.random() < 0.35) {
      soundManager.playPaddleSplash('right');
      particles.push({
        x: player.x + 18,
        y: player.y + 10,
        vx: 20 + Math.random() * 20,
        vy: 20 + Math.random() * 20,
        size: 3 + Math.random() * 4,
        alpha: 0.8,
        life: 0.35,
        maxLife: 0.35,
        color: '#ccecf0',
        type: 'foam'
      });
    }
  }

  // Natural angular damping (water resistance to rotation)
  player.angularVelocity *= Math.pow(0.08, dt);
  player.angle += player.angularVelocity * dt;

  // Clamp boat angle within +/- 60 degrees (cannot face directly backward against raging current)
  const maxAngle = Math.PI / 3.2;
  if (player.angle > maxAngle) {
    player.angle = maxAngle;
    player.angularVelocity = 0;
  } else if (player.angle < -maxAngle) {
    player.angle = -maxAngle;
    player.angularVelocity = 0;
  }

  // Propulsion forward along boat's heading
  let baseThrust = 160;
  if (player.speedBoostDuration > 0) baseThrust += 100;
  if (isSprinting) baseThrust += 85;
  if (input.down) baseThrust *= 0.4; // back-paddling brake

  // Forward thrust vector based on angle
  const thrustX = Math.sin(player.angle) * baseThrust;
  const thrustY = -Math.cos(player.angle) * baseThrust;

  // Apply thrust to velocity
  player.vx += thrustX * dt * 2.8;
  player.vy += thrustY * dt * 2.8;

  // Water linear drag
  player.vx *= Math.pow(0.12, dt);
  player.vy *= Math.pow(0.12, dt);

  // Position updates
  player.x += player.vx * dt;
  // y position is bounded inside a comfortable forward/backward band in the bottom half of screen
  player.y += player.vy * dt;

  // Clamp Y inside screen
  if (player.y < 280) player.y = 280;
  if (player.y > 640) player.y = 640;

  // Bank collision bounds
  const margin = player.width * 0.8;
  if (player.x < riverLeft + margin) {
    player.x = riverLeft + margin;
    player.vx = Math.abs(player.vx) * 0.4 + 20;
    if (player.invulnerableTime <= 0 && player.shieldDuration <= 0) {
      player.health -= 3;
      soundManager.playRockCollision();
      player.invulnerableTime = 0.4;
    }
  } else if (player.x > riverRight - margin) {
    player.x = riverRight - margin;
    player.vx = -Math.abs(player.vx) * 0.4 - 20;
    if (player.invulnerableTime <= 0 && player.shieldDuration <= 0) {
      player.health -= 3;
      soundManager.playRockCollision();
      player.invulnerableTime = 0.4;
    }
  }

  // Advance expedition distance
  const forwardSpeed = Math.max(80, -player.vy * 0.6 + level.riverCurrent);
  player.distanceTraveled += (forwardSpeed * dt * 0.35);

  // Score increases with distance
  player.score += Math.round(dt * 15 * (isSprinting ? 1.5 : 1));

  // Stern wake particles
  if (Math.random() < 0.6) {
    const sternX = player.x - Math.sin(player.angle) * (player.height * 0.45);
    const sternY = player.y + Math.cos(player.angle) * (player.height * 0.45);
    particles.push({
      x: sternX + (Math.random() - 0.5) * 10,
      y: sternY + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 15,
      vy: level.riverCurrent * 0.3 + Math.random() * 20,
      size: 2 + Math.random() * 4,
      alpha: 0.7,
      life: 0.5,
      maxLife: 0.5,
      color: '#d0eff5',
      type: 'water'
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
  // We test 3 circles along the canoe hull: bow, center, stern
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
      const pullRadius = obs.whirlpoolRadius || 120;
      const strength = obs.whirlpoolStrength || 280;
      const dx = obs.x - player.x;
      const dy = obs.y - player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < pullRadius) {
        // Gravitational inward pull
        const normalizedDist = Math.max(0.1, dist / pullRadius);
        const pullFactor = (1 - normalizedDist) * strength;
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Player pulled toward whirlpool center
        const vortexResistance = player.speedBoostDuration > 0 ? 0.35 : 1.0;
        player.vx += dirX * pullFactor * dt * 2.2 * vortexResistance;
        player.vy += dirY * pullFactor * dt * 2.2 * vortexResistance;

        // Tangential spin force (orbits clockwise)
        const tangX = -dirY;
        const tangY = dirX;
        player.vx += tangX * pullFactor * dt * 1.5 * vortexResistance;
        player.vy += tangY * pullFactor * dt * 1.5 * vortexResistance;
        player.angularVelocity += (1 - normalizedDist) * 3.5 * dt * vortexResistance;

        // Proximity warning sound
        soundManager.playWhirlpoolWarning(1 - normalizedDist);

        // Water suction particles
        if (Math.random() < 0.4) {
          const pAngle = Math.random() * Math.PI * 2;
          const pDist = 30 + Math.random() * (pullRadius - 30);
          particles.push({
            x: obs.x + Math.cos(pAngle) * pDist,
            y: obs.y + Math.sin(pAngle) * pDist,
            vx: -Math.cos(pAngle) * 50 - Math.sin(pAngle) * 60,
            vy: -Math.sin(pAngle) * 50 + Math.cos(pAngle) * 60,
            size: 2 + Math.random() * 3,
            alpha: 0.6,
            life: 0.4,
            maxLife: 0.4,
            color: '#a0e4e0',
            type: 'foam'
          });
        }

        // Inner eye damage
        if (dist < 32 && player.invulnerableTime <= 0 && player.shieldDuration <= 0) {
          player.health -= 12 * dt;
          soundManager.playRockCollision();
        }
      }
    } else if (obs.type === 'caiman') {
      obs.animTimer = (obs.animTimer || 0) + dt * 4;
      const dx = player.x - obs.x;
      const dy = player.y - obs.y;
      const dist = Math.hypot(dx, dy);

      // Caiman stalks and lunges if boat is near
      if (dist < 200 && dy > -50) {
        obs.vx = (dx / dist) * 70;
        obs.vy = 25;
        if (Math.random() < 0.05) {
          soundManager.playAnimalEncounter('caiman');
        }
      }
    } else if (obs.type === 'piranha_shoal') {
      obs.animTimer = (obs.animTimer || 0) + dt * 8;
      // Shoal weaves across river
      obs.vx = Math.sin(obs.animTimer * 0.8) * 80;
      if (Math.random() < 0.08) {
        soundManager.playAnimalEncounter('piranha');
      }
    } else if (obs.type === 'anaconda') {
      obs.animTimer = (obs.animTimer || 0) + dt * 3;
      obs.vx = Math.cos(obs.animTimer * 0.6) * 60;
      // Animate segments
      if (!obs.segments) {
        obs.segments = Array.from({ length: 6 }, () => ({ x: obs.x, y: obs.y, angle: 0 }));
      }
      for (let i = 0; i < obs.segments.length; i++) {
        const seg = obs.segments[i];
        const lag = (i + 1) * 0.25;
        seg.x = obs.x + Math.sin(obs.animTimer - lag) * 16 * (i + 1);
        seg.y = obs.y - (i + 1) * 18;
      }
    }

    // Check collision with boat
    if (obs.type !== 'whirlpool') {
      const isColliding = checkBoatCollisionWithCircle(player, obs.x, obs.y, obs.radius);
      if (isColliding) {
        if (player.shieldDuration > 0) {
          // Deflected by spirit shield!
          obs.active = false;
          player.score += 150;
          soundManager.playCollectItem('shield');
          // Splash burst
          for (let p = 0; p < 8; p++) {
            particles.push({
              x: obs.x,
              y: obs.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120,
              size: 4 + Math.random() * 4,
              alpha: 0.9,
              life: 0.5,
              maxLife: 0.5,
              color: '#facc15',
              type: 'sparkle'
            });
          }
        } else if (player.invulnerableTime <= 0) {
          player.health -= obs.healthDamage;
          player.invulnerableTime = 0.8;
          soundManager.playRockCollision();

          // Physical bounce impulse
          const bAngle = Math.atan2(player.y - obs.y, player.x - obs.x);
          player.vx += Math.cos(bAngle) * 180;
          player.vy += Math.sin(bAngle) * 100;

          // Debris particles
          for (let i = 0; i < 7; i++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 100,
              vy: (Math.random() - 0.5) * 100,
              size: 3 + Math.random() * 4,
              alpha: 1,
              life: 0.6,
              maxLife: 0.6,
              color: '#854d0e',
              type: 'wood_debris'
            });
          }

          if (obs.type === 'caiman' || obs.type === 'piranha_shoal') {
            soundManager.playAnimalEncounter(obs.type === 'caiman' ? 'caiman' : 'piranha');
          }
        }
      }
    }

    // Deactivate obstacles that moved off bottom of screen
    if (obs.y > 800) {
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
    item.bobOffset = Math.sin(item.bobSpeed * Date.now() * 0.003) * 6;

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
        player.shieldDuration = 7;
        soundManager.playCollectItem('shield');
      } else if (item.type === 'paddle_boost') {
        player.speedBoostDuration = 8;
        soundManager.playCollectItem('boost');
      } else if (item.type === 'dorado_fish') {
        player.score += 400;
        soundManager.playCollectItem('boost');
      }

      // Sparkle burst
      for (let i = 0; i < 10; i++) {
        particles.push({
          x: item.x,
          y: item.y,
          vx: (Math.random() - 0.5) * 80,
          vy: (Math.random() - 0.5) * 80,
          size: 3 + Math.random() * 3,
          alpha: 1,
          life: 0.5,
          maxLife: 0.5,
          color: item.type === 'flower' ? '#f43f5e' : item.type === 'shield' ? '#38bdf8' : '#eab308',
          type: 'sparkle'
        });
      }
    }

    if (item.y > 800) {
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
