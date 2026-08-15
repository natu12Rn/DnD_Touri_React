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
  Building,
  Sparkles,
  Layers,
} from 'lucide-react';

interface BastionMetricsModalProps {
  mainBlock: MainConstructionBlock;
  independentBuildings: SpecialBuildingBlock[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onDeleteBuilding: (id: string, isIntegrated: boolean) => void;
  onRemoveExpansion: (id: string) => void;
}

export const BastionMetricsModal: React.FC<BastionMetricsModalProps> = ({
  mainBlock,
  independentBuildings,
  selectedId,
  onSelectElement,
  onDeleteBuilding,
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
              Espacio Total Disponible
            </span>
            <span className="font-mono text-base font-bold text-amber-400">
              {totalAvailableCells} Cuadros
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-slate-300">
            <div className="flex items-center justify-between">
              <span>• Espacio Base ({mainBlock.baseSpaceType}):</span>
              <span className="text-slate-100 font-bold">{baseCells} cuadros</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Aportado por Edificios Hijos:</span>
              <span className="text-emerald-400 font-bold">+{childCells} cuadros</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Aportado por Expansiones:</span>
              <span className="text-sky-400 font-bold">+{expansionCells} cuadros</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Ocupados por Bloque Principal:</span>
            <span className="text-amber-300 font-bold">{currentMainCells} / {totalAvailableCells}</span>
          </div>
        </div>

        {/* 3. Sección: Coste de Construcción en EO */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 uppercase font-mono text-[10px] tracking-wider font-semibold">
              <Coins size={14} className="text-amber-400" />
              <span>Coste Total Acumulado</span>
            </div>
            <span className="font-mono text-sm font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
              {formatEO(totalAccumulatedCostEO)}
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-slate-300">
            <div className="flex items-center justify-between">
              <span>• Coste Inicial Núcleo ({mainBlock.baseSpaceType}):</span>
              <span className="text-amber-300 font-bold">{formatEO(baseCoreCostEO)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Coste de Edificaciones ({allBuildings.length}):</span>
              <span className="text-amber-300 font-bold">{formatEO(totalBuildingsCostEO)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Coste de Expansiones ({mainBlock.expansions.length}):</span>
              <span className="text-sky-300 font-bold">{formatEO(totalExpansionsCostEO)}</span>
            </div>
          </div>
        </div>

        {/* 4. Expansiones Adquiridas */}
        {mainBlock.expansions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider font-semibold">
                Expansiones Adquiridas ({mainBlock.expansions.length})
              </span>
              <span className="text-[10px] font-mono text-sky-300">
                +{expansionCells} cuadros • {formatEO(totalExpansionsCostEO)}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {mainBlock.expansions.map((exp) => (
                <span
                  key={exp.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-300 font-mono text-[11px]"
                >
                  <span>{exp.name} (+{exp.cells} c. • {formatEO(exp.costEO)})</span>
                  <button
                    onClick={() => onRemoveExpansion(exp.id)}
                    title="Remover Expansión"
                    className="hover:text-rose-400 transition-colors ml-0.5"
                  >
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 5. Estructura Jerárquica: Bloque Principal e Hijos */}
        <div
          onClick={() => onSelectElement(mainBlock.id)}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            selectedId === mainBlock.id
              ? 'border-amber-400 bg-slate-800/80 shadow-md'
              : 'border-white/5 bg-slate-950/40 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building size={15} className="text-amber-400" />
              <span className="font-serif font-bold text-slate-200 text-xs">
                {mainBlock.name} ({mainBlock.baseSpaceType})
              </span>
            </div>
            <span className="font-mono text-[11px] text-amber-300 font-bold">
              {currentMainCells} cuadros
            </span>
          </div>

          {/* Sub-edificaciones Hijas Integradas */}
          {mainBlock.integratedBuildings.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-emerald-400 font-semibold block">
                Edificios Hijos Anidados ({mainBlock.integratedBuildings.length}):
              </span>
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
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBuilding(child.id, true);
                        }}
                        title="Eliminar Edificio Hijo"
                        className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
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
