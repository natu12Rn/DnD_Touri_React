import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Vertex, BastionBlock } from '../../types/blueprint';
import { CONFIG, math, simplifyPolygon } from '../../utils/geometry';
import { RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { CanvasZoomControls } from './CanvasZoomControls';

interface BlueprintCanvasProps {
  blocks: BastionBlock[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onUpdateBlockPoints: (blockId: string, newPoints: Vertex[]) => void;
  onDeleteBlock?: (id: string) => void;
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.15;

/** Calcula el punto medio del conjunto de bloques para centrar la cámara */
function getBastionCenter(currentBlocks: BastionBlock[]): Vertex {
  if (currentBlocks.length === 0) return { x: 280, y: 240 };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const b of currentBlocks) {
    for (const p of b.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }

  if (!isFinite(minX) || !isFinite(maxX)) return { x: 280, y: 240 };
  return {
    x: math.snap((minX + maxX) / 2),
    y: math.snap((minY + maxY) / 2),
  };
}

/** Rotación ortogonal de 90° fija desde el mismo punto de anclaje de la estructura (evitando desplazamientos en la grilla) */
export function rotateBlockPoints(points: Vertex[], angleDegrees: 90 | -90): Vertex[] {
  if (points.length < 3) return points;
  const bb = math.getBoundingBox(points);
  const x0 = math.snap(bb.minX);
  const y0 = math.snap(bb.minY);

  const rad = (angleDegrees * Math.PI) / 180;
  const cos = Math.round(Math.cos(rad));
  const sin = Math.round(Math.sin(rad));

  // 1. Rotación respecto al anclaje original (x0, y0)
  const rotatedRaw = points.map((p) => {
    const dx = p.x - x0;
    const dy = p.y - y0;
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return { x: rx, y: ry };
  });

  // 2. Ajuste exacto para que la esquina superior izquierda se mantenga idéntica en (x0, y0)
  const rBb = math.getBoundingBox(rotatedRaw);
  const offsetX = x0 - rBb.minX;
  const offsetY = y0 - rBb.minY;

  return rotatedRaw.map((p) => ({
    x: math.snap(p.x + offsetX),
    y: math.snap(p.y + offsetY),
  }));
}

interface HoverState {
  targetId: string | null;
  type: 'corner' | 'edge' | 'ghost' | 'body' | null;
  index: number;
  subIndex: number;
}

interface DragState {
  active: boolean;
  targetId: string | null;
  type: 'corner' | 'edge' | 'body' | null;
  index: number;
  startX: number;
  startY: number;
  startPoints: Vertex[];
}

interface PanState {
  active: boolean;
  startX: number;
  startY: number;
  startCameraX: number;
  startCameraY: number;
}

interface RotationAnimState {
  blockId: string;
  startPoints: Vertex[];
  targetPoints: Vertex[];
  startTime: number;
  duration: number;
}

export const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({
  blocks,
  selectedId,
  onSelectElement,
  onUpdateBlockPoints,
  onDeleteBlock,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Estado del factor de escala de zoom
  const [zoom, setZoom] = useState<number>(1.0);

  // Posición de la cámara en el mundo que se ubica en el centro visible del viewport
  const [camera, setCamera] = useState<Vertex>(() => getBastionCenter(blocks));

  const [hover, setHover] = useState<HoverState>({
    targetId: null,
    type: null,
    index: -1,
    subIndex: -1,
  });

  const [drag, setDrag] = useState<DragState>({
    active: false,
    targetId: null,
    type: null,
    index: -1,
    startX: 0,
    startY: 0,
    startPoints: [],
  });

  const [pan, setPan] = useState<PanState>({
    active: false,
    startX: 0,
    startY: 0,
    startCameraX: 280,
    startCameraY: 240,
  });

  const [animatingRotation, setAnimatingRotation] = useState<RotationAnimState | null>(null);

  const selectedBlock = selectedId ? blocks.find((b) => b.id === selectedId) : null;
  const selectedBb = selectedBlock ? math.getBoundingBox(selectedBlock.points) : null;

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, Math.round((prev + ZOOM_STEP) * 100) / 100));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(MIN_ZOOM, Math.round((prev - ZOOM_STEP) * 100) / 100));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1.0);
    setCamera(getBastionCenter(blocks));
  }, [blocks]);

  const handleSetZoom = useCallback((newZoom: number) => {
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => {
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round((prev + delta) * 100) / 100));
    });
  };

  const handleRotateBlock = (angle: 90 | -90) => {
    if (!selectedBlock || animatingRotation) return;
    const targetPoints = rotateBlockPoints(selectedBlock.points, angle);
    setAnimatingRotation({
      blockId: selectedBlock.id,
      startPoints: selectedBlock.points.map((p) => ({ ...p })),
      targetPoints,
      startTime: performance.now(),
      duration: 250,
    });
  };

  /** Obtiene las coordenadas del puntero proyectadas al plano mundial respecto al centro del viewport */
  const getMousePos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const screenCenterX = canvas.width / 2;
    const screenCenterY = canvas.height / 2;

    const worldX = camera.x + (screenX - screenCenterX) / zoom;
    const worldY = camera.y + (screenY - screenCenterY) / zoom;
    return {
      x: worldX,
      y: worldY,
    };
  };

  /** Renderiza la grilla y los bloques del Bastión centrados en el viewport visible */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const screenCenterX = width / 2;
    const screenCenterY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Aplicar transformación óptica de zoom tomando como anclaje el centro exacto del viewport
    ctx.save();
    ctx.translate(screenCenterX, screenCenterY);
    ctx.scale(zoom, zoom);
    ctx.translate(-camera.x, -camera.y);

    // 1. Cuadrícula visible en el espacio del mundo
    const leftWorld = camera.x - screenCenterX / zoom;
    const rightWorld = camera.x + screenCenterX / zoom;
    const topWorld = camera.y - screenCenterY / zoom;
    const bottomWorld = camera.y + screenCenterY / zoom;

    const startX = Math.floor(leftWorld / CONFIG.gridSize) * CONFIG.gridSize;
    const endX = Math.ceil(rightWorld / CONFIG.gridSize) * CONFIG.gridSize;
    const startY = Math.floor(topWorld / CONFIG.gridSize) * CONFIG.gridSize;
    const endY = Math.ceil(bottomWorld / CONFIG.gridSize) * CONFIG.gridSize;

    // Cuadrícula Arquitectónica de 5 ft x 5 ft (40 px = 1 casilla)
    ctx.strokeStyle = CONFIG.colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += CONFIG.gridSize) {
      ctx.moveTo(x, topWorld);
      ctx.lineTo(x, bottomWorld);
    }
    for (let y = startY; y <= endY; y += CONFIG.gridSize) {
      ctx.moveTo(leftWorld, y);
      ctx.lineTo(rightWorld, y);
    }
    ctx.stroke();

    // 2. Renderizar Bloques Independientes
    blocks.forEach((block) => {
      let points = block.points;
      if (animatingRotation && animatingRotation.blockId === block.id) {
        const elapsed = performance.now() - animatingRotation.startTime;
        const progress = Math.min(1, elapsed / animatingRotation.duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        points = animatingRotation.startPoints.map((sp, idx) => {
          const tp = animatingRotation.targetPoints[idx] || sp;
          return {
            x: sp.x + (tp.x - sp.x) * ease,
            y: sp.y + (tp.y - sp.y) * ease,
          };
        });
      }
      const N = points.length;
      const isSelected = selectedId === block.id;
      const cellCount = math.calculateCellCount(points);
      const isSimple = math.isSimplePolygon(points);
      const isOverlapping = math.checkBlockOverlaps(block.id, points, blocks);

      // Validación Soft: Advertencia si excede casillas, se cruza o se superpone con otro bloque
      const isSizeMismatch =
        block.requiredCells !== undefined && cellCount !== block.requiredCells;
      const isInvalid = isSizeMismatch || !isSimple || isOverlapping;

      // Colores de relleno y contorno por tipo de bloque
      let fillColor = 'rgba(245, 158, 11, 0.14)';
      let strokeColor = '#f59e0b';

      if (block.type === 'CORRIDOR') {
        fillColor = isSelected ? 'rgba(100, 116, 139, 0.35)' : 'rgba(75, 85, 99, 0.25)';
        strokeColor = isSelected ? '#94a3b8' : '#64748b';
      } else if (block.type === 'SPECIAL_FACILITY') {
        fillColor = isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.14)';
        strokeColor = block.color || (isSelected ? '#38bdf8' : '#0284c7');
      } else {
        fillColor = isSelected ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.12)';
        strokeColor = isSelected ? '#fbbf24' : '#d97706';
      }

      // Si el bloque está en estado inválido (Soft Validation), resalta el relleno en rojo
      if (isInvalid) {
        fillColor = 'rgba(239, 68, 68, 0.18)';
        strokeColor = '#ef4444';
      }

      // A. Dibujar Relleno del Polígono
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < N; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      ctx.fillStyle = fillColor;
      ctx.fill();

      // Si el bloque es inválido o está seleccionado, dibujar su resaltado individual
      if (isInvalid || isSelected) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.8;
        ctx.setLineDash(isInvalid ? [6, 6] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 3. Renderizar Contorno Unificado (Muros Exteriores e Interiores Compartidos)
    const edgeCounts = math.computeGridEdgeCounts(blocks);
    edgeCounts.forEach((count, key) => {
      const isHorizontal = key.startsWith('H:');
      const coords = key.substring(2).split(',').map(Number);
      const x1 = coords[0];
      const y1 = coords[1];
      const x2 = isHorizontal ? x1 + CONFIG.gridSize : x1;
      const y2 = isHorizontal ? y1 : y1 + CONFIG.gridSize;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (count === 1) {
        // Muro Exterior Unificado (Grueso y dorado/dorado brillante)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'square';
        ctx.setLineDash([]);
        ctx.stroke();
      } else {
        // Muro Interior Compartido (Delgado y tenue)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 4. Renderizar Medidas, Etiquetas, Controles e Interacciones
    blocks.forEach((block) => {
      const points = block.points;
      const N = points.length;
      if (N < 3) return;

      const isSelected = selectedId === block.id;
      const cellCount = math.calculateCellCount(points);
      const isSimple = math.isSimplePolygon(points);
      const isOverlapping = math.checkBlockOverlaps(block.id, points, blocks);
      const isSizeMismatch =
        block.requiredCells !== undefined && cellCount !== block.requiredCells;
      const isInvalid = isSizeMismatch || !isSimple || isOverlapping;

      const bb = math.getBoundingBox(points);
      const blockWidth = bb.maxX - bb.minX;
      const blockHeight = bb.maxY - bb.minY;
      const isSmallRoom = Math.min(blockWidth, blockHeight) <= CONFIG.gridSize * 2;

      // B. Medidas de Paredes en Pies (5 ft por cuadro)
      ctx.font = '600 11px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < N; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % N];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const isHorizontal = Math.abs(p1.y - p2.y) < 1;
        const length = isHorizontal ? Math.abs(p2.x - p1.x) : Math.abs(p2.y - p1.y);

        // Clave de arista unitaria para verificar si es pared interior compartida
        const edgeKey = isHorizontal
          ? `H:${math.snap(Math.min(p1.x, p2.x))},${math.snap(p1.y)}`
          : `V:${math.snap(p1.x)},${math.snap(Math.min(p1.y, p2.y))}`;
        const isSharedInteriorWall = (edgeCounts.get(edgeKey) || 0) > 1;

        // Renderizar medida SOLO si la habitación está seleccionada O si es una pared exterior perimetral
        if (isSelected || !isSharedInteriorWall) {
          ctx.fillStyle = isSelected ? '#fbbf24' : CONFIG.colors.text;
          ctx.save();
          ctx.shadowColor = 'rgba(15, 17, 23, 0.9)';
          ctx.shadowBlur = 4;
          if (isHorizontal) {
            ctx.fillText(math.formatMeasure(length), midX, midY - 14);
          } else {
            ctx.translate(midX - 16, midY);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(math.formatMeasure(length), 0, 0);
          }
          ctx.restore();
        }

        // C. Controladores de Pared (Píldoras y Ghost Anchors) para el elemento seleccionado
        if (isSelected && length >= CONFIG.gridSize * 2) {
          const isEdgeHover =
            hover.targetId === block.id && hover.type === 'edge' && hover.index === i;

          // Píldora Central
          ctx.fillStyle = isEdgeHover ? '#f59e0b' : '#ffffff';
          ctx.strokeStyle = isEdgeHover ? '#d97706' : '#64748b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (isHorizontal) {
            ctx.roundRect(midX - 15, midY - 6, 30, 12, 6);
          } else {
            ctx.roundRect(midX - 6, midY - 15, 12, 30, 6);
          }
          ctx.fill();
          ctx.stroke();

          // Anclajes Fantasma (Solo si el tramo mide al menos 4 casillas / 160px)
          if (length >= CONFIG.gridSize * 4) {
            const q1X = p1.x + (p2.x - p1.x) * 0.25;
            const q1Y = p1.y + (p2.y - p1.y) * 0.25;
            const q2X = p1.x + (p2.x - p1.x) * 0.75;
            const q2Y = p1.y + (p2.y - p1.y) * 0.75;

            const isGh1Hover =
              hover.targetId === block.id &&
              hover.type === 'ghost' &&
              hover.index === i &&
              hover.subIndex === 0;
            const isGh2Hover =
              hover.targetId === block.id &&
              hover.type === 'ghost' &&
              hover.index === i &&
              hover.subIndex === 1;

            [
              { x: q1X, y: q1Y, h: isGh1Hover },
              { x: q2X, y: q2Y, h: isGh2Hover },
            ].forEach((gh) => {
              ctx.fillStyle = gh.h ? '#10b981' : 'rgba(16, 185, 129, 0.4)';
              ctx.strokeStyle = gh.h ? '#ffffff' : 'transparent';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              if (isHorizontal) {
                ctx.roundRect(gh.x - 12, gh.y - 5, 24, 10, 5);
              } else {
                ctx.roundRect(gh.x - 5, gh.y - 12, 10, 24, 5);
              }
              ctx.fill();
              if (gh.h) ctx.stroke();
            });
          }
        }
      }

      // D. Etiqueta Interior Acotada y Conteo de Casillas (Diseño Original Elegante)
      const center = math.getVisualInteriorCenter(points);
      const isVerySmall = Math.min(blockWidth, blockHeight) <= CONFIG.gridSize;
      const maxTextWidth = Math.max(28, blockWidth - 10);

      let displayName = block.name;
      if (isSmallRoom && displayName.length > 12) {
        displayName = displayName.replace('Habitación', 'Hab.').replace('Laboratorio', 'Lab.');
      }

      const statusIcon = !isSimple
        ? ' ⚠️'
        : isOverlapping
          ? ' ⚠️'
          : isSizeMismatch
            ? ' ⚠️'
            : '';

      const fullTitle = `${displayName}${statusIcon}`;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 17, 23, 0.95)';
      ctx.shadowBlur = 6;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isVerySmall) {
        // Bloque muy estrecho (ej. pasillo de 1 casilla)
        ctx.fillStyle = isInvalid ? '#fca5a5' : isSelected ? '#fbbf24' : '#e2e8f0';
        ctx.font = 'bold 9px "Cinzel", Georgia, serif';
        ctx.fillText(fullTitle, center.x, center.y, maxTextWidth);
      } else if (isSmallRoom) {
        // Habitación pequeña (<= 2x2 celdas / 10x10 ft)
        ctx.fillStyle = isInvalid ? '#fca5a5' : isSelected ? '#fbbf24' : '#e2e8f0';
        ctx.font = 'bold 10px "Cinzel", Georgia, serif';
        ctx.fillText(fullTitle, center.x, center.y - 6, maxTextWidth);

        ctx.fillStyle = isInvalid ? '#f87171' : isSelected ? '#fef08a' : '#94a3b8';
        ctx.font = '9px "Fira Code", monospace';
        const reqText = block.isCostFree
          ? `${cellCount} c.`
          : block.requiredCells
            ? `${cellCount}/${block.requiredCells} c.`
            : `${cellCount} c.`;
        ctx.fillText(reqText, center.x, center.y + 7, maxTextWidth);
      } else {
        // Habitación normal o grande (> 2x2 celdas)
        ctx.fillStyle = isInvalid ? '#fca5a5' : isSelected ? '#fbbf24' : '#e2e8f0';
        ctx.font = 'bold 12px "Cinzel", Georgia, serif';
        ctx.fillText(fullTitle, center.x, center.y - 8, maxTextWidth);

        ctx.fillStyle = isInvalid ? '#f87171' : isSelected ? '#fef08a' : '#94a3b8';
        ctx.font = '10px "Fira Code", monospace';
        const reqText = block.isCostFree
          ? `${cellCount} celdas (Costo 0)`
          : block.requiredCells
            ? `${cellCount}/${block.requiredCells} celdas`
            : `${cellCount} celdas`;
        ctx.fillText(reqText, center.x, center.y + 10, maxTextWidth);
      }
      ctx.restore();



      // E. Esquinas Manipulables Ortogonales (Manijas cuadradas)
      if (isSelected) {
        for (let i = 0; i < N; i++) {
          const p = points[i];
          const isCornerHover =
            hover.targetId === block.id && hover.type === 'corner' && hover.index === i;
          const size = isCornerHover ? CONFIG.cornerSize + 4 : CONFIG.cornerSize;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
          ctx.strokeStyle = isCornerHover ? '#fbbf24' : '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
        }
      }
    });

    // Restaurar transformación óptica de zoom
    ctx.restore();
  }, [blocks, selectedId, hover, animatingRotation, zoom, camera]);

  // Manejo de redimensionado automático del contenedor del lienzo
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
        draw();
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [draw]);

  useEffect(() => {
    draw();

    if (!animatingRotation) return;

    const animate = () => {
      draw();
      const elapsed = performance.now() - animatingRotation.startTime;
      if (elapsed < animatingRotation.duration) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        onUpdateBlockPoints(animatingRotation.blockId, animatingRotation.targetPoints);
        setAnimatingRotation(null);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw, animatingRotation, onUpdateBlockPoints]);

  /** Actualiza el estado de hover para esquinas, anclajes de pared, anclajes fantasma o cuerpo */
  const updateHoverState = (pos: Vertex) => {
    if (drag.active || pan.active) return;

    const selectedBlock = blocks.find((b) => b.id === selectedId);
    let newHover: HoverState = { targetId: null, type: null, index: -1, subIndex: -1 };
    let cursor = 'default';

    if (selectedBlock) {
      const points = selectedBlock.points;
      const N = points.length;
      const id = selectedBlock.id;

      // 1. Hover en Esquinas
      for (let i = 0; i < N; i++) {
        if (math.distance(pos, points[i]) < 15) {
          newHover = { targetId: id, type: 'corner', index: i, subIndex: -1 };
          cursor = 'move';
          break;
        }
      }

      // 2. Hover en Anclajes Fantasmas y Píldoras Centrales
      if (newHover.type === null) {
        for (let i = 0; i < N; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % N];
          const isHorizontal = Math.abs(p1.y - p2.y) < 1;
          const length = isHorizontal ? Math.abs(p2.x - p1.x) : Math.abs(p2.y - p1.y);

          // Anclajes Fantasmas
          if (length >= CONFIG.gridSize * 4) {
            const q1X = p1.x + (p2.x - p1.x) * 0.25;
            const q1Y = p1.y + (p2.y - p1.y) * 0.25;
            if (math.distance(pos, { x: q1X, y: q1Y }) < 14) {
              newHover = { targetId: id, type: 'ghost', index: i, subIndex: 0 };
              cursor = isHorizontal ? 'row-resize' : 'col-resize';
              break;
            }

            const q2X = p1.x + (p2.x - p1.x) * 0.75;
            const q2Y = p1.y + (p2.y - p1.y) * 0.75;
            if (math.distance(pos, { x: q2X, y: q2Y }) < 14) {
              newHover = { targetId: id, type: 'ghost', index: i, subIndex: 1 };
              cursor = isHorizontal ? 'row-resize' : 'col-resize';
              break;
            }
          }

          // Píldora Central de Pared
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          if (math.distance(pos, { x: midX, y: midY }) < 18) {
            newHover = { targetId: id, type: 'edge', index: i, subIndex: -1 };
            cursor = isHorizontal ? 'row-resize' : 'col-resize';
            break;
          }
        }
      }
    }

    if (
      hover.type !== newHover.type ||
      hover.index !== newHover.index ||
      hover.subIndex !== newHover.subIndex ||
      hover.targetId !== newHover.targetId
    ) {
      setHover(newHover);
      if (canvasRef.current) canvasRef.current.style.cursor = cursor;
    }
  };

  /** Inicio de interacción (Pointer Down) */
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    // 1. Clic en Anclaje Fantasma (Inyección dinámica de mitades)
    if (hover.type === 'ghost' && hover.targetId && hover.index !== -1) {
      const targetBlock = blocks.find((b) => b.id === hover.targetId);
      if (targetBlock && targetBlock.points.length >= 4) {
        const pts = targetBlock.points.map((p) => ({ ...p }));
        const i = hover.index;
        const N = pts.length;
        const A = pts[i];
        const B = pts[(i + 1) % N];

        const splitX = math.snap((A.x + B.x) / 2);
        const splitY = math.snap((A.y + B.y) / 2);

        const newPts: Vertex[] = [
          { x: splitX, y: splitY },
          { x: splitX, y: splitY },
        ];

        pts.splice(i + 1, 0, ...newPts);
        const targetEdgeIndex = hover.subIndex === 0 ? i : i + 2;

        setDrag({
          active: true,
          targetId: hover.targetId,
          type: 'edge',
          index: targetEdgeIndex,
          startX: pos.x,
          startY: pos.y,
          startPoints: pts,
        });

        onUpdateBlockPoints(hover.targetId, pts);
        return;
      }
    }

    // 2. Clic en Esquina o Pared Central
    if ((hover.type === 'corner' || hover.type === 'edge') && hover.targetId) {
      const targetBlock = blocks.find((b) => b.id === hover.targetId);
      if (targetBlock) {
        setDrag({
          active: true,
          targetId: hover.targetId,
          type: hover.type,
          index: hover.index,
          startX: pos.x,
          startY: pos.y,
          startPoints: targetBlock.points.map((p) => ({ ...p })),
        });
        return;
      }
    }

    // 3. Clic en el Cuerpo del Bloque para seleccionar/mover
    for (const block of blocks) {
      if (math.isPointInPolygon(pos, block.points)) {
        onSelectElement(block.id);
        setDrag({
          active: true,
          targetId: block.id,
          type: 'body',
          index: -1,
          startX: pos.x,
          startY: pos.y,
          startPoints: block.points.map((p) => ({ ...p })),
        });
        return;
      }
    }

    // 4. Clic en la cuadrícula vacía: Deseleccionar y activar desplazamiento de cámara (Pan)
    onSelectElement('');
    setPan({
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startCameraX: camera.x,
      startCameraY: camera.y,
    });
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  };

  /** Movimiento durante el arrastre (Pointer Move) con snap a 5ft x 5ft (40px) */
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pan.active) {
      const deltaScreenX = e.clientX - pan.startX;
      const deltaScreenY = e.clientY - pan.startY;
      setCamera({
        x: pan.startCameraX - deltaScreenX / zoom,
        y: pan.startCameraY - deltaScreenY / zoom,
      });
      return;
    }

    const pos = getMousePos(e);

    if (!drag.active || !drag.targetId) {
      updateHoverState(pos);
      return;
    }

    const pts = drag.startPoints.map((p) => ({ ...p }));
    const N = pts.length;

    if (drag.type === 'corner' && drag.index !== -1) {
      const x = math.snap(pos.x);
      const y = math.snap(pos.y);

      pts[drag.index].x = x;
      pts[drag.index].y = y;

      if (drag.index % 2 === 0) {
        pts[(drag.index + 1) % N].y = y;
        pts[(drag.index - 1 + N) % N].x = x;
      } else {
        pts[(drag.index + 1) % N].x = x;
        pts[(drag.index - 1 + N) % N].y = y;
      }

      onUpdateBlockPoints(drag.targetId, pts);
    } else if (drag.type === 'edge' && drag.index !== -1) {
      if (drag.index % 2 === 0) {
        let y = math.snap(pos.y);
        pts[drag.index].y = y;
        pts[(drag.index + 1) % N].y = y;

        // Auto-Acople a Paredes Vecinas: Si penetra a otro bloque, limita exactamente a la cara exterior vecina
        if (math.checkBlockOverlaps(drag.targetId, pts, blocks)) {
          for (const other of blocks) {
            if (other.id === drag.targetId) continue;
            const bb = math.getBoundingBox(other.points);

            const testY1 = bb.minY;
            const testPts1 = pts.map((p) => ({ ...p }));
            testPts1[drag.index].y = testY1;
            testPts1[(drag.index + 1) % N].y = testY1;
            if (
              !math.checkBlockOverlaps(drag.targetId, testPts1, blocks) &&
              math.isSimplePolygon(testPts1)
            ) {
              pts[drag.index].y = testY1;
              pts[(drag.index + 1) % N].y = testY1;
              break;
            }

            const testY2 = bb.maxY;
            const testPts2 = pts.map((p) => ({ ...p }));
            testPts2[drag.index].y = testY2;
            testPts2[(drag.index + 1) % N].y = testY2;
            if (
              !math.checkBlockOverlaps(drag.targetId, testPts2, blocks) &&
              math.isSimplePolygon(testPts2)
            ) {
              pts[drag.index].y = testY2;
              pts[(drag.index + 1) % N].y = testY2;
              break;
            }
          }
        }
      } else {
        let x = math.snap(pos.x);
        pts[drag.index].x = x;
        pts[(drag.index + 1) % N].x = x;

        // Auto-Acople a Paredes Vecinas: Si penetra a otro bloque, limita exactamente a la cara exterior vecina
        if (math.checkBlockOverlaps(drag.targetId, pts, blocks)) {
          for (const other of blocks) {
            if (other.id === drag.targetId) continue;
            const bb = math.getBoundingBox(other.points);

            const testX1 = bb.minX;
            const testPts1 = pts.map((p) => ({ ...p }));
            testPts1[drag.index].x = testX1;
            testPts1[(drag.index + 1) % N].x = testX1;
            if (
              !math.checkBlockOverlaps(drag.targetId, testPts1, blocks) &&
              math.isSimplePolygon(testPts1)
            ) {
              pts[drag.index].x = testX1;
              pts[(drag.index + 1) % N].x = testX1;
              break;
            }

            const testX2 = bb.maxX;
            const testPts2 = pts.map((p) => ({ ...p }));
            testPts2[drag.index].x = testX2;
            testPts2[(drag.index + 1) % N].x = testX2;
            if (
              !math.checkBlockOverlaps(drag.targetId, testPts2, blocks) &&
              math.isSimplePolygon(testPts2)
            ) {
              pts[drag.index].x = testX2;
              pts[(drag.index + 1) % N].x = testX2;
              break;
            }
          }
        }
      }

      onUpdateBlockPoints(drag.targetId, pts);
    } else if (drag.type === 'body') {
      const deltaX = math.snap(pos.x - drag.startX);
      const deltaY = math.snap(pos.y - drag.startY);

      const movedPoints = drag.startPoints.map((p) => ({
        x: p.x + deltaX,
        y: p.y + deltaY,
      }));

      onUpdateBlockPoints(drag.targetId, movedPoints);
    }
  };

  /** Fin del arrastre (Pointer Up): Simplificación de vértices colineales */
  const handlePointerUp = () => {
    if (pan.active) {
      setPan({
        active: false,
        startX: 0,
        startY: 0,
        startCameraX: 0,
        startCameraY: 0,
      });
    }

    if (drag.active && drag.targetId) {
      const target = blocks.find((b) => b.id === drag.targetId);
      if (target) {
        const simplified = simplifyPolygon(target.points);
        onUpdateBlockPoints(target.id, simplified);
      }
    }

    setDrag({
      active: false,
      targetId: null,
      type: null,
      index: -1,
      startX: 0,
      startY: 0,
      startPoints: [],
    });

    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
  };

  const canvasWidth = canvasRef.current ? canvasRef.current.width : 1600;
  const canvasHeight = canvasRef.current ? canvasRef.current.height : 900;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0b0e14] overflow-hidden">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full block touch-none"
      />

      {/* Menú Flotante de Acciones Rápidas (Aparece SOLO cuando la estructura está estática) */}
      {selectedBlock && selectedBb && !drag.active && !pan.active && (
        <div
          style={{
            position: 'absolute',
            left: `${canvasWidth / 2 + ((selectedBb.minX + selectedBb.maxX) / 2 - camera.x) * zoom}px`,
            top: `${canvasHeight / 2 + (selectedBb.minY - 14 - camera.y) * zoom}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'auto',
          }}
          className="z-40 flex items-center gap-1 p-1 rounded-2xl bg-[#161922]/95 backdrop-blur-md border border-amber-500/40 shadow-[0_4px_25px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRotateBlock(-90);
            }}
            title="Rotar 90° a la izquierda (Antihorario)"
            className="p-1.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-all active:scale-95 flex items-center gap-1"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRotateBlock(90);
            }}
            title="Rotar 90° a la derecha (Horario)"
            className="p-1.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-all active:scale-95 flex items-center gap-1"
          >
            <RotateCw size={15} />
          </button>

          {onDeleteBlock && (
            <>
              <div className="w-px h-4 bg-white/10 my-auto mx-0.5" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(selectedBlock.id);
                }}
                title="Eliminar estructura seleccionada"
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all active:scale-95"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Ventana Flotante de Controles de Zoom en la Esquina Inferior Izquierda */}
      <CanvasZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onSetZoom={handleSetZoom}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      />
    </div>
  );
};
