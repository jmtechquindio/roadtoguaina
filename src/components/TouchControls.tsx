import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap } from 'lucide-react';

interface TouchControlsProps {
  onInputStateChange: (input: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    boost: boolean;
  }) => void;
  inputState: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    boost: boolean;
  };
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputStateChange,
  inputState,
}) => {
  const setKey = (key: keyof typeof inputState, val: boolean) => {
    onInputStateChange({
      ...inputState,
      [key]: val,
    });
  };

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 md:px-8 flex items-center justify-between pointer-events-none select-none z-20">
      {/* Left Paddle Controller */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onPointerDown={() => setKey('left', true)}
          onPointerUp={() => setKey('left', false)}
          onPointerLeave={() => setKey('left', false)}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 border cursor-pointer ${
            inputState.left
              ? 'bg-amber-500/80 border-amber-300 text-slate-950 shadow-lg scale-95'
              : 'bg-black/60 hover:bg-black/80 border-white/20 text-amber-200 backdrop-blur-xs'
          }`}
          title="Remar a la izquierda (Tecla A o Flecha Izquierda)"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-[10px] font-semibold mt-0.5">Izquierda</span>
        </button>

        <button
          type="button"
          onPointerDown={() => setKey('right', true)}
          onPointerUp={() => setKey('right', false)}
          onPointerLeave={() => setKey('right', false)}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 border cursor-pointer ${
            inputState.right
              ? 'bg-amber-500/80 border-amber-300 text-slate-950 shadow-lg scale-95'
              : 'bg-black/60 hover:bg-black/80 border-white/20 text-amber-200 backdrop-blur-xs'
          }`}
          title="Remar a la derecha (Tecla D o Flecha Derecha)"
        >
          <ArrowRight className="w-6 h-6" />
          <span className="text-[10px] font-semibold mt-0.5">Derecha</span>
        </button>
      </div>

      {/* Right Propulsion / Boost Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onPointerDown={() => setKey('down', true)}
          onPointerUp={() => setKey('down', false)}
          onPointerLeave={() => setKey('down', false)}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 border cursor-pointer ${
            inputState.down
              ? 'bg-rose-600/80 border-rose-300 text-white shadow-lg scale-95'
              : 'bg-black/60 hover:bg-black/80 border-white/20 text-slate-300 backdrop-blur-xs'
          }`}
          title="Contrarremo / Frenar (Tecla S o Flecha Abajo)"
        >
          <ArrowDown className="w-5 h-5" />
          <span className="text-[9px] font-semibold mt-0.5">Frenar</span>
        </button>

        <button
          type="button"
          onPointerDown={() => setKey('up', true)}
          onPointerUp={() => setKey('up', false)}
          onPointerLeave={() => setKey('up', false)}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 border cursor-pointer ${
            inputState.up || inputState.boost
              ? 'bg-emerald-500/90 border-emerald-300 text-slate-950 shadow-lg scale-95 ring-2 ring-emerald-400/50'
              : 'bg-black/60 hover:bg-black/80 border-white/20 text-emerald-300 backdrop-blur-xs'
          }`}
          title="Remar Fuerte / Impulso (Tecla W, Espacio o Flecha Arriba)"
        >
          <Zap className="w-6 h-6 fill-current" />
          <span className="text-[10px] font-bold mt-0.5">Impulso</span>
        </button>
      </div>
    </div>
  );
};
