import React from 'react';
import { X, BookOpen, AlertTriangle, Shield, Compass, Waves } from 'lucide-react';

interface LoreModalProps {
  onClose: () => void;
}

export const LoreModal: React.FC<LoreModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#0b1913] border border-[#234736] rounded-xl max-w-2xl w-full text-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#1c3b2d] flex items-center justify-between bg-[#0e2119]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-amber-100">
                Guía de Navegación del Guainía
              </h2>
              <p className="text-xs text-slate-400">
                Secretos ancestrales de los ríos Inírida, Guaviare y Atabapo
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

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5 text-xs md:text-sm text-slate-300">
          {/* Section 1: The Canoe & Rowers */}
          <div className="p-3.5 rounded-lg bg-[#11261b] border border-[#1e4431]">
            <h3 className="font-serif text-sm md:text-base font-semibold text-amber-200 mb-1 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              La Curiara y los Dos Remeros
            </h3>
            <p className="text-slate-300 leading-relaxed">
              La curiara es una embarcación milenaria tallada en una sola pieza de tronco de madera dura (cedro o guayacán) por los pueblos <strong>Curripaco, Puinave y Piapoco</strong>. La tripulación se compone de dos navegantes en perfecta sintonía: el remero de proa (Wami) analiza y esquiva obstáculos sumergidos, mientras el timonel de popa (Karu) gobierna el rumbo y propulsa contra la corriente.
            </p>
          </div>

          {/* Section 2: Whirlpools & Rapids */}
          <div className="p-3.5 rounded-lg bg-[#11261b] border border-[#1e4431]">
            <h3 className="font-serif text-sm md:text-base font-semibold text-amber-200 mb-1 flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              Remolinos y Raudales Fluviales
            </h3>
            <p className="text-slate-300 leading-relaxed mb-2">
              Donde las corrientes chocan con formaciones rocosas precámbricas se generan <strong>remolinos (vórtices giratorios)</strong>. Si la curiara entra en el vórtice, será arrastrada hacia el ojo central, sufriendo averías continuas por la torsión del agua.
            </p>
            <div className="p-2.5 rounded bg-black/40 border border-amber-500/30 text-amber-300 font-mono text-xs">
              <strong>Consejo de supervivencia:</strong> No intentes remar contra el centro del remolino. Rema en diagonal hacia el borde exterior aprovechando la fuerza centrífuga para romper el giro.
            </div>
          </div>

          {/* Section 3: Amazonian Fauna Hazards */}
          <div className="p-3.5 rounded-lg bg-[#11261b] border border-[#1e4431]">
            <h3 className="font-serif text-sm md:text-base font-semibold text-amber-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Fauna Salvaje del Río
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-2 rounded bg-black/30 border border-white/5">
                <span className="font-bold text-rose-300 block mb-0.5">Caimán Negro</span>
                <p className="text-slate-400 text-[11px]">
                  Depredador de hasta 4 metros. Si te acercas, saltará hacia la curiara.
                </p>
              </div>

              <div className="p-2 rounded bg-black/30 border border-white/5">
                <span className="font-bold text-rose-300 block mb-0.5">Cardumen de Pirañas</span>
                <p className="text-slate-400 text-[11px]">
                  Bancos de peces carnívoros que se mueven en olas rápidas entre orillas.
                </p>
              </div>

              <div className="p-2 rounded bg-black/30 border border-white/5">
                <span className="font-bold text-rose-300 block mb-0.5">Gran Anaconda</span>
                <p className="text-slate-400 text-[11px]">
                  La serpiente sagrada del Yuruparí; cruza el canal en curvas ondulatorias continuas.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Sacred Elements */}
          <div className="p-3.5 rounded-lg bg-[#11261b] border border-[#1e4431]">
            <h3 className="font-serif text-sm md:text-base font-semibold text-amber-200 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              Poderes y Botánica Sagrada
            </h3>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li>
                <strong className="text-rose-400">Flor de Inírida:</strong> Planta endémica de Guainía (Guacamaya superba); otorga puntos y bendición chamánica.
              </li>
              <li>
                <strong className="text-amber-400">Chontaduro:</strong> Fruta nutritiva amazónica; repara el 25% de la integridad del casco de madera.
              </li>
              <li>
                <strong className="text-sky-400">Amuleto Chamánico:</strong> Invoca un escudo de espíritus protectores que repele rocas y fieras por 7 segundos.
              </li>
              <li>
                <strong className="text-yellow-400">Remos de Guayacán:</strong> Acelera el ritmo de paleo e inmuniza contra la succión de los remolinos.
              </li>
            </ul>
          </div>

          {/* Section 5: The Destination */}
          <div className="p-3.5 rounded-lg bg-[#11261b] border border-[#1e4431]">
            <h3 className="font-serif text-sm md:text-base font-semibold text-amber-200 mb-1">
              Cerros de Mavecure (El Destino Sagrado)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              En el Nivel 10 se llega al corazón del Guainía: los tres colosos de piedra granítica que emergen verticalmente sobre la selva virgen — <strong>Mavicure, Cerro Mono y Cerro Pajarito</strong>. Coronar esta ruta es el mayor honor de la navegación amazónica.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c3b2d] bg-[#0a1611] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors cursor-pointer"
          >
            Entendido, volver al río
          </button>
        </div>
      </div>
    </div>
  );
};
