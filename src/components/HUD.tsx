import React from 'react';
import { PlayerBoat, LevelConfig } from '../types/game';
import { Shield, Sparkles, AlertTriangle, Zap } from 'lucide-react';

interface HUDProps {
  player: PlayerBoat;
  level: LevelConfig;
  totalLevels: number;
}

export const HUD: React.FC<HUDProps> = ({ player, level, totalLevels }) => {
  const distancePct = Math.min(100, Math.round((player.distanceTraveled / level.targetDistance) * 100));
  const healthPct = Math.max(0, Math.round(player.health));
  const staminaPct = Math.max(0, Math.round(player.stamina));

  const healthColor = healthPct > 60 ? 'bg-emerald-500' : healthPct > 30 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="absolute top-0 left-0 right-0 p-3 md:p-4 pointer-events-none select-none z-10 flex flex-col gap-2">
      {/* Top Row: Unboxed Level Metadata & Score */}
      <div className="flex items-center justify-between text-xs md:text-sm text-slate-300 drop-shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-200">
            Nivel {level.id}/{totalLevels}
          </span>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <span className="font-medium text-slate-200">{level.name}</span>
          <span aria-hidden="true" className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 hidden sm:inline">{level.landmark}</span>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums">
          <div className="flex items-center gap-1 text-rose-300">
            <span className="text-xs text-rose-400">Flores:</span>
            <span className="font-bold">{player.flowersCollected}</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-amber-300">
            <span className="text-xs text-amber-400">Puntos:</span>
            <span className="font-bold">{player.score}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: River Progress Bar & Gauges */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Distance Progress */}
        <div className="flex-1 bg-black/60 backdrop-blur-xs p-2 rounded-md border border-white/10 max-w-md">
          <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
            <span className="font-mono text-emerald-300">
              Rumbo a la meta: {Math.round(player.distanceTraveled)}m / {level.targetDistance}m
            </span>
            <span className="font-bold font-mono text-amber-300">{distancePct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-150 ease-out"
              style={{ width: `${distancePct}%` }}
            />
          </div>
        </div>

        {/* Hull Health & Stamina Gauges */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xs p-2 rounded-md border border-white/10">
          {/* Hull Integrity */}
          <div className="flex flex-col gap-1 w-28">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">Casco</span>
              <span className="font-mono font-bold text-slate-200">{healthPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${healthColor} transition-all duration-150 ease-out`}
                style={{ width: `${healthPct}%` }}
              />
            </div>
          </div>

          {/* Rower Stamina */}
          <div className="flex flex-col gap-1 w-24">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">Fuerza</span>
              <span className="font-mono font-bold text-cyan-300">{staminaPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-150 ease-out"
                style={{ width: `${staminaPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Powerups & Warnings Row */}
      <div className="flex items-center gap-2">
        {player.shieldDuration > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-950/80 border border-sky-400/40 rounded-md text-sky-200 text-xs shadow-sm animate-pulse">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium">Amuleto Chamánico ({Math.ceil(player.shieldDuration)}s)</span>
          </div>
        )}

        {player.speedBoostDuration > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-400/40 rounded-md text-amber-200 text-xs shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Remos de Guayacán ({Math.ceil(player.speedBoostDuration)}s)</span>
          </div>
        )}

        {healthPct < 25 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/90 border border-rose-500/60 rounded-md text-rose-200 text-xs animate-bounce">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">¡Casco averiado! Busca Chontaduro</span>
          </div>
        )}
      </div>
    </div>
  );
};
