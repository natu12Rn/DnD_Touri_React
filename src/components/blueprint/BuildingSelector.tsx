import React, { useState, useRef, useEffect } from 'react';
import { BuildingDefinition, SpaceType } from '../../types/blueprint';
import { BUILDINGS_CATALOG, formatEO } from '../../utils/geometry';
import { Building2, Search, X, ChevronDown, Filter, Info } from 'lucide-react';
import { SpecialFacilityInfoModal } from './SpecialFacilityInfoModal';

interface BuildingSelectorProps {
  onAddBuilding: (building: BuildingDefinition) => void;
}

type SpaceFilter = 'ALL' | SpaceType;

export const BuildingSelector: React.FC<BuildingSelectorProps> = ({ onAddBuilding }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState<SpaceFilter>('ALL');
  const [infoModalFacilityId, setInfoModalFacilityId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBuildings = BUILDINGS_CATALOG.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.space.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpace =
      selectedSpaceFilter === 'ALL' || b.space === selectedSpaceFilter;

    return matchesSearch && matchesSpace;
  });

  return (
    <div className="relative" ref={containerRef}>
      {/* Botón selector desplegable con texto claro e icono */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Incorporar edificación especial del catálogo"
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-serif font-bold tracking-wide transition-all shadow-sm active:scale-95"
      >
        <Building2 size={16} />
        <span>+ Incorporar Edificación</span>
        <ChevronDown size={14} className="text-amber-400" />
      </button>

      {/* Desplegable con Buscador y Filtro por Espacio */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-84 bg-[#161922] border border-amber-500/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 1. Buscador interno */}
          <div className="p-2.5 border-b border-white/10 flex items-center gap-2 bg-slate-950/70">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar edificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full font-sans"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* 2. Filtros Rápidos por Espacio */}
          <div className="flex items-center gap-1 p-2 bg-slate-950/90 border-b border-white/5 overflow-x-auto">
            <span className="text-[9px] font-mono uppercase text-slate-400 px-1 font-semibold flex items-center gap-1">
              <Filter size={10} /> Espacio:
            </span>

            <button
              onClick={() => setSelectedSpaceFilter('ALL')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                selectedSpaceFilter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos (38)
            </button>

            <button
              onClick={() => setSelectedSpaceFilter('APRETADO')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                selectedSpaceFilter === 'APRETADO'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-sky-400 hover:bg-slate-800'
              }`}
            >
              Apretado (4c)
            </button>

            <button
              onClick={() => setSelectedSpaceFilter('ESPACIOSO')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                selectedSpaceFilter === 'ESPACIOSO'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
              }`}
            >
              Espaciado (16c)
            </button>

            <button
              onClick={() => setSelectedSpaceFilter('VASTO')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                selectedSpaceFilter === 'VASTO'
                  ? 'bg-purple-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-purple-400 hover:bg-slate-800'
              }`}
            >
              Vasto (36c)
            </button>
          </div>

          {/* 3. Listado con altura fija y scroll vertical */}
          <div className="h-72 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredBuildings.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-serif">
                No se encontraron edificaciones con este filtro
              </div>
            ) : (
              filteredBuildings.map((building) => (
                <div
                  key={building.id}
                  onClick={() => {
                    onAddBuilding(building);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-all border border-transparent hover:border-amber-500/20 group gap-2"
                >
                  <div className="flex flex-col flex-1 min-w-0 pr-1">
                    <span className="font-serif text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                      {building.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate">
                      {building.space} • {building.maxCells} cuadros ({building.dimFt})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInfoModalFacilityId(building.id);
                      }}
                      title="Ver detalles técnicos y reglas oficiales D&D"
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all shrink-0"
                    >
                      <Info size={14} />
                    </button>

                    <span className="w-[84px] text-right text-[11px] font-mono font-bold text-amber-400/90 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-white/5 shrink-0">
                      {formatEO(building.costEO)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal de Información Técnica Detallada de Bastiones.md */}
      <SpecialFacilityInfoModal
        facilityId={infoModalFacilityId}
        onClose={() => setInfoModalFacilityId(null)}
        onAddBuilding={onAddBuilding}
      />
    </div>
  );
};
