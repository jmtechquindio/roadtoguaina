import React from 'react';
import { LevelConfig, LevelProgress } from '../types/game';
import { X, Lock, Star, Play, Award, Compass } from 'lucide-react';

interface LevelSelectModalProps {
  levels: LevelConfig[];
  progress: Record<number, LevelProgress>;
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  progress,
  currentLevelId,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#0b1913] border border-[#234736] rounded-xl max-w-2xl w-full text-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#1c3b2d] flex items-center justify-between bg-[#0e2119]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-amber-100">
                Expediciones del Guainía
              </h2>
              <p className="text-xs text-slate-400">
                10 niveles remontando los ríos sagrados de la Amazonía
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Levels Grid */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-3">
          {levels.map((lvl) => {
            const lvlProgress = progress[lvl.id] || { unlocked: lvl.id === 1, stars: 0, highScore: 0, completed: false };
            const isUnlocked = lvlProgress.unlocked;
            const isSelected = lvl.id === currentLevelId;

            return (
              <div
                key={lvl.id}
                className={`p-3 md:p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isUnlocked
                    ? isSelected
                      ? 'bg-[#142e22] border-emerald-500/80 shadow-md'
                      : 'bg-[#0f241a] hover:bg-[#142d20] border-[#224835]'
                    : 'bg-black/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-sm shrink-0 ${
                      isUnlocked
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isUnlocked ? lvl.id : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm md:text-base text-slate-100">
                        {lvl.name}
                      </h3>
                      {lvl.id === 10 && (
                        <span className="text-[10px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-600/50 px-1.5 py-0.5 rounded-sm">
                          Cerros Sagrados
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-400/90 font-medium">
                      {lvl.landmark} · {lvl.targetDistance}m
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {lvl.description}
                    </p>
                  </div>
                </div>

                {/* Stars & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1a3829]">
                  {isUnlocked && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((starNum) => (
                        <Star
                          key={starNum}
                          className={`w-4 h-4 ${
                            starNum <= lvlProgress.stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        onSelectLevel(lvl.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isSelected ? 'Continuar' : 'Navegar'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      Bloqueado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#1c3b2d] bg-[#0a1611] text-xs text-slate-400 flex items-center justify-between">
          <span>Supera cada nivel para desbloquear el siguiente tramo del río.</span>
          <span className="font-mono text-emerald-400">10 / 10 Expediciones</span>
        </div>
      </div>
    </div>
  );
};
