import { Vertex, BuildingDefinition, SpaceType, ExpansionPreset } from '../types/blueprint';

/** Configuración del motor de modelado ortogonal */
export const CONFIG = {
  gridSize: 40, // 40px = 1 casilla de 5x5 ft
  cornerSize: 12,
  feetPerCell: 5,
  defaultBaseCells: 16, // Cuadros base del núcleo (16 cuadros = 20x20 ft)
  colors: {
    primary: '#f59e0b', // Acento ámbar D&D
    primaryDark: '#d97706',
    wall: '#f8fafc',
    wallMain: '#fbbf24',
    wallIntegrated: '#10b981', // Borde verde para perímetros internos integrados
    wallIndependent: '#64748b', // Borde para bloques independientes
    fillPrimary: 'rgba(245, 158, 11, 0.14)',
    fillIntegrated: 'rgba(16, 185, 129, 0.12)',
    fillIndependent: 'rgba(100, 116, 139, 0.12)',
    fillOverLimit: 'rgba(239, 68, 68, 0.25)',
    grid: 'rgba(255, 255, 255, 0.05)',
    gridMajor: 'rgba(212, 175, 55, 0.18)',
    gridMinor: 'rgba(255, 255, 255, 0.04)',
    text: '#94a3b8',
    textHighlight: '#fbbf24',
    handle: '#475569',
    ghost: 'rgba(16, 185, 129, 0.35)',
    ghostHover: '#10b981',
  },
};

/** Catálogo de expansiones de espacio con sus costes específicos en EO */
export const EXPANSIONS_CATALOG: Record<SpaceType, ExpansionPreset> = {
  APRETADO: {
    type: 'APRETADO',
    name: 'Apretado',
    additionalCells: 4,
    costEO: 500,
    dimFt: '10x10 ft',
  },
  ESPACIOSO: {
    type: 'ESPACIOSO',
    name: 'Espaciado',
    additionalCells: 16,
    costEO: 1000,
    dimFt: '20x20 ft',
  },
  VASTO: {
    type: 'VASTO',
    name: 'Vasto',
    additionalCells: 36,
    costEO: 3000,
    dimFt: '30x30 ft',
  },
};

