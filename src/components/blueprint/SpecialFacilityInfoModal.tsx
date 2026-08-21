import React from 'react';
import { createPortal } from 'react-dom';
import { getSpecialFacilityDetail } from '../../data/specialFacilitiesCatalog';
import { BUILDINGS_CATALOG, formatEO } from '../../utils/geometry';
import { BuildingDefinition } from '../../types/blueprint';
import {
  X,
  Building2,
  Coins,
  Clock,
  UserCheck,
  ShieldAlert,
  Scroll,
  Plus,
  Table as TableIcon,
} from 'lucide-react';

interface SpecialFacilityInfoModalProps {
  facilityId: string | null;
  onClose: () => void;
  onAddBuilding?: (building: BuildingDefinition) => void;
}

export const SpecialFacilityInfoModal: React.FC<SpecialFacilityInfoModalProps> = ({
  facilityId,
  onClose,
  onAddBuilding,
}) => {
  if (!facilityId) return null;

  const detail = getSpecialFacilityDetail(facilityId);
  const catalogItem = BUILDINGS_CATALOG.find((b) => b.id === facilityId);

  if (!detail && !catalogItem) return null;

  const name = detail?.name || catalogItem?.name || 'Edificación Especial';
  const space = detail?.space || catalogItem?.space || 'ESPACIOSO';
  const costEO = detail?.costEO || catalogItem?.costEO || 5000;
  const buildDays = detail?.buildDays || 20;

  const spaceColorClass =
    space === 'APRETADO'
      ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
      : space === 'ESPACIOSO'
      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
      : 'bg-purple-500/10 text-purple-300 border-purple-500/30';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#141722] border border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
        {/* 1. Cabecera */}
        <div className="flex items-start justify-between p-5 border-b border-white/10 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Building2 size={24} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-amber-300 tracking-wide">
                  {name}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${spaceColorClass}`}
                >
                  {space}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Edificación Especial del Bastión
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Tarjetas Rápidas de Métricas */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/40 border-b border-white/5 shrink-0 text-xs font-mono">
          <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-2">
            <Coins size={16} className="text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Coste en EO</span>
              <span className="font-bold text-amber-300">{formatEO(costEO)}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-2">
            <Clock size={16} className="text-sky-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Tiempo de Obra</span>
              <span className="font-bold text-sky-300">{buildDays} días</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Empleados (PNJ)</span>
              <span className="font-bold text-emerald-300">
                {detail?.employees !== undefined ? `${detail.employees} PNJ` : '1 PNJ'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Cuerpo Detallado con Scroll */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-slate-700 text-xs text-slate-300 font-sans">
          {/* Prerrequisitos y Orden */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1">
                <ShieldAlert size={12} /> Prerrequisito
              </span>
              <p className="text-slate-200 text-[11px] font-sans">
                {detail?.prerequisite || 'Ninguno'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                <Scroll size={12} /> Orden de Bastión
              </span>
              <p className="text-amber-200 text-[11px] font-sans font-semibold">
                {detail?.orderType ? `${detail.orderType}: ${detail.orderName}` : 'Especial'}
              </p>
            </div>
          </div>

          {/* Descripción Temática */}
          {detail?.description && (
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950/40 border border-white/5">
              <h4 className="font-serif font-bold text-amber-400 text-xs uppercase tracking-wider">
                Descripción
              </h4>
              <p className="leading-relaxed text-slate-300">{detail.description}</p>
            </div>
          )}

          {/* Mecánica de la Orden */}
          {detail?.orderDescription && (
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950/40 border border-sky-500/20">
              <h4 className="font-serif font-bold text-sky-300 text-xs uppercase tracking-wider">
                Mecánica de la Orden de Bastión
              </h4>
              <p className="leading-relaxed text-slate-300">{detail.orderDescription}</p>
            </div>
          )}

          {/* Reglas Adicionales */}
          {detail?.additionalRules && detail.additionalRules.length > 0 && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/40 border border-white/5">
              <h4 className="font-serif font-bold text-amber-400 text-xs uppercase tracking-wider">
                Reglas y Funciones Especiales
              </h4>
              <ul className="space-y-1 list-disc list-inside text-slate-300">
                {detail.additionalRules.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tablas Oficiales de Bastiones.md */}
          {detail?.tables &&
            detail.tables.map((table, idx) => (
              <div
                key={idx}
                className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-white/10"
              >
                <h4 className="font-serif font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <TableIcon size={14} /> {table.title}
                </h4>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-900 text-amber-400 uppercase text-[10px]">
                      <tr>
                        {table.headers.map((h, i) => (
                          <th key={i} className="p-2 border-b border-white/10">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>

        {/* 4. Pie de Modal */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all"
          >
            Cerrar
          </button>

          {onAddBuilding && catalogItem && (
            <button
              onClick={() => {
                onAddBuilding(catalogItem);
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-serif font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-95"
            >
              <Plus size={14} />
              <span>+ Incorporar al Plano</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
