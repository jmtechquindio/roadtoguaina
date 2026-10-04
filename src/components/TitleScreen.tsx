import React from 'react';
import { Play, Map, BookOpen, Compass, Waves, Shield, Award } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLevels: () => void;
  onOpenLore: () => void;
  onOpenControls: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLevels,
  onOpenLore,
  onOpenControls,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-53px)] w-full flex flex-col justify-between bg-[#08120d] text-slate-200 overflow-hidden select-none">
      {/* Background Hero Image with Dark Gradient Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/road_to_guainia_cover_1791085865118.jpg"
          alt="Cerros de Mavecure y la barca amazónica"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08120d] via-[#08120d]/75 to-[#08120d]/35" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center items-center text-center">
        {/* Unboxed Metadata Kicker (Anti-slop) */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-amber-300 font-mono tracking-wider mb-2">
          <span>EXPEDICIÓN AMAZÓNICA</span>
          <span aria-hidden="true" className="text-amber-500">·</span>
          <span>10 NIVELES</span>
          <span aria-hidden="true" className="text-amber-500">·</span>
          <span>COLOMBIA</span>
        </div>

        {/* Game Title */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-amber-100 drop-shadow-xl text-balance max-w-2xl">
          Road to Guainía
        </h1>

        <p className="mt-2 text-sm sm:text-base md:text-lg text-emerald-200/90 font-medium max-w-xl drop-shadow">
          Aventura y destreza fluvial en el corazón de la selva virgen
        </p>

        <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed drop-shadow-sm">
          Guía a dos aborígenes en su curiara tradicional por los ríos sagrados de Colombia. Esquiva rocas centenarias, vórtices de agua y fieras salvajes hasta coronar los majestuosos Cerros de Mavecure.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto flex-1 min-w-[160px] py-3 px-6 text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-all transform hover:-translate-y-0.5 shadow-lg shadow-amber-950/50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Comenzar Aventura</span>
          </button>

          <button
            onClick={onOpenLevels}
            className="w-full sm:w-auto py-3 px-5 text-sm font-semibold bg-[#12281e]/90 hover:bg-[#1a382b] border border-[#234d38] text-slate-200 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-xs"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span>Elegir Nivel</span>
          </button>
        </div>

        {/* Secondary Navigation buttons */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-300">
          <button
            onClick={onOpenLore}
            className="hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guía de la Selva</span>
          </button>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <button
            onClick={onOpenControls}
            className="hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instrucciones</span>
          </button>
        </div>
      </div>

      {/* Feature Strip at bottom */}
      <div className="relative z-10 w-full border-t border-white/10 bg-black/40 backdrop-blur-xs py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-around gap-4 text-[11px] md:text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            <span>Física de Remolinos y Raudales</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Caimanes, Pirañas y Anacondas</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Llegada a Cerros de Mavecure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
