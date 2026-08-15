/**
 * Tipos e interfaces del motor de modelado arquitectónico, jerarquía padre-hijo,
 * espacio físico en cuadros y diferenciación de costes en EO para D&D.
 */

export interface Vertex {
  x: number;
  y: number;
}

/** Tipos de espacio físico de las edificaciones y expansiones */
export type SpaceType = 'APRETADO' | 'ESPACIOSO' | 'VASTO';

/** Preset de espacio para el núcleo base o expansiones */
export interface ExpansionPreset {
  type: SpaceType;
  name: string;
  additionalCells: number; // 4, 16, 36 cuadros
  costEO: number;          // 500, 1000, 3000 EO
  dimFt: string;           // "10x10 ft", "20x20 ft", "30x30 ft"
}

/** Expansión de espacio adquirida y aplicada al bloque principal */
export interface AppliedExpansion {
  id: string;
  type: SpaceType;
  name: string;
  cells: number;
  costEO: number;
}

/** Definición de una edificación especial del catálogo oficial */
export interface BuildingDefinition {
  id: string;
  name: string;
  space: SpaceType;
  maxCells: number;      // 4 (Apretado), 16 (Espacioso), 36 (Vasto)
  costEO: number;        // Coste específico de la edificación en EO (ej. 5.000, 9.000, 13.000, 17.000 EO)
  dimFt: string;         // "10x10 ft", "20x20 ft", "30x30 ft"
  color: string;
}

/** Edificación especial con su propio perímetro interno y límites de cuadros */
export interface SpecialBuildingBlock {
  id: string;
  parentId: string | null;  // ID del bloque principal si está integrada, o null si es independiente
  buildingId: string;
  name: string;
  space: SpaceType;
  maxCells: number;         // Cuadros máximos permitidos para esta edificación (4, 16 o 36)
  costEO: number;           // Coste de la edificación especial en EO
  points: Vertex[];         // Perímetro interno propio
  isIntegrated: boolean;    // True si está anidada como hijo del bloque principal
}

/** Bloque Principal del bastión (Padre) */
export interface MainConstructionBlock {
  id: string;
  name: string;
  baseSpaceType: SpaceType; // Espacio inicial a elección del usuario (Apretado, Espaciado, Vasto)
  baseCells: number;        // Cuadros base asignados al núcleo (4, 16 o 36 cuadros)
  baseCostEO: number;       // Coste inicial del núcleo en EO (500, 1000 o 3000 EO)
  points: Vertex[];         // Vértices del contorno general
  expansions: AppliedExpansion[]; // Expansiones de espacio adicionales adquiridas
  integratedBuildings: SpecialBuildingBlock[]; // Edificaciones especiales hijas anidadas
}

/** Estado Unificado de la Construcción */
export interface UnifiedBastionState {
  idBlueprint?: number;
  name: string;
  gridSizeFt: number;       // 5 ft por cuadro (40px)
  mainBlock: MainConstructionBlock;
  independentBuildings: SpecialBuildingBlock[]; // Edificaciones especiales flotantes/independientes
  createdAt?: string;
  updatedAt?: string;
}

/** Notificación Toast */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}
