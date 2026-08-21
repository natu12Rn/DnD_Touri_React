import React, { useState } from 'react';
import { BastionBlock } from '../../types/blueprint';
import { math, formatEO, calculateBuildDays } from '../../utils/geometry';
import {
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Trash2,
  Coins,
  Clock,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { SpecialFacilityInfoModal } from './SpecialFacilityInfoModal';

interface BastionMetricsModalProps {
  blocks: BastionBlock[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onDeleteBlock: (id: string) => void;
}

export const BastionMetricsModal: React.FC<BastionMetricsModalProps> = ({
  blocks,
  selectedId,
  onSelectElement,
  onDeleteBlock,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [infoModalFacilityId, setInfoModalFacilityId] = useState<string | null>(null);

  // 1. Desglose de Espacio Físico en Celdas (Ignora pasillos con isCostFree = true)
  const usedCells = blocks
    .filter((b) => !b.isCostFree)
    .reduce((acc, b) => acc + math.calculateCellCount(b.points), 0);

  const corridorCells = blocks
    .filter((b) => b.isCostFree)
    .reduce((acc, b) => acc + math.calculateCellCount(b.points), 0);

  // 2. Desglose de Costes en EO y Días de Construcción
  const totalCostEO = blocks.reduce((acc, b) => acc + (b.costEO || 0), 0);
  const totalBuildDays = blocks.reduce((acc, b) => acc + calculateBuildDays(b), 0);

  // 3. Contar bloques en estado de advertencia (Soft Validation)
  const invalidBlocksCount = blocks.filter((b) => {
    const cells = math.calculateCellCount(b.points);
    const isSimple = math.isSimplePolygon(b.points);
    const isOverlapping = math.checkBlockOverlaps(b.id, b.points, blocks);
    const isSizeMismatch = b.requiredCells !== undefined && cells !== b.requiredCells;
    return isSizeMismatch || !isSimple || isOverlapping;
  }).length;

  // Bloques visibles (primeros 4 si está recogido, todos si está desplegado)
  const visibleBlocks = isListExpanded ? blocks : blocks.slice(0, 4);

  if (isCollapsed) {
    return (
      <div className="absolute top-4 right-4 z-20 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#161922]/90 backdrop-blur-xl border border-amber-500/40 text-amber-300 shadow-2xl hover:bg-slate-800/90 transition-all font-mono text-xs font-bold"
        >
          <ChevronLeft size={16} />
          <LayoutGrid size={15} />
          <span>{usedCells} Celdas</span>
          {invalidBlocksCount > 0 && (
            <span className="flex items-center gap-1 text-rose-400 font-sans text-[11px] font-semibold">
              <AlertTriangle size={13} /> {invalidBlocksCount}
            </span>
          )}
          <span className="text-slate-500">|</span>
          <Coins size={14} className="text-amber-400" />
          <span>{formatEO(totalCostEO)}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-20 w-84 bg-[#161922]/95 backdrop-blur-xl border border-amber-500/40 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[88vh] select-none animate-in fade-in slide-in-from-right-4 duration-200">
      {/* 1. Cabecera */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/70 shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="text-amber-400" size={18} />
          <h3 className="font-serif text-sm font-bold text-amber-400 tracking-wide">
            Control de Espacio & Costes
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
        {/* 2. Sección: Espacio Físico */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider font-semibold">
              Espacio Físico Utilizado
            </span>
            <span className="font-mono text-sm font-bold text-amber-300">
              {usedCells} celdas
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
              <span className="text-slate-400">Habitaciones & Obras</span>
              <span className="text-amber-300 font-bold">{usedCells} celdas</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
              <span className="text-slate-400">Pasillos (Costo 0)</span>
              <span className="text-sky-300 font-bold">{corridorCells} celdas</span>
            </div>
          </div>
        </div>

        {/* 3. Sección: Presupuesto, Costes Totales & Tiempo de Obra */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider font-semibold">
              Coste Total en EO
            </span>
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-sm">
              <Coins size={14} />
              <span>{formatEO(totalCostEO)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider font-semibold">
              Tiempo Total de Obra
            </span>
            <div className="flex items-center gap-1.5 text-sky-400 font-mono font-bold text-xs">
              <Clock size={13} />
              <span>
                {totalBuildDays} días{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({Math.round((totalBuildDays / 7) * 10) / 10} sem)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* 4. Lista de Bloques del Bastión */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
              Estructuras del Bastión ({blocks.length})
            </span>
            {invalidBlocksCount > 0 ? (
              <span className="flex items-center gap-1 font-mono text-[10px] text-rose-400 font-bold">
                <AlertTriangle size={12} /> {invalidBlocksCount} por ajustar
              </span>
            ) : (
              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                <CheckCircle2 size={12} /> Todo en regla
              </span>
            )}
          </div>

          {blocks.length === 0 ? (
            <div className="p-3 rounded-2xl border border-dashed border-white/10 text-center text-slate-500 text-xs">
              Sin estructuras agregadas. Usa la barra superior para crear pasillos o habitaciones.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Listado con scrollbar si excede la altura máxima */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50">
                {visibleBlocks.map((block) => {
                  const isSelected = block.id === selectedId;
                  const cellCount = math.calculateCellCount(block.points);
                  const isSimple = math.isSimplePolygon(block.points);
                  const isOverlapping = math.checkBlockOverlaps(block.id, block.points, blocks);
                  const isSizeMismatch =
                    block.requiredCells !== undefined && cellCount !== block.requiredCells;
                  const isInvalid = isSizeMismatch || !isSimple || isOverlapping;
                  const buildDays = calculateBuildDays(block);

                  return (
                    <div
                      key={block.id}
                      onClick={() => onSelectElement(block.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isInvalid
                          ? 'border-rose-500/50 bg-rose-950/20 hover:border-rose-400'
                          : isSelected
                          ? 'border-amber-400 bg-amber-950/30'
                          : 'border-white/5 bg-slate-950/40 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isInvalid ? (
                          <AlertTriangle size={13} className="text-rose-400 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-serif font-bold text-[11px] text-slate-200">
                            {block.name}
                            {isOverlapping && (
                              <span className="text-[10px] text-rose-400 font-sans ml-1 font-semibold">
                                (Superposición)
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {block.isCostFree
                              ? `${cellCount} c. (Pasillo Costo 0)`
                              : block.requiredCells
                              ? `${cellCount} / ${block.requiredCells} celdas`
                              : `${cellCount} celdas`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col items-end font-mono">
                          <span className="text-[10px] text-amber-400 font-bold">
                            {block.isCostFree ? '0 EO' : formatEO(block.costEO || 0)}
                          </span>
                          <span className="text-[9px] text-sky-400/90 font-semibold flex items-center gap-0.5">
                            <Clock size={9} />
                            {block.isCostFree ? '0 d.' : `${buildDays} d.`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {block.buildingId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInfoModalFacilityId(block.buildingId || null);
                              }}
                              title="Ver detalles técnicos y reglas oficiales D&D"
                              className="text-slate-400 hover:text-amber-300 transition-colors p-1 rounded hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30"
                            >
                              <Info size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBlock(block.id);
                            }}
                            title="Eliminar Estructura"
                            className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded hover:bg-rose-950/40"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón Desplegar / Recoger si hay más de 4 estructuras */}
              {blocks.length > 4 && (
                <button
                  onClick={() => setIsListExpanded(!isListExpanded)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-white/5 text-[11px] font-mono font-semibold transition-all active:scale-95 shadow-sm"
                >
                  {isListExpanded ? (
                    <>
                      <span>Mostrar menos (Ver 4)</span>
                      <ChevronUp size={13} />
                    </>
                  ) : (
                    <>
                      <span>Ver todas las estructuras ({blocks.length})</span>
                      <ChevronDown size={13} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Pie Informativo */}
      <div className="p-3 border-t border-white/10 bg-slate-950/70 text-[10px] text-slate-400 font-sans flex items-center gap-1.5 shrink-0">
        <Sparkles className="text-amber-400 shrink-0" size={13} />
        <span>Haz clic en cualquier estructura para modificar sus paredes y esquinas.</span>
      </div>

      {/* Modal de Información Técnica de Bastiones.md */}
      <SpecialFacilityInfoModal
        facilityId={infoModalFacilityId}
        onClose={() => setInfoModalFacilityId(null)}
      />
    </div>
  );
};
