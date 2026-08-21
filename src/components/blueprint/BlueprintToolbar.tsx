import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  HelpCircle,
  X,
  Castle,
  Plus,
  FolderKanban,
  Route,
  Square,
  Grid2x2,
  Maximize2,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { BuildingDefinition, SpaceType } from '../../types/blueprint';
import { BuildingSelector } from './BuildingSelector';

interface BlueprintToolbarProps {
  bastionName: string;
  isEditingSaved: boolean;
  onChangeBastionName: (name: string) => void;
  onAddBuilding: (building: BuildingDefinition) => void;
  onAddRoom: (spaceType: SpaceType) => void;
  onAddCorridor: () => void;
  onReloadBastion: () => void;
  onSaveBastion: () => Promise<void>;
  onOpenPlansManagement: () => void;
  isSaving: boolean;
}

export const BlueprintToolbar: React.FC<BlueprintToolbarProps> = ({
  bastionName,
  isEditingSaved,
  onChangeBastionName,
  onAddBuilding,
  onAddRoom,
  onAddCorridor,
  onReloadBastion,
  onSaveBastion,
  onOpenPlansManagement,
  isSaving,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-[#12161f]/95 backdrop-blur-xl border-b border-white/10 select-none z-10">
        {/* 1. Nombre Editable del Plano Actual */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div
              title="Plano de Construcción"
              className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400"
            >
              <Castle size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Plano Actual
              </span>
              <input
                type="text"
                value={bastionName}
                onChange={(e) => onChangeBastionName(e.target.value)}
                placeholder="Nombre del Plano..."
                title="Editar nombre del plano actual"
                className="bg-slate-950/70 border border-white/10 rounded-xl px-3 py-1 text-sm font-serif font-bold text-slate-100 focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none w-44"
              />
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          {/* 2. Selector Desplegable de Edificaciones Especiales del Catálogo */}
          <BuildingSelector onAddBuilding={onAddBuilding} />

          <div className="h-8 w-px bg-white/10" />

          {/* 3. Grupo Unificado de Estructuras Básicas, Pasillos y Habitaciones con Hover Tooltips */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-400 px-2 font-semibold tracking-wider">
              + Estructura:
            </span>

            {/* Pasillo (Tránsito - Costo 0) */}
            <div className="relative group">
              <button
                onClick={onAddCorridor}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
              >
                <Plus size={12} className="text-slate-400" />
                <Route size={14} className="text-slate-400" />
                <span>Pasillo</span>
              </button>

              {/* Tooltip Flotante en Hover */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-in fade-in duration-150">
                <div className="bg-[#181c27] border border-slate-600/60 rounded-xl px-3.5 py-2 shadow-2xl whitespace-nowrap text-center space-y-0.5">
                  <div className="font-serif font-bold text-xs text-slate-200">Pasillo de Tránsito</div>
                  <div className="font-mono text-[10px] text-slate-400">Ancho 5 ft • Conector flexible</div>
                  <div className="font-mono text-[10px] font-bold text-emerald-400">Costo: 0 EO (0 celdas)</div>
                </div>
              </div>
            </div>

            {/* Habitación Apretada (4 celdas • 10x10 ft • 500 EO) */}
            <div className="relative group">
              <button
                onClick={() => onAddRoom('APRETADO')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
              >
                <Plus size={12} />
                <Square size={13} />
                <span>Apretado</span>
              </button>

              {/* Tooltip Flotante en Hover */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-in fade-in duration-150">
                <div className="bg-[#181c27] border border-sky-500/40 rounded-xl px-3.5 py-2 shadow-2xl whitespace-nowrap text-center space-y-0.5">
                  <div className="font-serif font-bold text-xs text-sky-300">Habitación Apretada</div>
                  <div className="font-mono text-[10px] text-slate-300">10x10 ft • 4 celdas</div>
                  <div className="font-mono text-[10px] font-bold text-amber-400">Coste: 500 EO</div>
                </div>
              </div>
            </div>

            {/* Habitación Espaciada (16 celdas • 20x20 ft • 1.000 EO) */}
            <div className="relative group">
              <button
                onClick={() => onAddRoom('ESPACIOSO')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
              >
                <Plus size={12} />
                <Grid2x2 size={13} />
                <span>Espaciado</span>
              </button>

              {/* Tooltip Flotante en Hover */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-in fade-in duration-150">
                <div className="bg-[#181c27] border border-amber-500/40 rounded-xl px-3.5 py-2 shadow-2xl whitespace-nowrap text-center space-y-0.5">
                  <div className="font-serif font-bold text-xs text-amber-300">Habitación Espaciada</div>
                  <div className="font-mono text-[10px] text-slate-300">20x20 ft • 16 celdas</div>
                  <div className="font-mono text-[10px] font-bold text-amber-400">Coste: 1.000 EO</div>
                </div>
              </div>
            </div>

            {/* Habitación Vasta (36 celdas • 30x30 ft • 3.000 EO) */}
            <div className="relative group">
              <button
                onClick={() => onAddRoom('VASTO')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
              >
                <Plus size={12} />
                <Maximize2 size={13} />
                <span>Vasto</span>
              </button>

              {/* Tooltip Flotante en Hover */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-in fade-in duration-150">
                <div className="bg-[#181c27] border border-purple-500/40 rounded-xl px-3.5 py-2 shadow-2xl whitespace-nowrap text-center space-y-0.5">
                  <div className="font-serif font-bold text-xs text-purple-300">Habitación Vasta</div>
                  <div className="font-mono text-[10px] text-slate-300">30x30 ft • 36 celdas</div>
                  <div className="font-mono text-[10px] font-bold text-amber-400">Coste: 3.000 EO</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Botones de Acciones Principales */}
        <div className="flex items-center gap-2">
          {/* Botón Ayuda */}
          <button
            onClick={() => setShowHelpModal(true)}
            title="Guía y ayuda del bastión"
            className="p-2.5 rounded-2xl bg-slate-800/80 text-amber-400 hover:text-amber-300 hover:bg-slate-700/80 border border-white/10 transition-all active:scale-95 shadow-sm"
          >
            <HelpCircle size={18} />
          </button>

          {/* Botón Reload */}
          <button
            onClick={onReloadBastion}
            title={
              isEditingSaved
                ? 'Recargar plano: Restablece al último estado guardado'
                : 'Recargar plano: Restablece al estado principal inicial'
            }
            className="p-2.5 rounded-2xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-white/10 transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw size={18} />
          </button>

          {/* Botón Gestión de Planos */}
          <button
            onClick={onOpenPlansManagement}
            title="Gestión de Planos: Crear, seleccionar y administrar planos"
            className="p-2.5 rounded-2xl bg-slate-800/80 text-amber-400 hover:text-amber-300 hover:bg-slate-700/80 border border-white/10 transition-all active:scale-95 shadow-sm"
          >
            <FolderKanban size={18} />
          </button>

          {/* Botón Guardar Plano */}
          <button
            onClick={onSaveBastion}
            disabled={isSaving}
            title={isSaving ? 'Guardando plano...' : 'Guardar Plano en SQLite'}
            className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            <Save size={18} />
          </button>
        </div>
      </header>

      {/* Modal de Guía de Interacciones (Centralizado con Portal) */}
      {showHelpModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#161922] border border-amber-500/40 rounded-3xl p-6 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif text-base font-bold text-amber-400">
                  Guía de Planos, Estructuras y Pasillos
                </h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                <div className="space-y-2 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-sky-500/40 space-y-1">
                    <h5 className="font-bold text-sky-300 text-xs">1. Estructuras Básicas y Pasillos</h5>
                    <p className="text-[11px] text-slate-400">
                      • <b>Pasillo</b>: Tránsito flexible • 0 celdas (Costo 0)
                      <br />• <b>Apretado (10x10 ft)</b>: 4 celdas • 500 EO
                      <br />• <b>Espaciado (20x20 ft)</b>: 16 celdas • 1.000 EO
                      <br />• <b>Vasto (30x30 ft)</b>: 36 celdas • 3.000 EO
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/40 space-y-1">
                    <h5 className="font-bold text-amber-300 text-xs">2. Edificaciones Especiales</h5>
                    <p className="text-[11px] text-slate-400">
                      38 edificaciones clasificadas por espacio (Apretado, Espaciado, Vasto) con sus costes oficiales en EO.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
