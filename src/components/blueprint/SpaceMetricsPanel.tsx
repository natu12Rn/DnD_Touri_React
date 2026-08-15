import React, { useState } from 'react';
import {
  MainConstructionBlock,
  SpecialBuildingBlock,
} from '../../types/blueprint';
import { math } from '../../utils/geometry';
import {
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Link2,
  Unlink2,
  Trash2,
  Coins,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface SpaceMetricsPanelProps {
  mainBlock: MainConstructionBlock;
  independentBuildings: SpecialBuildingBlock[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onDeleteBuilding: (id: string, isIntegrated: boolean) => void;
}

export const SpaceMetricsPanel: React.FC<SpaceMetricsPanelProps> = ({
  mainBlock,
  independentBuildings,
  selectedId,
  onSelectElement,
  onDeleteBuilding,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Cálculo de Espacio Físico en CUADROS
  const mainBlockCells = math.calculateCellCount(mainBlock.points);
  const integratedBuildingsCells = mainBlock.integratedBuildings.reduce(
    (acc, b) => acc + math.calculateCellCount(b.points),
    0
  );
  const totalConstructionCells = mainBlockCells; // El bloque principal engloba la superficie física total

  // 2. Cálculo del Coste Total de Construcción en EO (Sumatoria de todas las edificaciones seleccionadas)
  const allBuildings = [...mainBlock.integratedBuildings, ...independentBuildings];
  const totalCostKEO = allBuildings.reduce((acc, b) => acc + b.costKEO, 0);

  if (isCollapsed) {
    return (
      <div className="absolute top-4 left-4 z-20 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#161922]/90 backdrop-blur-xl border border-amber-500/40 text-amber-300 shadow-xl hover:bg-slate-800/90 transition-all font-mono text-xs font-bold"
        >
          <LayoutGrid size={15} />
          <span>{totalConstructionCells} Cuadros</span>
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-20 w-80 bg-[#161922]/95 backdrop-blur-xl border border-amber-500/40 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] select-none animate-in fade-in slide-in-from-left-4 duration-200">
      {/* 1. Cabecera */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <LayoutGrid className="text-amber-400" size={18} />
          <h3 className="font-serif text-sm font-bold text-amber-400 tracking-wide">
            Espacio & Capacidad
          </h3>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          title="Colapsar Panel"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-slate-700 text-xs">
        {/* 2. Tarjeta de Espacio Físico (CUADROS) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider font-semibold">
              Espacio Físico
            </span>
            <span className="font-mono text-base font-bold text-amber-400">
              {totalConstructionCells} Cuadros
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-slate-300">
            <div className="flex items-center justify-between">
              <span>• Núcleo Principal:</span>
              <span className="text-slate-100 font-bold">{mainBlockCells} cuadros</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Edificaciones Anidadas:</span>
              <span className="text-emerald-400 font-bold">
                {mainBlock.integratedBuildings.length} ({integratedBuildingsCells} cuadros)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Tarjeta de Coste Total de Construcción (EO) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 uppercase font-mono text-[10px] tracking-wider font-semibold">
              <Coins size={14} className="text-amber-400" />
              <span>Coste Total (EO)</span>
            </div>
            <span className="font-mono text-sm font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
              {totalCostKEO} k EO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans leading-tight">
            Sumatoria del coste de las {allBuildings.length} edificaciones incorporadas.
          </p>
        </div>

        {/* 4. Bloque Principal (Padre) */}
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
                {mainBlock.name}
              </span>
            </div>
            <span className="font-mono text-[11px] text-amber-300 font-bold">
              {mainBlockCells} cuadros
            </span>
          </div>

          {/* Sub-edificaciones Hijas Integradas */}
          {mainBlock.integratedBuildings.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-emerald-400 font-semibold block">
                Subdivisiones Anidadas ({mainBlock.integratedBuildings.length}):
              </span>
              {mainBlock.integratedBuildings.map((child) => {
                const isSelected = child.id === selectedId;
                const childCells = math.calculateCellCount(child.points);
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
                        {childCells}/{child.maxCells} c.
                      </span>
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        {child.costKEO}k EO
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBuilding(child.id, true);
                        }}
                        title="Eliminar Subdivisión"
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

        {/* 5. Edificaciones Independientes (Flotantes) */}
        {independentBuildings.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold block">
              Edificaciones Independientes ({independentBuildings.length})
            </span>

            {independentBuildings.map((building) => {
              const isSelected = building.id === selectedId;
              const cells = math.calculateCellCount(building.points);
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
                        {cells}/{building.maxCells} cuadros (Flotante)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-white/10">
                      {building.costKEO} k EO
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

      {/* 6. Pie */}
      <div className="p-3 border-t border-white/10 bg-slate-950/70 text-[10px] text-slate-400 font-sans flex items-center gap-1.5">
        <ShieldCheck className="text-emerald-400 shrink-0" size={13} />
        <span>Acerca un bloque al núcleo para anidarlo como hijo interno.</span>
      </div>
    </div>
  );
};
