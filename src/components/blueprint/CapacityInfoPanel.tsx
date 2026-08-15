import React, { useState } from 'react';
import { BuildingBlockInstance } from '../../types/blueprint';
import {
  Layers,
  ChevronRight,
  ChevronLeft,
  Link2,
  Unlink2,
  Trash2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

interface CapacityInfoPanelProps {
  baseKEO: number;
  blocks: BuildingBlockInstance[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
}

export const CapacityInfoPanel: React.FC<CapacityInfoPanelProps> = ({
  baseKEO,
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calcular métricas de EO
  const connectedBlocks = blocks.filter((b) => b.isConnected && !b.isPrimary);
  const disconnectedBlocks = blocks.filter((b) => !b.isConnected && !b.isPrimary);

  const connectedEO = connectedBlocks.reduce((acc, b) => acc + b.capacityKEO, 0);
  const totalAvailableEO = baseKEO + connectedEO;

  // EO utilizados: cada bloque consume su capacidad nominal de EO al estar construido
  const usedEO = blocks.reduce((acc, b) => acc + (b.isPrimary ? baseKEO : b.capacityKEO), 0);
  const remainingEO = Math.max(0, totalAvailableEO - usedEO);
  const percentUsed = Math.min(100, Math.round((usedEO / totalAvailableEO) * 100));

  if (isCollapsed) {
    return (
      <div className="absolute top-4 right-4 z-20 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#161922]/90 backdrop-blur-xl border border-amber-500/40 text-amber-300 shadow-xl hover:bg-slate-800/90 transition-all font-mono text-xs font-bold"
        >
          <ChevronLeft size={16} />
          <Layers size={15} />
          <span>{totalAvailableEO} k EO</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-20 w-84 bg-[#161922]/95 backdrop-blur-xl border border-amber-500/40 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] select-none animate-in fade-in slide-in-from-right-4 duration-200">
      {/* 1. Cabecera */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Layers className="text-amber-400" size={18} />
          <h3 className="font-serif text-sm font-bold text-amber-400 tracking-wide">
            Capacidad & Espacio (EO)
          </h3>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          title="Colapsar Panel"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-slate-700 text-xs">
        {/* 2. Resumen General de EO */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider font-semibold">
              Espacio Total Disponible
            </span>
            <span className="font-mono text-base font-bold text-amber-400">
              {totalAvailableEO} k EO
            </span>
          </div>

          {/* Barra de Progreso de Capacidad */}
          <div className="space-y-1.5">
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  percentUsed > 90 ? 'bg-rose-500' : percentUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Utilizados: <b className="text-slate-200">{usedEO} k EO</b></span>
              <span>Restante: <b className="text-emerald-400">{remainingEO} k EO</b></span>
            </div>
          </div>

          {/* Estado de Capacidad */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-[11px]">
            {percentUsed <= 100 ? (
              <>
                <ShieldCheck className="text-emerald-400" size={14} />
                <span className="text-emerald-300 font-medium">Capacidad de construcción óptima</span>
              </>
            ) : (
              <>
                <ShieldAlert className="text-rose-400" size={14} />
                <span className="text-rose-300 font-medium">Límite de EO excedido</span>
              </>
            )}
          </div>
        </div>

        {/* 3. Desglose del Bloque Principal */}
        <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-serif font-bold text-slate-200 text-xs">
              Bloque Principal (Núcleo)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Capacidad Base del Bastión
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
            {baseKEO} k EO
          </span>
        </div>

        {/* 4. Lista de Edificaciones Incorporadas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
              Edificaciones ({blocks.length - 1})
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              +{connectedEO} k EO integrados
            </span>
          </div>

          {blocks.filter((b) => !b.isPrimary).length === 0 ? (
            <div className="text-center py-5 text-slate-500 font-serif text-xs border border-dashed border-white/10 rounded-2xl">
              No hay edificaciones adicionales.<br />
              <span className="text-[10px] text-amber-400 font-sans mt-1 inline-block">
                Selecciona una en el menú superior para incorporarla.
              </span>
            </div>
          ) : (
            blocks
              .filter((b) => !b.isPrimary)
              .map((block) => {
                const isSelected = block.id === selectedBlockId;
                return (
                  <div
                    key={block.id}
                    onClick={() => onSelectBlock(block.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-slate-800/80 shadow-md'
                        : 'border-white/5 bg-slate-950/50 hover:border-amber-500/30 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {block.isConnected ? (
                        <div
                          className="p-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                          title="Integrada al Bloque Principal (Suma EO)"
                        >
                          <Link2 size={13} />
                        </div>
                      ) : (
                        <div
                          className="p-1 rounded-lg bg-slate-900 text-slate-500 border border-white/10"
                          title="Independiente (Acércala al bloque principal para integrarla)"
                        >
                          <Unlink2 size={13} />
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-xs text-slate-200 group-hover:text-amber-300">
                          {block.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {block.space} • {block.isConnected ? 'Integrada' : 'Flotante'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                          block.isConnected
                            ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
                            : 'text-slate-400 bg-slate-900 border-white/10'
                        }`}
                      >
                        +{block.capacityKEO} k EO
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBlock(block.id);
                        }}
                        title="Eliminar Edificación"
                        className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* 5. Pie con Instrucciones Rápidas */}
      <div className="p-3 border-t border-white/10 bg-slate-950/60 text-[10px] text-slate-400 font-sans flex items-center gap-2">
        <Sparkles className="text-amber-400 shrink-0" size={13} />
        <span>Arrastra una edificación junto al bloque principal para integrarla.</span>
      </div>
    </div>
  );
};
