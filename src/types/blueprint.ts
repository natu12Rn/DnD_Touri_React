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

/** Categoría de bloque en la arquitectura modular Bottom-Up */
export type BlockType = 'BASIC_ROOM' | 'SPECIAL_FACILITY' | 'CORRIDOR';

/** Bloque de construcción independiente en el canvas táctico */
export interface BastionBlock {
  id: string;
  name: string;
  type: BlockType;
  points: Vertex[];         // Vértices del polígono en la grilla
  isCostFree: boolean;      // True para pasillos y elementos decorativos (0 costo de celdas)
  space?: SpaceType;        // Apretado (4), Espacioso (16), Vasto (36) si aplica
  requiredCells?: number;   // 4, 16 o 36 casillas exactas para edificaciones especiales
  costEO?: number;          // Coste en piezas de oro / EO según catálogo
  buildingId?: string;      // ID de la edificación del catálogo si es de tipo SPECIAL_FACILITY
  color?: string;           // Color de renderizado personalizado o por defecto
}

/** Estado Unificado de la Construcción (Modelo Bottom-Up v2) */
export interface UnifiedBastionState {
  version?: number;         // Versión del modelo de datos (v2)
  idBlueprint?: number;
  name: string;
  gridSizeFt: number;       // 5 ft por cuadro (40px)
  blocks: BastionBlock[];   // Arreglo plano de todos los bloques independientes
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

