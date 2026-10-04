import React from 'react';
import { X, Keyboard, Smartphone, Compass } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#0b1913] border border-[#234736] rounded-xl max-w-md w-full text-slate-200 overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#1c3b2d] flex items-center justify-between bg-[#0e2119]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif text-lg font-bold text-amber-100">
              Controles de Navegación
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs md:text-sm">
          {/* Keyboard Controls */}
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-semibold mb-2">
              <Keyboard className="w-4 h-4" />
              <span>Teclado (Computadora)</span>
            </div>
            <div className="space-y-2 bg-[#10241b] p-3 rounded-lg border border-[#1f4231] font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Subir río arriba (Avanzar):</span>
                <span className="bg-black/50 px-2 py-0.5 rounded text-emerald-300 border border-white/10">W, ↑ ó Espacio</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Bajar en el río (Contrarremo):</span>
                <span className="bg-black/50 px-2 py-0.5 rounded text-rose-300 border border-white/10">S ó ↓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Virar a la Izquierda:</span>
                <span className="bg-black/50 px-2 py-0.5 rounded text-amber-200 border border-white/10">A ó ←</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Virar a la Derecha:</span>
                <span className="bg-black/50 px-2 py-0.5 rounded text-amber-200 border border-white/10">D ó →</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Pausar partida:</span>
                <span className="bg-black/50 px-2 py-0.5 rounded text-slate-300 border border-white/10">P ó Esc</span>
              </div>
            </div>
          </div>

          {/* Touch / On-Screen Controls */}
          <div>
            <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-2">
              <Smartphone className="w-4 h-4" />
              <span>Táctil / Botones en Pantalla</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed bg-[#10241b] p-3 rounded-lg border border-[#1f4231]">
              Utiliza los botones táctiles en la parte inferior de la pantalla:
              <strong className="text-amber-200 block mt-1">
                Izquierda / Derecha para remar y virar la curiara, Impulso para esprintar y Frenar para desacelerar.
              </strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c3b2d] bg-[#0a1611] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