/** Catálogo oficial de las 38 edificaciones especiales con sus costes en EO */
export const BUILDINGS_CATALOG: BuildingDefinition[] = [
  // 1. Apretado (4 cuadrículas • 10x10 ft)
  { id: 'aviario', name: 'Aviario', space: 'APRETADO', maxCells: 4, costEO: 5000, dimFt: '10x10 ft', color: '#38bdf8' },
  { id: 'camara_meditacion', name: 'Cámara de Meditación', space: 'APRETADO', maxCells: 4, costEO: 13000, dimFt: '10x10 ft', color: '#818cf8' },
  { id: 'relicario', name: 'Relicario', space: 'APRETADO', maxCells: 4, costEO: 13000, dimFt: '10x10 ft', color: '#c084fc' },

  // 2. Espacioso (16 cuadrículas • 20x20 ft)
  { id: 'almacen', name: 'Almacén', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#f59e0b' },
  { id: 'archivo', name: 'Archivo', space: 'ESPACIOSO', maxCells: 16, costEO: 13000, dimFt: '20x20 ft', color: '#f97316' },
  { id: 'armeria', name: 'Armería', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#ef4444' },
  { id: 'biblioteca', name: 'Biblioteca', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#3b82f6' },
  { id: 'camara_adivinacion', name: 'Cámara de Adivinación', space: 'ESPACIOSO', maxCells: 16, costEO: 9000, dimFt: '20x20 ft', color: '#a855f7' },
  { id: 'circulo_teletransporte', name: 'Círculo de Teletransportación', space: 'ESPACIOSO', maxCells: 16, costEO: 9000, dimFt: '20x20 ft', color: '#06b6d4' },
  { id: 'cuartel', name: 'Cuartel', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#eab308' },
  { id: 'establo', name: 'Establo', space: 'ESPACIOSO', maxCells: 16, costEO: 9000, dimFt: '20x20 ft', color: '#d97706' },
  { id: 'estudio_arcano', name: 'Estudio Arcano', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#8b5cf6' },
  { id: 'fabrica_trampas', name: 'Fábrica de Trampas', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#64748b' },
  { id: 'forja', name: 'Forja', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#f97316' },
  { id: 'invernadero', name: 'Invernadero', space: 'ESPACIOSO', maxCells: 16, costEO: 9000, dimFt: '20x20 ft', color: '#22c55e' },
  { id: 'jardin', name: 'Jardín', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#10b981' },
  { id: 'laboratorio', name: 'Laboratorio', space: 'ESPACIOSO', maxCells: 16, costEO: 9000, dimFt: '20x20 ft', color: '#14b8a6' },
  { id: 'motor_bastion_movil', name: 'Motor de Bastión Móvil', space: 'ESPACIOSO', maxCells: 16, costEO: 13000, dimFt: '20x20 ft', color: '#e11d48' },
  { id: 'observatorio', name: 'Observatorio', space: 'ESPACIOSO', maxCells: 16, costEO: 13000, dimFt: '20x20 ft', color: '#6366f1' },
  { id: 'portentorium', name: 'Portentorium', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#9333ea' },
  { id: 'prision', name: 'Prisión', space: 'ESPACIOSO', maxCells: 16, costEO: 9000, dimFt: '20x20 ft', color: '#475569' },
  { id: 'pub', name: 'Pub', space: 'ESPACIOSO', maxCells: 16, costEO: 13000, dimFt: '20x20 ft', color: '#d97706' },
  { id: 'sacristia', name: 'Sacristía', space: 'ESPACIOSO', maxCells: 16, costEO: 9000, dimFt: '20x20 ft', color: '#fbbf24' },
  { id: 'salon_tatuajes', name: 'Salón de Tatuajes', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#f43f5e' },
  { id: 'sanctum', name: 'Sanctum', space: 'ESPACIOSO', maxCells: 16, costEO: 17000, dimFt: '20x20 ft', color: '#c084fc' },
  { id: 'santuario', name: 'Santuario', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#e0e7ff' },
  { id: 'scriptorium', name: 'Scriptorium', space: 'ESPACIOSO', maxCells: 16, costEO: 9000, dimFt: '20x20 ft', color: '#ca8a04' },
  { id: 'taller', name: 'Taller', space: 'ESPACIOSO', maxCells: 16, costEO: 5000, dimFt: '20x20 ft', color: '#ea580c' },
  { id: 'templo', name: 'Templo', space: 'ESPACIOSO', maxCells: 16, costEO: 13000, dimFt: '20x20 ft', color: '#fde047' },

  // 3. Vasto (36 cuadrículas • 30x30 ft)
  { id: 'casa_fieras', name: 'Casa de Fieras', space: 'VASTO', maxCells: 36, costEO: 13000, dimFt: '30x30 ft', color: '#ca8a04' },
  { id: 'demiplano', name: 'Demiplano', space: 'VASTO', maxCells: 36, costEO: 17000, dimFt: '30x30 ft', color: '#a855f7' },
  { id: 'mina', name: 'Mina', space: 'VASTO', maxCells: 36, costEO: 9000, dimFt: '30x30 ft', color: '#78716c' },
  { id: 'posada', name: 'Posada', space: 'VASTO', maxCells: 36, costEO: 9000, dimFt: '30x30 ft', color: '#f59e0b' },
  { id: 'sala_guerra', name: 'Sala de Guerra', space: 'VASTO', maxCells: 36, costEO: 17000, dimFt: '30x30 ft', color: '#dc2626' },
  { id: 'sala_juegos', name: 'Sala de Juegos', space: 'VASTO', maxCells: 36, costEO: 9000, dimFt: '30x30 ft', color: '#ec4899' },
  { id: 'salon_gremio', name: 'Salón de Gremio', space: 'VASTO', maxCells: 36, costEO: 17000, dimFt: '30x30 ft', color: '#6366f1' },
  { id: 'teatro', name: 'Teatro', space: 'VASTO', maxCells: 36, costEO: 9000, dimFt: '30x30 ft', color: '#e11d48' },
  { id: 'zona_entrenamiento', name: 'Zona de Entrenamiento', space: 'VASTO', maxCells: 36, costEO: 9000, dimFt: '30x30 ft', color: '#16a34a' },
];

/** Formateador amigable de valores EO (ej. 5.000 EO) */
export function formatEO(val: number): string {
  return `${val.toLocaleString('es-ES')} EO`;
}

/** Comprueba si dos bloques se encuentran en proximidad inmediata o solapamiento */
export function checkBlocksProximity(
  b1Points: Vertex[],
  b2Points: Vertex[],
  thresholdPx: number = CONFIG.gridSize
): boolean {
  const bb1 = math.getBoundingBox(b1Points);
  const bb2 = math.getBoundingBox(b2Points);

  const isSeparatedX = bb1.maxX + thresholdPx < bb2.minX || bb2.maxX + thresholdPx < bb1.minX;
  const isSeparatedY = bb1.maxY + thresholdPx < bb2.minY || bb2.maxY + thresholdPx < bb1.minY;
  if (isSeparatedX || isSeparatedY) return false;

  for (const p1 of b1Points) {
    for (const p2 of b2Points) {
      if (math.distance(p1, p2) <= thresholdPx * 1.05) {
        return true;
      }
    }
  }

  return false;
}

/** Utilidades matemáticas y de cuadrícula */
export const math = {
  snap: (value: number, step: number = CONFIG.gridSize): number =>
    Math.round(value / step) * step,

  distance: (p1: Vertex, p2: Vertex): number =>
    Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)),

  /** Punto medio entre dos vértices */
  getEdgeMidpoint: (p1: Vertex, p2: Vertex): Vertex => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }),

  /** Centroide o punto central de un polígono */
  getPolygonCenter: (points: Vertex[]): Vertex => {
    if (points.length === 0) return { x: 0, y: 0 };
    let sumX = 0;
    let sumY = 0;
    points.forEach((p) => {
      sumX += p.x;
      sumY += p.y;
    });
    return { x: sumX / points.length, y: sumY / points.length };
  },

  /** Distancia de un punto a un segmento de línea */
  distanceToSegment: (p: Vertex, v: Vertex, w: Vertex): number => {
    const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  },

  /**
   * Obtiene un punto interior visual garantizado dentro del polígono del bloque.
   * Si el centroide cae dentro del polígono cerrado, lo usa.
   * Si el centroide cae fuera (polígonos en L o U), escanea las celdas interiores
   * para ubicar el rótulo siempre adentro de los muros del bloque.
   */
  getVisualInteriorCenter: (points: Vertex[]): Vertex => {
    if (points.length === 0) return { x: 0, y: 0 };
    if (points.length < 3) return math.getPolygonCenter(points);

    const bb = math.getBoundingBox(points);
    const centroid = math.getPolygonCenter(points);

    // 1. Si el centroide está dentro del polígono, comprobar si tiene suficiente margen
    if (math.isPointInPolygon(centroid, points)) {
      return centroid;
    }

    // 2. Si el centroide cae fuera o en una arista, encontrar la celda interior con mayor margen
    let bestPoint = centroid;
    let maxClearance = -1;

    for (let x = bb.minX + CONFIG.gridSize / 2; x < bb.maxX; x += CONFIG.gridSize) {
      for (let y = bb.minY + CONFIG.gridSize / 2; y < bb.maxY; y += CONFIG.gridSize) {
        const candidate = { x, y };
        if (math.isPointInPolygon(candidate, points)) {
          let minDist = Infinity;
          for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const dist = math.distanceToSegment(candidate, p1, p2);
            if (dist < minDist) minDist = dist;
          }
          if (minDist > maxClearance) {
            maxClearance = minDist;
            bestPoint = candidate;
          }
        }
      }
    }

    return bestPoint;
  },

  /** Formatea la medida en pies de D&D (múltiplos de 5 ft) */
  formatMeasure: (pixels: number): string => {
    const cells = Math.round(pixels / CONFIG.gridSize);
    return `${cells * CONFIG.feetPerCell} ft`;
  },

  /** Calcula el número de cuadrículas de 5x5 ft ocupadas usando la fórmula Shoelace */
  calculateCellCount: (points: Vertex[]): number => {
    const n = points.length;
    if (n < 3) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const curr = points[i];
      const next = points[(i + 1) % n];
      sum += curr.x * next.y - next.x * curr.y;
    }
    const areaPx2 = Math.abs(sum) / 2;
    const cellAreaPx2 = CONFIG.gridSize * CONFIG.gridSize;
    return Math.round(areaPx2 / cellAreaPx2);
  },

  /** Comprueba si un punto (x, y) se encuentra dentro de un polígono cerrado (Ray Casting) */
  isPointInPolygon: (point: Vertex, polygon: Vertex[]): boolean => {
    const { x, y } = point;
    let inside = false;
    const n = polygon.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  },

  /** Obtiene la caja delimitadora (Bounding Box) de un conjunto de puntos */
  getBoundingBox: (points: Vertex[]): { minX: number; maxX: number; minY: number; maxY: number } => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    return { minX, maxX, minY, maxY };
  },

  checkBlocksProximity,

  /**
   * Comprueba si dos polígonos de bloques se superponen ocupando casillas en común.
   * (Muros compartidos o adyacencia NO cuentan como superposición).
   */
  doBlocksOverlap: (pointsA: Vertex[], pointsB: Vertex[]): boolean => {
    if (pointsA.length < 3 || pointsB.length < 3) return false;

    const bbA = math.getBoundingBox(pointsA);
    const bbB = math.getBoundingBox(pointsB);

    if (
      bbA.maxX <= bbB.minX ||
      bbB.maxX <= bbA.minX ||
      bbA.maxY <= bbB.minY ||
      bbB.maxY <= bbA.minY
    ) {
      return false;
    }

    const intersectMinX = math.snap(Math.max(bbA.minX, bbB.minX));
    const intersectMaxX = math.snap(Math.min(bbA.maxX, bbB.maxX));
    const intersectMinY = math.snap(Math.max(bbA.minY, bbB.minY));
    const intersectMaxY = math.snap(Math.min(bbA.maxY, bbB.maxY));

    for (let x = intersectMinX; x < intersectMaxX; x += CONFIG.gridSize) {
      for (let y = intersectMinY; y < intersectMaxY; y += CONFIG.gridSize) {
        const cellCenter = { x: x + CONFIG.gridSize / 2, y: y + CONFIG.gridSize / 2 };
        if (
          math.isPointInPolygon(cellCenter, pointsA) &&
          math.isPointInPolygon(cellCenter, pointsB)
        ) {
          return true;
        }
      }
    }

    return false;
  },

  /**
   * Comprueba si un bloque se superpone con algún otro bloque del Bastión.
   */
  checkBlockOverlaps: (
    blockId: string,
    points: Vertex[],
    allBlocks: { id: string; points: Vertex[] }[]
  ): boolean => {
    for (const other of allBlocks) {
      if (other.id === blockId) continue;
      if (math.doBlocksOverlap(points, other.points)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Descompone todas las paredes del Bastión en bordes unitarios de 40px (1 casilla).
   * Cuenta cuántos bloques contienen cada borde unitario para renderizar el contorno unificado.
   */
  computeGridEdgeCounts: (blocks: { points: Vertex[] }[]): Map<string, number> => {
    const edgeCounts = new Map<string, number>();

    blocks.forEach((block) => {
      const points = block.points;
      const N = points.length;
      if (N < 3) return;

      for (let i = 0; i < N; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % N];

        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);

        if (Math.abs(p1.y - p2.y) < 1) {
          // Segmento Horizontal
          const y = math.snap(p1.y);
          const startX = math.snap(minX);
          const endX = math.snap(maxX);
          for (let x = startX; x < endX; x += CONFIG.gridSize) {
            const key = `H:${x},${y}`;
            edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
          }
        } else if (Math.abs(p1.x - p2.x) < 1) {
          // Segmento Vertical
          const x = math.snap(p1.x);
          const startY = math.snap(minY);
          const endY = math.snap(maxY);
          for (let y = startY; y < endY; y += CONFIG.gridSize) {
            const key = `V:${x},${y}`;
            edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
          }
        }
      }
    });

    return edgeCounts;
  },

  /**
   * Comprueba si un polígono es simple (no se intersecta a sí mismo).
   */
  isSimplePolygon: (points: Vertex[]): boolean => {
    const n = points.length;
    if (n < 4) return true;

    function doSegmentsIntersect(p1: Vertex, q1: Vertex, p2: Vertex, q2: Vertex): boolean {
      function ccw(a: Vertex, b: Vertex, c: Vertex): number {
        const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
        if (Math.abs(val) < 1e-5) return 0; // Colineal
        return val > 0 ? 1 : 2; // Horario o antihorario
      }

      const o1 = ccw(p1, q1, p2);
      const o2 = ccw(p1, q1, q2);
      const o3 = ccw(p2, q2, p1);
      const o4 = ccw(p2, q2, q1);

      if (o1 !== o2 && o3 !== o4) return true;
      return false;
    }

    for (let i = 0; i < n; i++) {
      const p1 = points[i];
      const q1 = points[(i + 1) % n];

      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue; // Ignorar segmentos adyacentes de cierre
        const p2 = points[j];
        const q2 = points[(j + 1) % n];

        if (doSegmentsIntersect(p1, q1, p2, q2)) {
          return false;
        }
      }
    }
    return true;
  },
};

/**
 * Crea los vértices iniciales de un pasillo de costo 0 (1x3 casillas por defecto).
 */
export function createCorridorPoints(
  rawStartX: number = 200,
  rawStartY: number = 200,
  lengthCells: number = 3
): Vertex[] {
  const startX = math.snap(rawStartX);
  const startY = math.snap(rawStartY);
  const widthPx = CONFIG.gridSize; // 1 casilla de 40px (5ft) de ancho
  const lengthPx = lengthCells * CONFIG.gridSize; // 3 casillas de largo (15ft)

  return [
    { x: startX, y: startY },
    { x: startX + lengthPx, y: startY },
    { x: startX + lengthPx, y: startY + widthPx },
    { x: startX, y: startY + widthPx },
  ];
}

/**
 * Crea los vértices iniciales de un bloque cuadrado según su tipo de espacio.
 */
export function createInitialPointsForSpace(
  space: SpaceType,
  rawStartX: number = 200,
  rawStartY: number = 200
): Vertex[] {
  const startX = math.snap(rawStartX);
  const startY = math.snap(rawStartY);
  let cellsSide = 4; // Por defecto Espacioso 4x4
  if (space === 'APRETADO') cellsSide = 2; // 2x2 celdas = 4
  else if (space === 'VASTO') cellsSide = 6; // 6x6 celdas = 36

  const sidePx = cellsSide * CONFIG.gridSize;
  return [
    { x: startX, y: startY },
    { x: startX + sidePx, y: startY },
    { x: startX + sidePx, y: startY + sidePx },
    { x: startX, y: startY + sidePx },
  ];
}

/**
 * Algoritmo para limpiar vértices redundantes si las paredes quedan en el mismo eje,
 * preservando la paridad de polígonos ortogonales.
 */
export function simplifyPolygon(points: Vertex[]): Vertex[] {
  let p = points.map((pt) => ({ ...pt }));
  let changed = true;

  while (changed && p.length > 4) {
    changed = false;
    const n = p.length;
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      if (Math.abs(p[i].x - p[next].x) < 1 && Math.abs(p[i].y - p[next].y) < 1) {
        if (i === n - 1) {
          p.pop();
          p.shift();
          const last = p.pop();
          if (last) p.unshift(last);
        } else {
          p.splice(i, 2);
        }
        changed = true;
        break;
      }
    }
  }

  if (p.length > 4) {
    const cleaned: Vertex[] = [];
    const len = p.length;
    for (let i = 0; i < len; i++) {
      const prev = p[(i - 1 + len) % len];
      const curr = p[i];
      const next = p[(i + 1) % len];

      const isCollinearX = Math.abs(prev.y - curr.y) < 1 && Math.abs(curr.y - next.y) < 1;
      const isCollinearY = Math.abs(prev.x - curr.x) < 1 && Math.abs(curr.x - next.x) < 1;

      if (!isCollinearX && !isCollinearY) {
        cleaned.push(curr);
      }
    }
    if (cleaned.length >= 4 && cleaned.length % 2 === 0) {
      return cleaned;
    }
  }

  return p;
}

/**
 * Calcula los días de construcción estimados para un bloque según las reglas de Bastiones D&D 5e.
 * - Pasillos (isCostFree = true): 0 días
 * - Apretado (4 celdas): 7 a 10 días
 * - Espacioso (16 celdas): 20 a 30 días
 * - Vasto (36 celdas): 30 a 45 días
 */
export function calculateBuildDays(block: {
  type?: string;
  space?: SpaceType;
  costEO?: number;
  isCostFree?: boolean;
}): number {
  if (block.isCostFree || block.type === 'CORRIDOR') return 0;

  const space = block.space || 'ESPACIOSO';
  const cost = block.costEO || 0;

  if (space === 'APRETADO') {
    return cost > 5000 ? 10 : 7;
  }
  if (space === 'ESPACIOSO') {
    return cost >= 13000 ? 30 : cost >= 9000 ? 25 : 20;
  }
  if (space === 'VASTO') {
    return cost >= 17000 ? 45 : cost >= 13000 ? 40 : 30;
  }

  return 20;
}

/**
 * Encuentra una posición libre en la cuadrícula adyacente al bastión
 * para evitar superposiciones al spawnear nuevas habitaciones o edificaciones.
 */
export function findNextAvailablePosition(
  existingBlocks: { points: Vertex[] }[],
  widthPx: number,
  heightPx: number
): Vertex {
  if (existingBlocks.length === 0) {
    return { x: 200, y: 160 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  existingBlocks.forEach((b) => {
    const bb = math.getBoundingBox(b.points);
    if (bb.minX < minX) minX = bb.minX;
    if (bb.maxX > maxX) maxX = bb.maxX;
    if (bb.minY < minY) minY = bb.minY;
    if (bb.maxY > maxY) maxY = bb.maxY;
  });

  const gap = CONFIG.gridSize; // 1 celda de separación (40px)

  // 1. Probar a la derecha
  const candidateRight: Vertex = {
    x: math.snap(maxX + gap),
    y: math.snap(minY),
  };

  const testRight: Vertex[] = [
    candidateRight,
    { x: candidateRight.x + widthPx, y: candidateRight.y },
    { x: candidateRight.x + widthPx, y: candidateRight.y + heightPx },
    { x: candidateRight.x, y: candidateRight.y + heightPx },
  ];

  if (!existingBlocks.some((b) => math.doBlocksOverlap(testRight, b.points))) {
    return candidateRight;
  }

  // 2. Probar abajo
  const candidateBottom: Vertex = {
    x: math.snap(minX),
    y: math.snap(maxY + gap),
  };

  return candidateBottom;
}

