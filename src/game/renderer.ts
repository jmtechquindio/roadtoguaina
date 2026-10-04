import { PlayerBoat, Obstacle, Collectible, Particle, LevelConfig } from '../types/game';

interface RenderOptions {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  player: PlayerBoat;
  obstacles: Obstacle[];
  collectibles: Collectible[];
  particles: Particle[];
  level: LevelConfig;
  riverLeft: number;
  riverRight: number;
  time: number;
  lightningTimer: number;
}

export function renderGameScene(options: RenderOptions): void {
  const { ctx, canvas, player, obstacles, collectibles, particles, level, riverLeft, riverRight, time, lightningTimer } = options;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // 1. Draw River Banks & Jungle Background
  drawJungleBackground(ctx, w, h, riverLeft, riverRight, level, time);

  // 2. Draw Flowing River Water
  drawRiverWater(ctx, w, h, riverLeft, riverRight, level, time);

  // 3. Draw Collectibles
  for (const item of collectibles) {
    if (!item.active) continue;
    drawCollectible(ctx, item, time);
  }

  // 4. Draw Obstacles (Whirlpools first so boat and other obstacles float above vortex)
  for (const obs of obstacles) {
    if (!obs.active) continue;
    if (obs.type === 'whirlpool') {
      drawWhirlpool(ctx, obs, time);
    }
  }

  for (const obs of obstacles) {
    if (!obs.active) continue;
    if (obs.type !== 'whirlpool') {
      drawObstacle(ctx, obs, time);
    }
  }

  // 5. Draw Water Particles below boat
  drawParticles(ctx, particles, 'water');
  drawParticles(ctx, particles, 'foam');

  // 6. Draw Player Curiara with Two Rowers
  drawPlayerCuriara(ctx, player, time);

  // 7. Draw Upper Particles (sparks, leaves, debris)
  drawParticles(ctx, particles, 'wood_debris');
  drawParticles(ctx, particles, 'sparkle');
  drawParticles(ctx, particles, 'leaf');

  // 8. Draw Weather & Lighting Overlay
  drawWeatherEffects(ctx, w, h, level, time, lightningTimer);
}

function drawJungleBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  riverLeft: number,
  riverRight: number,
  level: LevelConfig,
  time: number
) {
  // Deep jungle background color
  const bankColor = '#0b1c12';
  ctx.fillStyle = bankColor;
  ctx.fillRect(0, 0, riverLeft, h);
  ctx.fillRect(riverRight, 0, w - riverRight, h);

  // Draw distant Tepuis (Cerros de Mavecure) if applicable
  if (level.backgroundTepuis) {
    drawMavecureTepuis(ctx, w, riverLeft, riverRight, time);
  }

  // Left Bank foliage & shoreline
  drawBankDetails(ctx, 0, riverLeft, h, 'left', time);

  // Right Bank foliage & shoreline
  drawBankDetails(ctx, riverRight, w, h, 'right', time);
}

function drawMavecureTepuis(
  ctx: CanvasRenderingContext2D,
  w: number,
  riverLeft: number,
  riverRight: number,
  time: number
) {
  ctx.save();
  // Three iconic granite monoliths: Mavicure, Mono, and Pajarito
  const cx = (riverLeft + riverRight) / 2;
  const tepuiY = 110;

  // Distant mist
  const mistGrad = ctx.createLinearGradient(0, 0, 0, 160);
  mistGrad.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
  mistGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(riverLeft, 0, riverRight - riverLeft, 160);

  // Cerro Mavicure (Center massive dome)
  ctx.fillStyle = '#1e2927';
  ctx.beginPath();
  ctx.moveTo(cx - 140, tepuiY);
  ctx.quadraticCurveTo(cx - 100, 30, cx, 28);
  ctx.quadraticCurveTo(cx + 100, 30, cx + 140, tepuiY);
  ctx.closePath();
  ctx.fill();

  // Highlight ridge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cerro Mono (Left side peak)
  ctx.fillStyle = '#172220';
  ctx.beginPath();
  ctx.moveTo(cx - 240, tepuiY);
  ctx.quadraticCurveTo(cx - 180, 48, cx - 110, tepuiY);
  ctx.closePath();
  ctx.fill();

  // Cerro Pajarito (Right side sharper horn)
  ctx.fillStyle = '#15201e';
  ctx.beginPath();
  ctx.moveTo(cx + 100, tepuiY);
  ctx.quadraticCurveTo(cx + 175, 42, cx + 230, tepuiY);
  ctx.closePath();
  ctx.fill();

  // Atmospheric haze over peaks
  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.fillRect(cx - 250, 20, 500, 90);

  ctx.restore();
}

