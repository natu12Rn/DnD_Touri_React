import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { invoke } from '@tauri-apps/api/core';
import {
  Vertex,
  UnifiedBastionState,
  SpecialBuildingBlock,
  BuildingDefinition,
  SpaceType,
  AppliedExpansion,
  ToastNotification,
  ToastType,
} from '../../types/blueprint';
import { BlueprintCanvas } from './BlueprintCanvas';
import { BlueprintToolbar } from './BlueprintToolbar';
import { BastionMetricsModal } from './BastionMetricsModal';
import { ToastContainer } from '../ui/ToastContainer';
import {
  CONFIG,
  EXPANSIONS_CATALOG,
  createInitialPointsForSpace,
  math,
} from '../../utils/geometry';
import { X, Trash2, Calendar, FolderOpen, FilePlus, FolderKanban, Check } from 'lucide-react';

interface BlueprintRecordBackend {
  id_blueprint: number;
  name: string;
  grid_size_ft: number;
  geometry_json: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_START_POS = { x: 200, y: 160 };

const INITIAL_BASTION_STATE: UnifiedBastionState = {
  name: 'Base Principal',
  gridSizeFt: CONFIG.feetPerCell,
  mainBlock: {
    id: 'main_core',
    name: 'Núcleo del Bastión',
    baseSpaceType: 'ESPACIOSO',
    baseCells: 16,
    baseCostEO: 1000,
    points: createInitialPointsForSpace('ESPACIOSO', DEFAULT_START_POS.x, DEFAULT_START_POS.y),
    expansions: [],
    integratedBuildings: [],
  },
  independentBuildings: [],
};

export const BlueprintEditor: React.FC = () => {
  const [bastion, setBastion] = useState<UnifiedBastionState>({ ...INITIAL_BASTION_STATE });

  // Snapshot del último estado guardado para recargas contextuales
  const lastSavedSnapshotRef = useRef<UnifiedBastionState | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>('main_core');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Modal centralizada de Gestión de Planos
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [savedBlueprints, setSavedBlueprints] = useState<BlueprintRecordBackend[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  /** Emite una notificación Toast compacta y directa */
  const addToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastNotification = { id, message, type, title };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /** Carga lista de planos desde SQLite */
  const fetchSavedBlueprints = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const records = await invoke<BlueprintRecordBackend[]>('list_all_blueprints');
      setSavedBlueprints(records);
    } catch (err) {
      console.error('Error al listar bastiones:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedBlueprints();
  }, [fetchSavedBlueprints]);

  // Espacio total disponible y cuadros actuales ocupados por el núcleo
  const childCells = bastion.mainBlock.integratedBuildings.reduce(
    (acc, b) => acc + math.calculateCellCount(b.points),
    0
  );
  const expansionCells = bastion.mainBlock.expansions.reduce((acc, exp) => acc + exp.cells, 0);
  const totalAvailableCells = bastion.mainBlock.baseCells + childCells + expansionCells;
  const currentMainCells = math.calculateCellCount(bastion.mainBlock.points);

  // Verificar si existen elementos asociados que impidan modificar el espacio inicial del núcleo
  const hasAssociatedElements =
    bastion.mainBlock.integratedBuildings.length > 0 ||
    bastion.independentBuildings.length > 0 ||
    bastion.mainBlock.expansions.length > 0;

  /** Notificación de exceso de límite de espacio del Núcleo */
  const handleExceedMainLimit = useCallback(() => {
    addToast('El Núcleo supera el espacio disponible.', 'warning');
  }, [addToast]);

  /** Crea un nuevo plano independiente en blanco desde la Gestión de Planos */
  const handleCreateNewBlueprint = (newPlanName?: string) => {
    const name = newPlanName || `Nuevo Plano ${savedBlueprints.length + 1}`;
    setBastion({
      ...INITIAL_BASTION_STATE,
      name,
      idBlueprint: undefined,
    });
    lastSavedSnapshotRef.current = null;
    setSelectedId('main_core');
    setShowPlansModal(false);
    addToast('Nuevo plano creado.', 'info');
  };

  /** Cambia el espacio inicial del núcleo y actualiza la representación visual en el canvas */
  const handleChangeBaseSpaceType = (type: SpaceType) => {
    if (hasAssociatedElements) {
      addToast('No se puede cambiar el espacio con edificios asociados.', 'warning');
      return;
    }

    const preset = EXPANSIONS_CATALOG[type];
    const newPoints = createInitialPointsForSpace(type, DEFAULT_START_POS.x, DEFAULT_START_POS.y);

    setBastion((prev) => ({
      ...prev,
      mainBlock: {
        ...prev.mainBlock,
        baseSpaceType: type,
        baseCells: preset.additionalCells,
        baseCostEO: preset.costEO,
        points: newPoints,
      },
    }));

    addToast(`Espacio del núcleo: ${preset.name}.`, 'info');
  };

  /** Incorpora una nueva edificación especial del catálogo */
  const handleAddBuilding = (building: BuildingDefinition) => {
    const totalCount =
      bastion.mainBlock.integratedBuildings.length + bastion.independentBuildings.length;
    const offset = (totalCount % 4) * 60;
    const initialPoints = createInitialPointsForSpace(
      building.space,
      600 + (offset % 120),
      160 + (offset % 200)
    );

    const newBuilding: SpecialBuildingBlock = {
      id: `special_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      parentId: null,
      buildingId: building.id,
      name: building.name,
      space: building.space,
      maxCells: building.maxCells,
      costEO: building.costEO,
      points: initialPoints,
      isIntegrated: false,
    };

    setBastion((prev) => ({
      ...prev,
      independentBuildings: [...prev.independentBuildings, newBuilding],
    }));

    setSelectedId(newBuilding.id);
    addToast(`${building.name} agregada.`, 'info');
  };

  /** Adquiere y aplica una expansión de espacio adicional */
  const handleAddExpansion = (type: SpaceType) => {
    const preset = EXPANSIONS_CATALOG[type];
    const newExp: AppliedExpansion = {
      id: `exp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      name: preset.name,
      cells: preset.additionalCells,
      costEO: preset.costEO,
    };

    setBastion((prev) => ({
      ...prev,
      mainBlock: {
        ...prev.mainBlock,
        expansions: [...prev.mainBlock.expansions, newExp],
      },
    }));

    addToast('Expansión aplicada.', 'success');
  };

  /** Remueve una expansión de espacio validando el límite del Núcleo */
  const handleRemoveExpansion = (id: string) => {
    const targetExp = bastion.mainBlock.expansions.find((e) => e.id === id);
    if (!targetExp) return;

    // Validación de reducción de espacio
    const newTotalAvailable = totalAvailableCells - targetExp.cells;
    if (currentMainCells > newTotalAvailable) {
      addToast('El Núcleo supera el espacio disponible.', 'warning');
      return;
    }

    setBastion((prev) => ({
      ...prev,
      mainBlock: {
        ...prev.mainBlock,
        expansions: prev.mainBlock.expansions.filter((e) => e.id !== id),
      },
    }));
    addToast('Expansión removida.', 'info');
  };

  /** Integra y anida una edificación especial como hijo interno del bloque principal */
  const handleIntegrateBuilding = (buildingId: string) => {
    setBastion((prev) => {
      const target = prev.independentBuildings.find((b) => b.id === buildingId);
      if (!target) return prev;

      const integratedTarget: SpecialBuildingBlock = {
        ...target,
        parentId: prev.mainBlock.id,
        isIntegrated: true,
      };

      addToast(`${target.name} integrada correctamente.`, 'success');

      return {
        ...prev,
        independentBuildings: prev.independentBuildings.filter((b) => b.id !== buildingId),
        mainBlock: {
          ...prev.mainBlock,
          integratedBuildings: [...prev.mainBlock.integratedBuildings, integratedTarget],
        },
      };
    });
  };

  /** Desacopla una edificación del bloque principal validando el límite del Núcleo */
  const handleDeintegrateBuilding = (buildingId: string) => {
    const target = bastion.mainBlock.integratedBuildings.find((b) => b.id === buildingId);
    if (!target) return;

    // Validación de reducción de espacio al retirar un hijo
    const childContribution = math.calculateCellCount(target.points);
    const newTotalAvailable = totalAvailableCells - childContribution;
    if (currentMainCells > newTotalAvailable) {
      addToast('El Núcleo supera el espacio disponible.', 'warning');
      return;
    }

    const independentTarget: SpecialBuildingBlock = {
      ...target,
      parentId: null,
      isIntegrated: false,
    };

    setBastion((prev) => ({
      ...prev,
      mainBlock: {
        ...prev.mainBlock,
        integratedBuildings: prev.mainBlock.integratedBuildings.filter((b) => b.id !== buildingId),
      },
      independentBuildings: [...prev.independentBuildings, independentTarget],
    }));

    addToast(`${target.name} desacoplada.`, 'warning');
  };

  /** Actualiza los puntos del bloque principal y sus hijos sincronizados */
  const handleUpdateMainPoints = (
    newPoints: Vertex[],
    updatedIntegratedBuildings: SpecialBuildingBlock[]
  ) => {
    setBastion((prev) => ({
      ...prev,
      mainBlock: {
        ...prev.mainBlock,
        points: newPoints,
        integratedBuildings: updatedIntegratedBuildings,
      },
    }));
  };

  /** Actualiza los puntos de una edificación especial */
  const handleUpdateBuildingPoints = (
    buildingId: string,
    isIntegrated: boolean,
    newPoints: Vertex[]
  ) => {
    setBastion((prev) => {
      if (isIntegrated) {
        return {
          ...prev,
          mainBlock: {
            ...prev.mainBlock,
            integratedBuildings: prev.mainBlock.integratedBuildings.map((b) =>
              b.id === buildingId ? { ...b, points: newPoints } : b
            ),
          },
        };
      } else {
        return {
          ...prev,
          independentBuildings: prev.independentBuildings.map((b) =>
            b.id === buildingId ? { ...b, points: newPoints } : b
          ),
        };
      }
    });
  };

  /** Elimina una edificación validando reducción de espacio si era hijo integrado */
  const handleDeleteBuilding = (id: string, isIntegrated: boolean) => {
    if (isIntegrated) {
      const target = bastion.mainBlock.integratedBuildings.find((b) => b.id === id);
      if (target) {
        const childContribution = math.calculateCellCount(target.points);
        const newTotalAvailable = totalAvailableCells - childContribution;
        if (currentMainCells > newTotalAvailable) {
          addToast('El Núcleo supera el espacio disponible.', 'warning');
          return;
        }
      }
    }

    setBastion((prev) => {
      if (isIntegrated) {
        return {
          ...prev,
          mainBlock: {
            ...prev.mainBlock,
            integratedBuildings: prev.mainBlock.integratedBuildings.filter((b) => b.id !== id),
          },
        };
      } else {
        return {
          ...prev,
          independentBuildings: prev.independentBuildings.filter((b) => b.id !== id),
        };
      }
    });

    if (selectedId === id) {
      setSelectedId('main_core');
    }

    addToast('Edificación eliminada.', 'info');
  };

  /** Comportamiento contextual del Botón Reload sobre el plano activo */
  const handleReloadBastion = () => {
    if (bastion.idBlueprint && lastSavedSnapshotRef.current) {
      setBastion(JSON.parse(JSON.stringify(lastSavedSnapshotRef.current)));
      setSelectedId('main_core');
      addToast('Proyecto recargado.', 'info');
    } else {
      setBastion({ ...INITIAL_BASTION_STATE, name: bastion.name });
      setSelectedId('main_core');
      addToast('Proyecto recargado.', 'info');
    }
  };

  /** Guarda el plano actual en SQLite de forma independiente */
  const handleSaveBastion = async () => {
    setIsSaving(true);
    try {
      const geometryJson = JSON.stringify({
        mainBlock: bastion.mainBlock,
        independentBuildings: bastion.independentBuildings,
      });

      if (bastion.idBlueprint) {
        await invoke('update_blueprint', {
          input: {
            id_blueprint: bastion.idBlueprint,
            name: bastion.name,
            grid_size_ft: bastion.gridSizeFt,
            geometry_json: geometryJson,
          },
        });
        lastSavedSnapshotRef.current = JSON.parse(JSON.stringify(bastion));
        fetchSavedBlueprints();
        addToast('Cambios guardados.', 'success');
      } else {
        const newId = await invoke<number>('create_blueprint', {
          input: {
            name: bastion.name,
            grid_size_ft: bastion.gridSizeFt,
            geometry_json: geometryJson,
          },
        });
        const updatedState: UnifiedBastionState = { ...bastion, idBlueprint: newId };
        setBastion(updatedState);
        lastSavedSnapshotRef.current = JSON.parse(JSON.stringify(updatedState));
        fetchSavedBlueprints();
        addToast('Cambios guardados.', 'success');
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      addToast('Error al guardar.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /** Carga y abre un plano guardado específico desde la Gestión de Planos */
  const handleOpenBlueprint = (record: BlueprintRecordBackend) => {
    try {
      const parsedData = JSON.parse(record.geometry_json);
      const loadedSpaceType: SpaceType = parsedData.mainBlock?.baseSpaceType || 'ESPACIOSO';
      const preset = EXPANSIONS_CATALOG[loadedSpaceType];

      const loadedBastion: UnifiedBastionState = {
        idBlueprint: record.id_blueprint,
        name: record.name,
        gridSizeFt: record.grid_size_ft || 5,
        mainBlock: {
          id: parsedData.mainBlock?.id || 'main_core',
          name: parsedData.mainBlock?.name || 'Núcleo del Bastión',
          baseSpaceType: loadedSpaceType,
          baseCells: parsedData.mainBlock?.baseCells || preset.additionalCells,
          baseCostEO: parsedData.mainBlock?.baseCostEO || preset.costEO,
          points:
            parsedData.mainBlock?.points ||
            createInitialPointsForSpace(loadedSpaceType, DEFAULT_START_POS.x, DEFAULT_START_POS.y),
          expansions: parsedData.mainBlock?.expansions || [],
          integratedBuildings: parsedData.mainBlock?.integratedBuildings || [],
        },
        independentBuildings: parsedData.independentBuildings || [],
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      };

      setBastion(loadedBastion);
      lastSavedSnapshotRef.current = JSON.parse(JSON.stringify(loadedBastion));
      setSelectedId('main_core');
      setShowPlansModal(false);
      addToast(`Plano "${record.name}" cargado.`, 'success');
    } catch (err) {
      console.error('Error al parsear bastión:', err);
      addToast('Error al procesar el archivo.', 'error');
    }
  };

  /** Elimina un plano de SQLite desde la Gestión de Planos */
  const handleDeleteBlueprint = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke('delete_blueprint_by_id', { id_blueprint: id });
      setSavedBlueprints((prev) => prev.filter((b) => b.id_blueprint !== id));
      if (bastion.idBlueprint === id) {
        handleCreateNewBlueprint();
      }
      addToast('Plano eliminado.', 'info');
    } catch (err) {
      console.error('Error al eliminar:', err);
      addToast('Error al eliminar.', 'error');
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-[#0b0e14] text-slate-100 overflow-hidden font-sans">
      {/* 1. Sistema de Notificaciones Toast Compacto */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* 2. Barra de Herramientas Superior con Botones de Iconos y Tooltips */}
      <BlueprintToolbar
        bastionName={bastion.name}
        isEditingSaved={!!bastion.idBlueprint}
        baseSpaceType={bastion.mainBlock.baseSpaceType}
        isBaseSpaceDisabled={hasAssociatedElements}
        onChangeBaseSpaceType={handleChangeBaseSpaceType}
        onChangeBastionName={(name) => setBastion((prev) => ({ ...prev, name }))}
        onAddBuilding={handleAddBuilding}
        onAddExpansion={handleAddExpansion}
        onReloadBastion={handleReloadBastion}
        onSaveBastion={handleSaveBastion}
        onOpenPlansManagement={() => {
          fetchSavedBlueprints();
          setShowPlansModal(true);
        }}
        isSaving={isSaving}
      />

      {/* 3. Área Central: Lienzo Canvas y Modal de Métricas Derecha */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Lienzo Canvas 2D */}
        <BlueprintCanvas
          mainBlock={bastion.mainBlock}
          independentBuildings={bastion.independentBuildings}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onUpdateMainPoints={handleUpdateMainPoints}
          onUpdateBuildingPoints={handleUpdateBuildingPoints}
          onIntegrateBuilding={handleIntegrateBuilding}
          onDeintegrateBuilding={handleDeintegrateBuilding}
          onExceedMainLimit={handleExceedMainLimit}
        />

        {/* Modal / Panel de Información en la Parte Derecha */}
        <BastionMetricsModal
          mainBlock={bastion.mainBlock}
          independentBuildings={bastion.independentBuildings}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onDeleteBuilding={handleDeleteBuilding}
          onRemoveExpansion={handleRemoveExpansion}
        />
      </div>

      {/* 4. Modal Centralizada de "Gestión de Planos" con Iconos y Tooltips (Portal) */}
      {showPlansModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#161922] border border-amber-500/40 rounded-3xl w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[82vh]">
              {/* Cabecera del Modal de Gestión */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/70">
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="text-amber-400" size={22} />
                  <div>
                    <h3 className="font-serif text-base font-bold text-amber-400">
                      Gestión de Planos
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Crea, selecciona, abre o elimina planos de tu proyecto
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateNewBlueprint()}
                    title="Crear un nuevo plano independiente en blanco"
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                  >
                    <FilePlus size={15} />
                    <span>Nuevo Plano</span>
                  </button>

                  <button
                    onClick={() => setShowPlansModal(false)}
                    title="Cerrar"
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Lista de Planos Almacenados */}
              <div className="p-5 overflow-y-auto space-y-2.5 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
                {isLoadingList ? (
                  <div className="text-center py-12 text-slate-400 font-mono text-xs">
                    Consultando base de datos local...
                  </div>
                ) : savedBlueprints.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <p className="text-slate-300 font-serif text-sm">
                      No hay planos guardados en el proyecto.
                    </p>
                    <p className="text-slate-500 text-xs">
                      Diseña en el canvas y pulsa el icono de Guardar.
                    </p>
                  </div>
                ) : (
                  savedBlueprints.map((item) => {
                    const isCurrent = item.id_blueprint === bastion.idBlueprint;
                    return (
                      <div
                        key={item.id_blueprint}
                        onClick={() => handleOpenBlueprint(item)}
                        className={`group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                          isCurrent
                            ? 'border-amber-400/80 bg-slate-800/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                            : 'bg-slate-950/60 border-white/5 hover:border-amber-500/40 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2.5">
                            <span className="font-serif font-bold text-sm text-slate-100 group-hover:text-amber-300">
                              {item.name}
                            </span>
                            {isCurrent && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40">
                                <Check size={10} />
                                Activo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                            <Calendar size={12} />
                            <span>Actualizado: {item.updated_at}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleDeleteBlueprint(item.id_blueprint, e)}
                            title="Eliminar plano de SQLite"
                            className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-2 rounded-xl hover:bg-rose-950/40 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pie Informativo */}
              <div className="p-3.5 border-t border-white/10 bg-slate-950/70 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total de planos guardados: {savedBlueprints.length}</span>
                <span className="font-mono text-amber-400/80">Gestión Segura en SQLite</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
