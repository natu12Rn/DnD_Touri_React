import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  HelpCircle,
  X,
  Castle,
  Plus,
  FolderKanban,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { BuildingDefinition, SpaceType } from '../../types/blueprint';
import { BuildingSelector } from './BuildingSelector';

interface BlueprintToolbarProps {
  bastionName: string;
  isEditingSaved: boolean;
  baseSpaceType: SpaceType;
  isBaseSpaceDisabled: boolean;
  onChangeBaseSpaceType: (type: SpaceType) => void;
  onChangeBastionName: (name: string) => void;
  onAddBuilding: (building: BuildingDefinition) => void;
  onAddExpansion: (type: SpaceType) => void;
  onReloadBastion: () => void;
  onSaveBastion: () => Promise<void>;
  onOpenPlansManagement: () => void;
  isSaving: boolean;
}

export const BlueprintToolbar: React.FC<BlueprintToolbarProps> = ({
  bastionName,
  isEditingSaved,
  baseSpaceType,
  isBaseSpaceDisabled,
  onChangeBaseSpaceType,
  onChangeBastionName,
  onAddBuilding,
  onAddExpansion,
  onReloadBastion,
  onSaveBastion,
  onOpenPlansManagement,
  isSaving,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-[#12161f]/95 backdrop-blur-xl border-b border-white/10 select-none z-10">
        {/* 1. Nombre Editable del Plano Actual y Selector de Espacio Inicial */}
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
                className="bg-slate-950/70 border border-white/10 rounded-xl px-3 py-1 text-sm font-serif font-bold text-slate-100 focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none w-48"
              />
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          {/* Selector del Espacio Inicial del Núcleo */}
          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase text-amber-400/90 font-semibold">
              Espacio Núcleo:
            </span>
            <select
              value={baseSpaceType}
              disabled={isBaseSpaceDisabled}
              onChange={(e) => onChangeBaseSpaceType(e.target.value as SpaceType)}
              title={
                isBaseSpaceDisabled
                  ? 'No se puede cambiar el espacio con edificios o expansiones asociadas'
                  : 'Cambiar espacio inicial del bloque principal'
              }
              className={`rounded-xl px-2.5 py-1 font-mono text-xs font-bold outline-none border transition-all ${
                isBaseSpaceDisabled
                  ? 'bg-slate-900/60 border-slate-700/50 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-slate-950/80 border-amber-500/40 text-amber-300 cursor-pointer hover:border-amber-400 focus:ring-1 focus:ring-amber-400'
              }`}
            >
              <option value="APRETADO" className="bg-slate-900 text-sky-300">
                Apretado (4 c. • 500 EO)
              </option>
              <option value="ESPACIOSO" className="bg-slate-900 text-amber-300">
                Espaciado (16 c. • 1.000 EO)
              </option>
              <option value="VASTO" className="bg-slate-900 text-purple-300">
                Vasto (36 c. • 3.000 EO)
              </option>
            </select>
          </div>

          <div className="h-8 w-px bg-white/10" />

          {/* 2. Selector Desplegable de Edificaciones Especiales con Filtro de Espacio */}
          <BuildingSelector onAddBuilding={onAddBuilding} />

          <div className="h-8 w-px bg-white/10" />

          {/* 3. Apartado de Expansiones Completo y Detallado */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-white/10">
            <span className="text-[10px] font-mono uppercase text-sky-400 px-2 font-semibold">
              + Expansión:
            </span>

            <button
              onClick={() => onAddExpansion('APRETADO')}
              title="Añade 4 cuadros adicionales al núcleo (Coste: 500 EO)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              <Plus size={12} />
              <span>Apretado (+4c • 500 EO)</span>
            </button>

            <button
              onClick={() => onAddExpansion('ESPACIOSO')}
              title="Añade 16 cuadros adicionales al núcleo (Coste: 1.000 EO)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              <Plus size={12} />
              <span>Espaciado (+16c • 1.000 EO)</span>
            </button>

            <button
              onClick={() => onAddExpansion('VASTO')}
              title="Añade 36 cuadros adicionales al núcleo (Coste: 3.000 EO)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              <Plus size={12} />
              <span>Vasto (+36c • 3.000 EO)</span>
            </button>
          </div>
        </div>

        {/* 4. Botones de Acciones Principales Convertidos a Iconos con Tooltips */}
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

          {/* Botón Gestión de Planos (Icono con Tooltip) */}
          <button
            onClick={onOpenPlansManagement}
            title="Gestión de Planos: Crear, seleccionar y administrar planos"
            className="p-2.5 rounded-2xl bg-slate-800/80 text-amber-400 hover:text-amber-300 hover:bg-slate-700/80 border border-white/10 transition-all active:scale-95 shadow-sm"
          >
            <FolderKanban size={18} />
          </button>

          {/* Botón Guardar Plano (Icono con Tooltip) */}
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
                  Guía de Planos, Expansiones y Edificaciones
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
                    <h5 className="font-bold text-sky-300 text-xs">1. Expansiones de Espacio</h5>
                    <p className="text-[11px] text-slate-400">
                      • <b>Apretado (+4c)</b>: 500 EO
                      <br />• <b>Espaciado (+16c)</b>: 1.000 EO
                      <br />• <b>Vasto (+36c)</b>: 3.000 EO
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/40 space-y-1">
                    <h5 className="font-bold text-amber-300 text-xs">2. Edificaciones Especiales</h5>
                    <p className="text-[11px] text-slate-400">
                      38 edificaciones clasificadas por espacio (Apretado, Espaciado, Vasto) con sus costes en EO.
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