function drawBankDetails(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  h: number,
  side: 'left' | 'right',
  time: number
) {
  const bankWidth = endX - startX;
  const edgeX = side === 'left' ? endX : startX;

  // Sandy / clay mud river edge
  ctx.fillStyle = '#452b19';
  const edgeWidth = 14;
  if (side === 'left') {
    ctx.fillRect(edgeX - edgeWidth, 0, edgeWidth, h);
  } else {
    ctx.fillRect(edgeX, 0, edgeWidth, h);
  }

  // Wavy lush vegetation lines
  const steps = 18;
  const stepH = h / steps;
  ctx.fillStyle = '#0f2e1a';

  ctx.beginPath();
  if (side === 'left') {
    ctx.moveTo(0, 0);
    for (let i = 0; i <= steps; i++) {
      const cy = i * stepH;
      const sway = Math.sin(cy * 0.02 + time * 1.5) * 8;
      const x = edgeX - 10 + sway;
      ctx.lineTo(x, cy);
    }
    ctx.lineTo(0, h);
  } else {
    ctx.moveTo(endX, 0);
    for (let i = 0; i <= steps; i++) {
      const cy = i * stepH;
      const sway = Math.cos(cy * 0.02 + time * 1.5) * 8;
      const x = edgeX + 10 + sway;
      ctx.lineTo(x, cy);
    }
    ctx.lineTo(endX, h);
  }
  ctx.closePath();
  ctx.fill();

  // Draw tropical palm fronds and giant jungle leaves reaching into the water
  for (let y = 30; y < h; y += 75) {
    const palmX = side === 'left' ? edgeX - 8 : edgeX + 8;
    const leafDir = side === 'left' ? 1 : -1;
    const sway = Math.sin(time * 2 + y * 0.05) * 6;

    ctx.save();
    ctx.translate(palmX, y + sway);
    ctx.scale(leafDir, 1);

    // Leaf stem
    ctx.strokeStyle = '#22542a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(25, -10, 42, 4);
    ctx.stroke();

    // Leaf blades
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(20, -18, 42, 4);
    ctx.quadraticCurveTo(20, 8, 0, 0);
    ctx.fill();

    ctx.restore();
  }
}

function drawRiverWater(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  riverLeft: number,
  riverRight: number,
  level: LevelConfig,
  time: number
) {
  const riverW = riverRight - riverLeft;

  // Base tea-colored water gradient (characteristic of Guainía blackwater rivers)
  const grad = ctx.createLinearGradient(riverLeft, 0, riverRight, 0);
  grad.addColorStop(0, '#0a1715');
  grad.addColorStop(0.2, level.waterColor);
  grad.addColorStop(0.5, level.waterCurrentColor);
  grad.addColorStop(0.8, level.waterColor);
  grad.addColorStop(1, '#0a1715');

  ctx.fillStyle = grad;
  ctx.fillRect(riverLeft, 0, riverW, h);

  // Animated river current flow lines and foam ribbons
  ctx.save();
  ctx.lineWidth = 1.5;

  const numStreaks = 24;
  for (let i = 0; i < numStreaks; i++) {
    const lane = riverLeft + 35 + ((i * 37) % (riverW - 70));
    const speedMultiplier = 1 + ((i % 4) * 0.2);
    const flowY = ((time * (level.riverCurrent * 0.8 * speedMultiplier) + i * 85) % (h + 80)) - 40;
    const streakLength = 30 + (i % 5) * 16;
    const waveWobble = Math.sin(flowY * 0.04 + time * 3) * 6;

    ctx.strokeStyle = i % 3 === 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(20, 184, 166, 0.15)';
    ctx.beginPath();
    ctx.moveTo(lane + waveWobble, flowY);
    ctx.quadraticCurveTo(lane + waveWobble * 1.5, flowY + streakLength * 0.5, lane, flowY + streakLength);
    ctx.stroke();
  }

  // Victoria Regia (giant Amazonian water lilies) floating on quiet spots
  for (let lilyY = 90; lilyY < h; lilyY += 190) {
    const lilyX = ((lilyY * 73) % 2 === 0) ? riverLeft + 36 : riverRight - 36;
    const bob = Math.sin(time * 2 + lilyY) * 2;
    drawVictoriaRegia(ctx, lilyX, lilyY + bob);
  }

  ctx.restore();
}

