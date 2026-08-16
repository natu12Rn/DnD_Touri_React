import React, { useState } from 'react';
import {
  MainConstructionBlock,
  SpecialBuildingBlock,
} from '../../types/blueprint';
import { math, formatEO } from '../../utils/geometry';
import {
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Link2,
  Unlink2,
  Trash2,
  Coins,
  Sparkles,
  Layers,
} from 'lucide-react';

interface BastionMetricsModalProps {
  mainBlock: MainConstructionBlock;
  independentBuildings: SpecialBuildingBlock[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onDeleteBuilding: (id: string, isIntegrated: boolean) => void;
  onDeintegrateBuilding?: (id: string) => void;
  onRemoveExpansion: (id: string) => void;
}

export const BastionMetricsModal: React.FC<BastionMetricsModalProps> = ({
  mainBlock,
  independentBuildings,
  selectedId,
  onSelectElement,
  onDeleteBuilding,
  onDeintegrateBuilding,
  onRemoveExpansion,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Desglose de Espacio Físico en CUADROS
  const baseCells = mainBlock.baseCells; // Espacio base del núcleo elegido por el usuario
  const childCells = mainBlock.integratedBuildings.reduce(
    (acc, b) => acc + math.calculateCellCount(b.points),
    0
  ); // Espacio aportado por edificios hijos
  const expansionCells = mainBlock.expansions.reduce((acc, exp) => acc + exp.cells, 0); // Espacio aportado por expansiones
  const totalAvailableCells = baseCells + childCells + expansionCells; // Espacio total disponible

  const currentMainCells = math.calculateCellCount(mainBlock.points); // Cuadros utilizados por el bloque principal

  // 2. Desglose de Costes en EO (Incluyendo el coste inicial del núcleo)
  const baseCoreCostEO = mainBlock.baseCostEO || 1000;
  const allBuildings = [...mainBlock.integratedBuildings, ...independentBuildings];
  const totalBuildingsCostEO = allBuildings.reduce((acc, b) => acc + b.costEO, 0);
  const totalExpansionsCostEO = mainBlock.expansions.reduce((acc, exp) => acc + exp.costEO, 0);
  
  // Coste Total = Coste Inicial del Núcleo + Coste Edificaciones + Coste Expansiones
  const totalAccumulatedCostEO = baseCoreCostEO + totalBuildingsCostEO + totalExpansionsCostEO;

  if (isCollapsed) {
    return (
      <div className="absolute top-4 right-4 z-20 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#161922]/90 backdrop-blur-xl border border-amber-500/40 text-amber-300 shadow-2xl hover:bg-slate-800/90 transition-all font-mono text-xs font-bold"
        >
          <ChevronLeft size={16} />
          <LayoutGrid size={15} />
          <span>{totalAvailableCells} Cuadros</span>
          <span className="text-slate-500">|</span>
          <Coins size={14} className="text-amber-400" />
          <span>{formatEO(totalAccumulatedCostEO)}</span>
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
        {/* 2. Sección: Espacio Físico (Cuadros de 5x5 ft) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider font-semibold">
              Espacio Físico Total
            </span>
            <span className="font-mono text-sm font-bold text-amber-300">
              {currentMainCells} / {totalAvailableCells} cuadros
            </span>
          </div>

          {/* Barra de progreso de ocupación del espacio */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-300 ${
                currentMainCells > totalAvailableCells
                  ? 'bg-rose-500'
                  : currentMainCells === totalAvailableCells
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (currentMainCells / Math.max(1, totalAvailableCells)) * 100)}%`,
              }}
            />
          </div>

          {/* Desglose detallado del origen de los cuadros */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono text-slate-400">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
              <span className="text-slate-500">Base Núcleo</span>
              <span className="text-slate-200 font-bold">{baseCells} c.</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
              <span className="text-emerald-400/80">Hijos (+{childCells} c.)</span>
              <span className="text-emerald-300 font-bold">{childCells} c.</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col">
              <span className="text-amber-400/80">Expansiones</span>
              <span className="text-amber-300 font-bold">+{expansionCells} c.</span>
            </div>
          </div>
        </div>

        {/* 3. Sección: Presupuesto & Costes Totales en EO */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider font-semibold">
              Coste Total de la Obra
            </span>
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-sm">
              <Coins size={14} />
              <span>{formatEO(totalAccumulatedCostEO)}</span>
            </div>
          </div>

          {/* Desglose detallado de costes en EO */}
          <div className="space-y-1 pt-1 text-[11px] text-slate-300 font-mono">
            <div className="flex justify-between py-0.5 border-b border-white/5">
              <span className="text-slate-400">Coste Base Núcleo:</span>
              <span className="text-amber-300 font-semibold">{formatEO(baseCoreCostEO)}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-white/5">
              <span className="text-slate-400">Edificaciones ({allBuildings.length}):</span>
              <span className="text-slate-200 font-semibold">{formatEO(totalBuildingsCostEO)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Expansiones ({mainBlock.expansions.length}):</span>
              <span className="text-slate-200 font-semibold">{formatEO(totalExpansionsCostEO)}</span>
            </div>
          </div>
        </div>

        {/* 4. Expansiones Activas */}
        {mainBlock.expansions.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold block">
              Expansiones Adquiridas ({mainBlock.expansions.length})
            </span>
            <div className="space-y-1.5">
              {mainBlock.expansions.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5 font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="font-sans font-bold text-slate-200">{exp.name}</span>
                    <span className="text-[10px] text-amber-400/90 font-bold">+{exp.cells} c.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{formatEO(exp.costEO)}</span>
                    <button
                      onClick={() => onRemoveExpansion(exp.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Eliminar Expansión"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Edificaciones Especiales Integradas (Hijos del Núcleo) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
              Edificios Hijos Integrados ({mainBlock.integratedBuildings.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              +{childCells} cuadros aportados
            </span>
          </div>

          {mainBlock.integratedBuildings.length === 0 ? (
            <div className="p-3 rounded-2xl border border-dashed border-white/10 text-center text-slate-500 text-xs">
              Sin edificios hijos integrados. Arrastra una edificación cerca del bastión para anidarla.
            </div>
          ) : (
            <div className="space-y-1.5">
              {mainBlock.integratedBuildings.map((child) => {
                const isSelected = child.id === selectedId;
                const childCellCount = math.calculateCellCount(child.points);
                return (
                  <div
                    key={child.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectElement(child.id);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/40'
                        : 'border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Link2 size={12} className="text-emerald-400" />
                      <span className="font-serif font-bold text-[11px] text-slate-200">
                        {child.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-300">
                        {childCellCount}/{child.maxCells} c.
                      </span>
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        {formatEO(child.costEO)}
                      </span>
                      {onDeintegrateBuilding && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeintegrateBuilding(child.id);
                          }}
                          title="Desacoplar edificio como bloque independiente"
                          className="text-slate-400 hover:text-amber-400 transition-colors ml-1 p-0.5 rounded"
                        >
                          <Unlink2 size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBuilding(child.id, true);
                        }}
                        title="Eliminar Edificio Hijo"
                        className="text-slate-400 hover:text-rose-400 transition-colors ml-1 p-0.5 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Edificaciones Independientes (Flotantes) */}
        {independentBuildings.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold block">
              Edificaciones Independientes ({independentBuildings.length})
            </span>

            {independentBuildings.map((building) => {
              const isSelected = building.id === selectedId;
              const cellCount = math.calculateCellCount(building.points);
              return (
                <div
                  key={building.id}
                  onClick={() => onSelectElement(building.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-slate-800/80 shadow-md'
                      : 'border-white/5 bg-slate-950/40 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-slate-900 text-slate-500 border border-white/10">
                      <Unlink2 size={12} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif font-bold text-xs text-slate-200">
                        {building.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {cellCount}/{building.maxCells} cuadros (Flotante)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-400/90 bg-slate-900 px-2 py-0.5 rounded-lg border border-white/10">
                      {formatEO(building.costEO)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBuilding(building.id, false);
                      }}
                      title="Eliminar Edificación"
                      className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/40 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Pie Informativo */}
      <div className="p-3 border-t border-white/10 bg-slate-950/70 text-[10px] text-slate-400 font-sans flex items-center gap-1.5 shrink-0">
        <Sparkles className="text-amber-400 shrink-0" size={13} />
        <span>Arrastra el bloque principal para moverlo junto con todos sus hijos.</span>
      </div>
    </div>
  );
};
