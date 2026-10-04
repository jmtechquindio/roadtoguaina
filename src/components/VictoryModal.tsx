import React from 'react';
import { LevelConfig, PlayerBoat } from '../types/game';
import { Star, Award, ArrowRight, RotateCcw, Map, Trophy, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  level: LevelConfig;
  player: PlayerBoat;
  stars: number;
  isGameComplete: boolean;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onOpenLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  player,
  stars,
  isGameComplete,
  onNextLevel,
  onReplayLevel,
  onOpenLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#0b1913] border border-[#234736] rounded-xl max-w-lg w-full text-slate-200 overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* If Grand Finale completed */}
        {isGameComplete ? (
          <div>
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#09140f]">
              <img
                src="/src/assets/images/road_to_guainia_cover_1791085865118.jpg"
                alt="Cerros de Mavecure Guainía"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1913] via-[#0b1913]/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  ¡Gran Hazaña Amazónica!
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                  Llegada a los Cerros de Mavecure
                </h2>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Has surcado los diez tramos fluviales del Guainía. Tu curiara y los dos remeros han burlado los remolinos más furiosos, rocas milenarias, caimanes y fieras salvajes bajo la mirada de los tres monolitos sagrados.
              </p>

              {/* Grand Stats */}
              <div className="grid grid-cols-3 gap-2 bg-[#12261b] p-3 rounded-lg border border-[#1f4231] text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Puntaje Final</span>
                  <span className="text-base font-bold text-amber-300">{player.score}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Flores de Inírida</span>
                  <span className="text-base font-bold text-rose-300">{player.flowersCollected}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Título Obtenido</span>
                  <span className="text-[11px] font-bold text-emerald-300">Gran Timonel</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onOpenLevelSelect}
                  className="flex-1 py-2 px-3 text-xs font-semibold bg-[#1a3828] hover:bg-[#234d37] border border-[#2d6146] text-slate-200 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Map className="w-4 h-4 text-emerald-400" />
                  <span>Ver Mapa</span>
                </button>
                <button
                  onClick={onReplayLevel}
                  className="flex-1 py-2 px-3 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Volver a Jugar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Standard Level Success */}
            <div className="p-5 border-b border-[#1c3b2d] bg-[#0e2119] text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Tramo Fluvial Conquistado
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 mt-1">
                {level.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {level.landmark}
              </p>

              {/* Stars Earned */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-7 h-7 ${
                      s <= stars
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Lore quote */}
              <blockquote className="italic text-xs text-emerald-300/90 bg-[#12281d] p-3 rounded-md border-l-2 border-emerald-500">
                "{level.lore}"
              </blockquote>

              {/* Level Stats */}
              <div className="grid grid-cols-3 gap-2 bg-[#12261b] p-3 rounded-lg border border-[#1f4231] text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Distancia</span>
                  <span className="text-sm font-bold text-slate-200">{level.targetDistance}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Casco Final</span>
                  <span className="text-sm font-bold text-emerald-400">{Math.round(player.health)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Puntos</span>
                  <span className="text-sm font-bold text-amber-300">{player.score}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onReplayLevel}
                  className="py-2.5 px-3 text-xs font-semibold bg-[#173022] hover:bg-[#204230] border border-[#26533c] text-slate-300 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Repetir nivel para mejorar estrellas"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Repetir</span>
                </button>

                <button
                  onClick={onNextLevel}
                  className="flex-1 py-2.5 px-4 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Siguiente Nivel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
