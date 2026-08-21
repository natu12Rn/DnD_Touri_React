import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { invoke } from '@tauri-apps/api/core';
import {
  Vertex,
  UnifiedBastionState,
  BastionBlock,
  BuildingDefinition,
  SpaceType,
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
  createCorridorPoints,
  math,
  formatEO,
} from '../../utils/geometry';
import { X, Trash2, Calendar, FilePlus, FolderKanban, Check } from 'lucide-react';

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
  version: 2,
  name: 'Base Principal',
  gridSizeFt: CONFIG.feetPerCell,
  blocks: [
    {
      id: 'room_main_core',
      name: 'Salón Principal',
      type: 'BASIC_ROOM',
      points: createInitialPointsForSpace('ESPACIOSO', DEFAULT_START_POS.x, DEFAULT_START_POS.y),
      isCostFree: false,
      space: 'ESPACIOSO',
      requiredCells: EXPANSIONS_CATALOG['ESPACIOSO'].additionalCells,
      costEO: EXPANSIONS_CATALOG['ESPACIOSO'].costEO,
    },
  ],
};

export const BlueprintEditor: React.FC = () => {
  const [bastion, setBastion] = useState<UnifiedBastionState>({ ...INITIAL_BASTION_STATE });

  // Snapshot del último estado guardado para recargas contextuales
  const lastSavedSnapshotRef = useRef<UnifiedBastionState | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>('room_main_core');
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

  /** Crea un nuevo plano independiente en blanco desde la Gestión de Planos */
  const handleCreateNewBlueprint = (newPlanName?: string) => {
    const name = newPlanName || `Nuevo Plano ${savedBlueprints.length + 1}`;
    const newInitialBlock: BastionBlock = {
      id: `room_${Date.now()}`,
      name: 'Salón Principal',
      type: 'BASIC_ROOM',
      points: createInitialPointsForSpace('ESPACIOSO', DEFAULT_START_POS.x, DEFAULT_START_POS.y),
      isCostFree: false,
      space: 'ESPACIOSO',
      requiredCells: EXPANSIONS_CATALOG['ESPACIOSO'].additionalCells,
      costEO: EXPANSIONS_CATALOG['ESPACIOSO'].costEO,
    };

    const newState: UnifiedBastionState = {
      version: 2,
      name,
      gridSizeFt: CONFIG.feetPerCell,
      blocks: [newInitialBlock],
      idBlueprint: undefined,
    };

    setBastion(newState);
    lastSavedSnapshotRef.current = null;
    setSelectedId(newInitialBlock.id);
    setShowPlansModal(false);
    addToast('Nuevo plano creado.', 'info');
  };


  /** Agrega un Pasillo con costo 0 de celdas */
  const handleAddCorridor = () => {
    const count = bastion.blocks.length;
    const offset = (count % 5) * 80;
    const points = createCorridorPoints(320 + offset, 240 + offset, 3);

    const newCorridor: BastionBlock = {
      id: `corridor_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: 'Pasillo',
      type: 'CORRIDOR',
      points,
      isCostFree: true,
      costEO: 0,
    };

    setBastion((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newCorridor],
    }));

    setSelectedId(newCorridor.id);
    addToast('Pasillo agregado (Costo 0).', 'info');
  };

  /** Agrega una Habitación Básica */
  const handleAddRoom = (spaceType: SpaceType = 'ESPACIOSO') => {
    const count = bastion.blocks.length;
    const offset = (count % 5) * 80;
    const preset = EXPANSIONS_CATALOG[spaceType];
    const points = createInitialPointsForSpace(spaceType, 400 + offset, 200 + offset);

    const newRoom: BastionBlock = {
      id: `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: `Habitación ${count + 1}`,
      type: 'BASIC_ROOM',
      points,
      isCostFree: false,
      space: spaceType,
      requiredCells: preset.additionalCells,
      costEO: preset.costEO,
    };

    setBastion((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newRoom],
    }));

    setSelectedId(newRoom.id);
    addToast(`Habitación (${preset.name} - ${formatEO(preset.costEO)}) agregada.`, 'info');
  };

  /** Incorpora una nueva edificación especial del catálogo como bloque independiente */
  const handleAddBuilding = (building: BuildingDefinition) => {
    const count = bastion.blocks.length;
    const offset = (count % 5) * 80;
    const initialPoints = createInitialPointsForSpace(
      building.space,
      480 + offset,
      160 + offset
    );

    const newBuilding: BastionBlock = {
      id: `special_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      buildingId: building.id,
      name: building.name,
      type: 'SPECIAL_FACILITY',
      space: building.space,
      requiredCells: building.maxCells,
      costEO: building.costEO,
      points: initialPoints,
      isCostFree: false,
      color: building.color,
    };

    setBastion((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBuilding],
    }));

    setSelectedId(newBuilding.id);
    addToast(`${building.name} agregada (${building.maxCells} celdas).`, 'info');
  };


  /** Actualiza los puntos de cualquier bloque */
  const handleUpdateBlockPoints = (blockId: string, newPoints: Vertex[]) => {
    setBastion((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === blockId ? { ...b, points: newPoints } : b)),
    }));
  };

  /** Elimina un bloque por completo */
  const handleDeleteBlock = (id: string) => {
    setBastion((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));

    if (selectedId === id) {
      setSelectedId(null);
    }

    addToast('Estructura eliminada.', 'info');
  };

  /** Comportamiento contextual del Botón Reload sobre el plano activo */
  const handleReloadBastion = () => {
    if (bastion.idBlueprint && lastSavedSnapshotRef.current) {
      setBastion(JSON.parse(JSON.stringify(lastSavedSnapshotRef.current)));
      addToast('Proyecto recargado.', 'info');
    } else {
      setBastion({ ...INITIAL_BASTION_STATE, name: bastion.name });
      addToast('Proyecto recargado.', 'info');
    }
  };

  /** Guarda el plano actual en SQLite de forma independiente */
  const handleSaveBastion = async () => {
    setIsSaving(true);
    try {
      const geometryJson = JSON.stringify({
        version: 2,
        blocks: bastion.blocks,
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
      addToast('Error al guardar en la base de datos.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /** Carga y abre un plano guardado específico desde la Gestión de Planos (Con soporte v1 y v2) */
  const handleOpenBlueprint = (record: BlueprintRecordBackend) => {
    try {
      const parsedData = JSON.parse(record.geometry_json);
      let loadedBlocks: BastionBlock[] = [];

      // Soporte v2 (Bottom-Up plano)
      if (parsedData.version === 2 && Array.isArray(parsedData.blocks)) {
        loadedBlocks = parsedData.blocks;
      } else {
        // Migración dinámica v1 (Legacy Top-Down a Bottom-Up)
        if (parsedData.mainBlock) {
          const loadedSpaceType: SpaceType = parsedData.mainBlock.baseSpaceType || 'ESPACIOSO';
          const preset = EXPANSIONS_CATALOG[loadedSpaceType];
          loadedBlocks.push({
            id: parsedData.mainBlock.id || 'main_core',
            name: parsedData.mainBlock.name || 'Salón Principal',
            type: 'BASIC_ROOM',
            space: loadedSpaceType,
            requiredCells: preset.additionalCells,
            costEO: parsedData.mainBlock.baseCostEO || preset.costEO,
            points: parsedData.mainBlock.points || [],
            isCostFree: false,
          });

          if (Array.isArray(parsedData.mainBlock.integratedBuildings)) {
            parsedData.mainBlock.integratedBuildings.forEach((child: any) => {
              loadedBlocks.push({
                id: child.id,
                name: child.name,
                type: 'SPECIAL_FACILITY',
                buildingId: child.buildingId,
                space: child.space,
                requiredCells: child.maxCells,
                costEO: child.costEO,
                points: child.points,
                isCostFree: false,
              });
            });
          }
        }

        if (Array.isArray(parsedData.independentBuildings)) {
          parsedData.independentBuildings.forEach((indep: any) => {
            loadedBlocks.push({
              id: indep.id,
              name: indep.name,
              type: 'SPECIAL_FACILITY',
              buildingId: indep.buildingId,
              space: indep.space,
              requiredCells: indep.maxCells,
              costEO: indep.costEO,
              points: indep.points,
              isCostFree: false,
            });
          });
        }
      }

      // Sanitizar todos los vértices cargados ajustándolos a la grilla de 40px
      const sanitizedBlocks = loadedBlocks.map((block) => ({
        ...block,
        points: block.points.map((pt) => ({
          x: math.snap(pt.x),
          y: math.snap(pt.y),
        })),
      }));

      const loadedBastion: UnifiedBastionState = {
        version: 2,
        idBlueprint: record.id_blueprint,
        name: record.name,
        gridSizeFt: record.grid_size_ft || 5,
        blocks: sanitizedBlocks,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      };

      setBastion(loadedBastion);
      lastSavedSnapshotRef.current = JSON.parse(JSON.stringify(loadedBastion));
      setSelectedId(sanitizedBlocks[0]?.id || null);
      setShowPlansModal(false);
      addToast(`Plano "${record.name}" cargado.`, 'success');
    } catch (err) {
      console.error('Error al parsear bastión:', err);
      addToast('Error al procesar el archivo guardado.', 'error');
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
      addToast('Error al eliminar de SQLite.', 'error');
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0f1117] text-slate-100 select-none overflow-hidden font-sans">
      {/* 1. Selector Superior de Edificaciones, Pasillos y Filtros */}
      <BlueprintToolbar
        bastionName={bastion.name}
        isEditingSaved={Boolean(bastion.idBlueprint)}
        onChangeBastionName={(newName: string) =>
          setBastion((prev) => ({ ...prev, name: newName }))
        }
        onAddBuilding={handleAddBuilding}
        onAddRoom={handleAddRoom}
        onAddCorridor={handleAddCorridor}
        onReloadBastion={handleReloadBastion}
        onSaveBastion={handleSaveBastion}
        onOpenPlansManagement={() => {
          fetchSavedBlueprints();
          setShowPlansModal(true);
        }}
        isSaving={isSaving}
      />

      {/* 2. Área Central: Lienzo Canvas y Modal de Métricas Derecha */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Lienzo Canvas 2D con modelo de bloques independientes y Soft Validation */}
        <BlueprintCanvas
          blocks={bastion.blocks}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onUpdateBlockPoints={handleUpdateBlockPoints}
          onDeleteBlock={handleDeleteBlock}
        />

        {/* Modal / Panel de Información en la Parte Derecha */}
        <BastionMetricsModal
          blocks={bastion.blocks}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onDeleteBlock={handleDeleteBlock}
        />
      </div>

      {/* 3. Modal Centralizada de "Gestión de Planos" (Portal) */}
      {showPlansModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#161922] border border-amber-500/40 rounded-3xl w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[82vh]">
              {/* Cabecera del Modal de Gestión */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/70">
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="text-amber-400" size={22} />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-amber-400">
                      Gestión de Planos
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Administra y cambia entre tus planos guardados en SQLite
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlansModal(false)}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Botón Acción Rápida: Crear Nuevo Plano */}
              <div className="p-4 border-b border-white/5 bg-slate-900/40">
                <button
                  onClick={() => handleCreateNewBlueprint()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-98"
                >
                  <FilePlus size={18} />
                  <span>+ Crear Nuevo Plano en Blanco</span>
                </button>
              </div>

              {/* Lista de Planos Existentes */}
              <div className="p-4 overflow-y-auto flex-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700">
                {isLoadingList ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-mono">
                    Consultando base de datos SQLite...
                  </div>
                ) : savedBlueprints.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-mono">
                    No hay planos registrados en la base de datos.
                  </div>
                ) : (
                  savedBlueprints.map((item) => {
                    const isCurrent = bastion.idBlueprint === item.id_blueprint;
                    return (
                      <div
                        key={item.id_blueprint}
                        onClick={() => handleOpenBlueprint(item)}
                        className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                            : 'bg-slate-900/70 border-white/10 hover:border-amber-500/40 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl border ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-slate-800 text-slate-300 border-white/10 group-hover:border-amber-500/30'
                            }`}
                          >
                            {isCurrent ? <Check size={16} /> : <FolderKanban size={16} />}
                          </div>
                          <div>
                            <div className="font-serif text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              <Calendar size={11} />
                              <span>{item.updated_at || item.created_at || 'Reciente'}</span>
                              <span>•</span>
                              <span>ID: #{item.id_blueprint}</span>
                            </div>
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
            </div>
          </div>,
          document.body
        )}

      {/* 4. Notificaciones Toasts en la Esquina Inferior Derecha */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};
