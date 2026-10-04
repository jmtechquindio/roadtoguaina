import React from 'react';
import { LevelConfig, PlayerBoat } from '../types/game';
import { RotateCcw, AlertOctagon, Map, Lightbulb } from 'lucide-react';

interface GameOverModalProps {
  level: LevelConfig;
  player: PlayerBoat;
  onRetry: () => void;
  onOpenLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  player,
  onRetry,
  onOpenLevelSelect,
}) => {
  const distancePct = Math.min(100, Math.round((player.distanceTraveled / level.targetDistance) * 100));

  // Helpful tactical advice
  let survivalTip = 'Recoge el Chontaduro (frutas anaranjadas) para reparar el casco dañado.';
  if (level.whirlpoolChance > 0.3) {
    survivalTip = 'En los remolinos: no luches de frente contra el vórtice, rema en diagonal hacia afuera para salir expulsado con la corriente.';
  } else if (level.animalTypes.includes('caiman')) {
    survivalTip = 'Los caimanes negros atacan cuando te acercas a sus ojos amarillos. Maniobra con anticipación.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
      <div className="bg-[#140c0c] border border-rose-950/80 rounded-xl max-w-md w-full text-slate-200 overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-rose-900/30 bg-[#1f1010] text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-rose-950/80 border border-rose-700/50 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
            La Selva Ha Vencido
          </span>
          <h2 className="font-serif text-xl font-bold text-amber-100 mt-1">
            Curiara Naufragada
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {level.name}
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Progress */}
          <div className="bg-black/50 p-3 rounded-lg border border-white/5 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Recorrido alcanzado:</span>
              <span className="font-bold text-amber-300">{Math.round(player.distanceTraveled)}m / {level.targetDistance}m ({distancePct}%)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${distancePct}%` }} />
            </div>
          </div>

          {/* Tip */}
          <div className="p-3 rounded-lg bg-[#241712] border border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-200">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 mb-0.5">Consejo de los Ancianos:</strong>
              <p className="text-slate-300 leading-relaxed">{survivalTip}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onOpenLevelSelect}
              className="py-2.5 px-3 text-xs font-semibold bg-[#211515] hover:bg-[#2e1d1d] border border-white/10 text-slate-300 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Map className="w-4 h-4 text-slate-400" />
              <span>Niveles</span>
            </button>

            <button
              onClick={onRetry}
              className="flex-1 py-2.5 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reintentar Tramo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
