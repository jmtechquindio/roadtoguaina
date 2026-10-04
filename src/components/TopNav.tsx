import React from 'react';
import { Volume2, VolumeX, Pause, Play, Map, BookOpen, Compass } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TopNavProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenLevels: () => void;
  onOpenLore: () => void;
  onOpenControls: () => void;
  currentLevelName: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  isMuted,
  onToggleMute,
  isPaused,
  onTogglePause,
  onOpenLevels,
  onOpenLore,
  onOpenControls,
  currentLevelName,
}) => {
  return (
    <header className="w-full bg-[#0a1410] border-b border-[#1f3b2d] px-4 md:px-8 py-3 flex items-center justify-between text-slate-200 select-none z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <span className="font-serif text-lg md:text-xl font-bold tracking-tight text-amber-100 whitespace-nowrap">
          Road to Guainía
        </span>
        <span className="hidden lg:inline text-xs text-emerald-400 font-mono">
          · {currentLevelName}
        </span>
      </div>

      {/* Zone 2: 4 clean text navigation links */}
      <nav className="hidden sm:flex items-center gap-6 text-xs md:text-sm font-medium text-slate-300">
        <button
          onClick={onOpenLevels}
          className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Map className="w-4 h-4 text-emerald-400" />
          <span>Niveles</span>
        </button>

        <button
          onClick={onOpenLore}
          className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Guía del Río</span>
        </button>

        <button
          onClick={onOpenControls}
          className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Controles</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          className="p-2 text-slate-300 hover:text-amber-200 bg-[#14291f] hover:bg-[#1c3a2c] rounded-md transition-colors border border-[#284f3c] cursor-pointer"
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onTogglePause}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-sm"
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
        </button>
      </div>
    </header>
  );
};