function drawVictoriaRegia(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Outer pad
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 1.85);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // Raised rim
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner ribs
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  for (let a = 0; a < Math.PI * 1.8; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16);
    ctx.stroke();
  }

  ctx.restore();
}

function drawWhirlpool(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  const radius = obs.whirlpoolRadius || 85;
  const rot = obs.rotation;

  // Deep dark vortex core
  const coreGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius);
  coreGrad.addColorStop(0, '#020617');
  coreGrad.addColorStop(0.35, '#042f2e');
  coreGrad.addColorStop(0.7, 'rgba(13, 148, 136, 0.4)');
  coreGrad.addColorStop(1, 'rgba(13, 148, 136, 0)');

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Rotating spiral foam arms
  const arms = 4;
  ctx.lineWidth = 2.5;

  for (let i = 0; i < arms; i++) {
    const baseAngle = rot + (i * (Math.PI * 2) / arms);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.65)' : 'rgba(94, 234, 212, 0.55)';

    ctx.beginPath();
    for (let r = 8; r <= radius * 0.95; r += 4) {
      const spiralAngle = baseAngle + (r / radius) * 4.2;
      const sx = Math.cos(spiralAngle) * r;
      const sy = Math.sin(spiralAngle) * r;
      if (r === 8) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // Central suction hole
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  // White center froth
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(Math.cos(rot * 4) * 4, Math.sin(rot * 4) * 4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  if (obs.type === 'rock_small' || obs.type === 'rock_large') {
    drawRiverRock(ctx, obs);
  } else if (obs.type === 'floating_log') {
    drawFloatingLog(ctx, obs, time);
  } else if (obs.type === 'caiman') {
    drawCaiman(ctx, obs, time);
  } else if (obs.type === 'piranha_shoal') {
    drawPiranhaShoal(ctx, obs, time);
  } else if (obs.type === 'anaconda') {
    drawAnaconda(ctx, obs, time);
  }

  ctx.restore();
}

function drawRiverRock(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  const r = obs.radius;

  // Upriver water splash / breaking foam
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -r * 0.3, r + 4, -Math.PI * 0.8, -Math.PI * 0.2);
  ctx.stroke();

  // Rock body (ancient Precambrian black granite of Guainía shield)
  const rockGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
  rockGrad.addColorStop(0, '#52525b');
  rockGrad.addColorStop(0.6, '#27272a');
  rockGrad.addColorStop(1, '#09090b');

  ctx.fillStyle = rockGrad;
  ctx.beginPath();
  // Irregular boulder facets
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.8, -r * 0.6);
  ctx.lineTo(r, 0);
  ctx.lineTo(r * 0.7, r * 0.8);
  ctx.lineTo(-r * 0.3, r);
  ctx.lineTo(-r * 0.9, r * 0.4);
  ctx.lineTo(-r * 0.7, -r * 0.7);
  ctx.closePath();
  ctx.fill();

  // Moss on top
  ctx.fillStyle = '#3f6212';
  ctx.beginPath();
  ctx.arc(-r * 0.2, -r * 0.2, r * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(-r * 0.4, -r * 0.4, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawFloatingLog(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
  ctx.rotate(obs.rotation);
  const w = obs.width;
  const h = obs.height;

  // Water wake around drifting log
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.6, h * 0.75, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Bark
  const woodGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  woodGrad.addColorStop(0, '#3b2416');
  woodGrad.addColorStop(0.5, '#5c3924');
  woodGrad.addColorStop(1, '#2e190e');

  ctx.fillStyle = woodGrad;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 6);
  ctx.fill();

  // Bark grooves
  ctx.strokeStyle = '#27150a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.3, -h * 0.3);
  ctx.lineTo(-w * 0.3, h * 0.3);
  ctx.moveTo(w * 0.1, -h * 0.4);
  ctx.lineTo(w * 0.1, h * 0.2);
  ctx.stroke();
}

function drawCaiman(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
  const anim = obs.animTimer || 0;
  const tailSway = Math.sin(anim * 2) * 8;

  // Shadow / water silhouette
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 18, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Caiman body
  ctx.fillStyle = '#1c2417';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail with sway
  ctx.strokeStyle = '#151d11';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.quadraticCurveTo(tailSway, 40, tailSway * 1.4, 55);
  ctx.stroke();

  // Dorsal ridges / scutes
  ctx.fillStyle = '#2f3d28';
  for (let y = -14; y <= 16; y += 7) {
    ctx.fillRect(-3, y, 6, 3);
  }

  // Head and snout (pointing upriver)
  ctx.fillStyle = '#222d1d';
  ctx.beginPath();
  ctx.moveTo(-8, -18);
  ctx.lineTo(0, -38);
  ctx.lineTo(8, -18);
  ctx.closePath();
  ctx.fill();

  // Reptilian glowing yellow eyes
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(-5, -20, 2.5, 0, Math.PI * 2);
  ctx.arc(5, -20, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.fillRect(-5.5, -21.5, 1, 3);
  ctx.fillRect(4.5, -21.5, 1, 3);
}

function drawPiranhaShoal(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
  const anim = obs.animTimer || 0;

  // Swirling water disturbance
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw 6 jumping/swimming piranhas
  for (let i = 0; i < 6; i++) {
    const angle = (i * (Math.PI * 2) / 6) + anim * 0.8;
    const dist = 14 + (i % 3) * 6;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);

    // Silver back
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red belly
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(-2, 0, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sharp jaw
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(2, -9);
    ctx.lineTo(-2, -7);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

function drawAnaconda(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
  const anim = obs.animTimer || 0;

  // Head
  ctx.fillStyle = '#143823';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head spots
  ctx.fillStyle = '#061a0f';
  ctx.beginPath();
  ctx.arc(-4, -2, 3, 0, Math.PI * 2);
  ctx.arc(4, -2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Amber eyes
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(-5, -6, 2, 0, Math.PI * 2);
  ctx.arc(5, -6, 2, 0, Math.PI * 2);
  ctx.fill();

  // Serpentine trailing body segments
  if (obs.segments) {
    for (let i = 0; i < obs.segments.length; i++) {
      const seg = obs.segments[i];
      const relX = seg.x - obs.x;
      const relY = seg.y - obs.y;
      const segRadius = Math.max(5, 10 - i * 0.8);

      ctx.fillStyle = i % 2 === 0 ? '#1b4d30' : '#143823';
      ctx.beginPath();
      ctx.arc(relX, relY, segRadius, 0, Math.PI * 2);
      ctx.fill();

      // Yellow/black ocelli (rings) on anaconda body
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(relX, relY, segRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCollectible(ctx: CanvasRenderingContext2D, item: Collectible, time: number) {
  ctx.save();
  ctx.translate(item.x, item.y + item.bobOffset);

  // Gentle water ripple ring under item
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 8, 14, 6, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (item.type === 'flower') {
    // Flor de Inírida (Guacamaya superba) - Sacred Colombian Amazon flower
    const rot = time * 1.2;
    ctx.rotate(rot);

    // Glowing halo
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
    glow.addColorStop(0, 'rgba(244, 63, 94, 0.6)');
    glow.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    // Red and white petals
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      ctx.rotate((Math.PI * 2) / petals);
      ctx.fillStyle = i % 2 === 0 ? '#e11d48' : '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(4, -12, 0, -18);
      ctx.quadraticCurveTo(-4, -12, 0, 0);
      ctx.fill();
    }

    // Golden center
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type === 'fruit') {
    // Chontaduro fruit cluster (heals canoe)
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(-5, -2, 7, 0, Math.PI * 2);
    ctx.arc(5, -2, 7, 0, Math.PI * 2);
    ctx.arc(0, 5, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-5, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(0, 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Green stem
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, -12);
    ctx.stroke();
  } else if (item.type === 'shield') {
    // Amuleto Chamánico Puinave
    const pulse = 1 + Math.sin(time * 4) * 0.15;
    ctx.scale(pulse, pulse);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Wooden totem mask
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-8, -12, 16, 24, 4);
    ctx.fill();

    // Sacred carvings
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-6, -10, 12, 20);

    // Glowing eyes
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4, -6, 2, 2);
    ctx.fillRect(2, -6, 2, 2);
  } else if (item.type === 'paddle_boost') {
    // Remos de Guayacán
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crossed paddles
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(10, 10);
    ctx.moveTo(10, -10);
    ctx.lineTo(-10, 10);
    ctx.stroke();
  } else if (item.type === 'dorado_fish') {
    // Peacock bass / Pavón Real
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail fin
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(-6, 20);
    ctx.lineTo(6, 20);
    ctx.closePath();
    ctx.fill();

    // Black spot (ocellus) on tail
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 10, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPlayerCuriara(ctx: CanvasRenderingContext2D, player: PlayerBoat, time: number) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  // If player is invulnerable (flashing)
  if (player.invulnerableTime > 0 && Math.floor(time * 15) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  const w = player.width;
  const h = player.height;

  // 1. Water displacement wake around canoe
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.55);
  ctx.quadraticCurveTo(w * 0.7, 0, w * 0.4, h * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -h * 0.55);
  ctx.quadraticCurveTo(-w * 0.7, 0, -w * 0.4, h * 0.5);
  ctx.stroke();

  // Dynamic wake when climbing up or back-paddling
  if (player.isPaddlingUp) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.58);
    ctx.lineTo(w * 0.7, -h * 0.2);
    ctx.moveTo(0, -h * 0.58);
    ctx.lineTo(-w * 0.7, -h * 0.2);
    ctx.stroke();
  } else if (player.isPaddlingDown) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -h * 0.4, w * 0.55, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
  }

  // 2. Wooden Curiara Hull
  const woodGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  woodGrad.addColorStop(0, '#451a03'); // Dark teak/cedro edge
  woodGrad.addColorStop(0.3, '#78350f'); // Warm amber wood
  woodGrad.addColorStop(0.7, '#92400e');
  woodGrad.addColorStop(1, '#451a03');

  ctx.fillStyle = woodGrad;
  ctx.beginPath();
  // Elegant curved canoe shape (tapered pointed bow & stern)
  ctx.moveTo(0, -h * 0.52); // Bow tip
  ctx.quadraticCurveTo(w * 0.58, -h * 0.2, w * 0.52, 0);
  ctx.quadraticCurveTo(w * 0.46, h * 0.35, 0, h * 0.52); // Stern tip
  ctx.quadraticCurveTo(-w * 0.46, h * 0.35, -w * 0.52, 0);
  ctx.quadraticCurveTo(-w * 0.58, -h * 0.2, 0, -h * 0.52);
  ctx.closePath();
  ctx.fill();

  // Canoe inner cavity
  ctx.fillStyle = '#291206';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.45);
  ctx.quadraticCurveTo(w * 0.38, -h * 0.15, w * 0.34, 0);
  ctx.quadraticCurveTo(w * 0.3, h * 0.3, 0, h * 0.45);
  ctx.quadraticCurveTo(-w * 0.3, h * 0.3, -w * 0.34, 0);
  ctx.quadraticCurveTo(-w * 0.38, -h * 0.15, 0, -h * 0.45);
  ctx.closePath();
  ctx.fill();

  // Indigenous geometric painting on bow gunwales
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.25, -h * 0.4);
  ctx.lineTo(0, -h * 0.48);
  ctx.lineTo(w * 0.25, -h * 0.4);
  ctx.stroke();

  ctx.strokeStyle = '#ef4444';
  ctx.strokeRect(-w * 0.18, -h * 0.35, w * 0.36, 3);

  // 3. Front Rower (Wami - Navigator)
  const frontY = -h * 0.18;
  drawRower(ctx, 0, frontY, 'front', player, time);

  // 4. Rear Rower (Karu - Helmsman)
  const rearY = h * 0.22;
  drawRower(ctx, 0, rearY, 'rear', player, time);

  // 5. Spirit Shield Aura (if active)
  if (player.shieldDuration > 0) {
    const pulse = 1 + Math.sin(time * 6) * 0.08;
    ctx.save();
    ctx.scale(pulse, pulse);

    const shieldGrad = ctx.createRadialGradient(0, 0, h * 0.3, 0, 0, h * 0.65);
    shieldGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    shieldGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.4)');
    shieldGrad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.95, h * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sacred spirit runes spinning around canoe
    ctx.rotate(time * 2);
    for (let r = 0; r < 4; r++) {
      ctx.rotate((Math.PI * 2) / 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(w * 0.85, -2, 6, 4);
    }
    ctx.restore();
  }

  // 6. Guayacan Paddle Speed Trail
  if (player.speedBoostDuration > 0) {
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-w * 0.4, h * 0.4);
    ctx.lineTo(-w * 0.7, h * 0.7);
    ctx.moveTo(w * 0.4, h * 0.4);
    ctx.lineTo(w * 0.7, h * 0.7);
    ctx.stroke();
  }

  ctx.restore();
}

function drawRower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  position: 'front' | 'rear',
  player: PlayerBoat,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);

  const cycle = player.paddleCycle;
  // Alternate stroke side or stroke dynamically based on steering
  const isPaddlingLeft = player.isPaddlingLeft;
  const isPaddlingRight = player.isPaddlingRight;

  let strokePhase = Math.sin(cycle + (position === 'front' ? 0 : Math.PI));
  if (isPaddlingLeft) strokePhase = Math.sin(cycle * 1.5);
  if (isPaddlingRight) strokePhase = -Math.sin(cycle * 1.5);

  const paddleAngle = strokePhase * 0.45;
  const paddleReachX = Math.sin(paddleAngle) * 26;
  const paddleReachY = Math.cos(paddleAngle) * 12;

  // Indigenous Rower Body (skin tone, shoulders)
  ctx.fillStyle = '#9a3412'; // Amazonian tanned skin tone
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head and traditional headband (vincha indígena roja)
  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.arc(0, -6, 5, 0, Math.PI * 2);
  ctx.fill();

  // Vincha headband
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-4, -8, 8, 2);

  // Feather in headband
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(2, -8);
  ctx.lineTo(5, -14);
  ctx.stroke();

  // Paddle shaft & blade
  // Determine which side the paddle is active on
  const paddleSide = (position === 'front')
    ? (isPaddlingRight ? 1 : isPaddlingLeft ? -1 : (strokePhase > 0 ? 1 : -1))
    : (isPaddlingRight ? 1 : isPaddlingLeft ? -1 : (strokePhase > 0 ? -1 : 1));

  const shaftLength = 26;
  const handX = paddleSide * 4;
  const tipX = handX + paddleSide * shaftLength * 0.75 + paddleReachX * 0.4;
  const tipY = paddleReachY;

  // Arms
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, -1);
  ctx.lineTo(handX, tipY * 0.3);
  ctx.moveTo(4, -1);
  ctx.lineTo(handX, tipY * 0.3);
  ctx.stroke();

  // Paddle wooden shaft
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(handX - paddleSide * 8, -tipY * 0.4);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  // Paddle blade
  ctx.fillStyle = '#a16207';
  ctx.beginPath();
  ctx.ellipse(tipX, tipY, 4, 8, paddleAngle, 0, Math.PI * 2);
  ctx.fill();

  // Blade splash ring if paddle dips in water
  if (Math.abs(strokePhase) > 0.7) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], typeFilter: Particle['type']) {
  ctx.save();
  for (const p of particles) {
    if (p.type !== typeFilter) continue;
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.type === 'foam' || p.type === 'water') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'leaf') {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, p.alpha * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'sparkle') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'wood_debris') {
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
    }
  }
  ctx.restore();
}

function drawWeatherEffects(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  level: LevelConfig,
  time: number,
  lightningTimer: number
) {
  // Lightning flash during storm
  if (lightningTimer > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${lightningTimer * 0.45})`;
    ctx.fillRect(0, 0, w, h);
  }

  if (level.weather === 'RAIN' || level.weather === 'STORM') {
    // Rain streaks
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const rainCount = level.weather === 'STORM' ? 45 : 25;
    for (let i = 0; i < rainCount; i++) {
      const rx = (i * 29 + time * 180) % w;
      const ry = (i * 47 + time * 650) % h;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 4, ry + 16);
    }
    ctx.stroke();
  }

  if (level.weather === 'MIST') {
    // Jungle mist bands drifting across screen
    ctx.save();
    for (let m = 0; m < 3; m++) {
      const mistY = ((time * 15 + m * 240) % (h + 120)) - 60;
      const mistGrad = ctx.createLinearGradient(0, mistY - 40, 0, mistY + 40);
      mistGrad.addColorStop(0, 'rgba(241, 245, 249, 0)');
      mistGrad.addColorStop(0.5, 'rgba(241, 245, 249, 0.16)');
      mistGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');

      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, mistY - 40, w, 80);
    }
    ctx.restore();
  }

  if (level.weather === 'GOLDEN_HOUR' || level.weather === 'SUNSET') {
    // Rich warm Amazonian sunset glow overlay
    const glow = ctx.createRadialGradient(w / 2, 0, 10, w / 2, h / 2, w);
    glow.addColorStop(0, 'rgba(251, 146, 60, 0.16)');
    glow.addColorStop(0.7, 'rgba(244, 63, 94, 0.08)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }
}
