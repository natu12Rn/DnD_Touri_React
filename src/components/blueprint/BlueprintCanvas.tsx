import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Vertex,
  SpecialBuildingBlock,
  MainConstructionBlock,
} from '../../types/blueprint';
import {
  CONFIG,
  math,
  simplifyPolygon,
} from '../../utils/geometry';

interface BlueprintCanvasProps {
  mainBlock: MainConstructionBlock;
  independentBuildings: SpecialBuildingBlock[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onUpdateMainPoints: (newPoints: Vertex[], updatedIntegratedBuildings: SpecialBuildingBlock[]) => void;
  onUpdateBuildingPoints: (buildingId: string, isIntegrated: boolean, newPoints: Vertex[]) => void;
  onIntegrateBuilding: (buildingId: string) => void;
  onExceedMainLimit?: () => void;
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
  startChildrenPoints?: { id: string; points: Vertex[] }[];
}

export const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({
  mainBlock,
  independentBuildings,
  selectedId,
  onSelectElement,
  onUpdateMainPoints,
  onUpdateBuildingPoints,
  onIntegrateBuilding,
  onExceedMainLimit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Espacio total disponible para el núcleo (Base + Hijos + Expansiones)
  const childCells = mainBlock.integratedBuildings.reduce(
    (acc, b) => acc + math.calculateCellCount(b.points),
    0
  );
  const expansionCells = mainBlock.expansions.reduce((acc, exp) => acc + exp.cells, 0);
  const totalAvailableCells = mainBlock.baseCells + childCells + expansionCells;

  /** Obtiene las coordenadas del puntero respecto al canvas */
  const getMousePos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  /** Dibuja la cuadrícula de 5ft x 5ft, polígonos, controladores centrales y anclajes fantasma */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Cuadrícula Arquitectónica de 5 ft x 5 ft (40 px = 1 casilla)
    ctx.strokeStyle = CONFIG.colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += CONFIG.gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += CONFIG.gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    /** Función de renderizado para un bloque con controladores ortogonales y fantasma */
    const renderBlock = (
      points: Vertex[],
      id: string,
      fillColor: string,
      strokeColor: string,
      lineWidth: number,
      title: string,
      cellCountText: string,
      isSelected: boolean,
      isIntegratedChild = false
    ) => {
      const N = points.length;
      if (N < 3) return;

      // A. Relleno y Contorno del Polígono
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < N; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'miter';
      ctx.setLineDash(isIntegratedChild ? [6, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      // B. Etiquetas de Medida en Pies (5 ft por cuadro)
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

        ctx.fillStyle = isSelected ? '#fbbf24' : CONFIG.colors.text;
        if (isHorizontal) {
          ctx.fillText(math.formatMeasure(length), midX, midY - 14);
        } else {
          ctx.save();
          ctx.translate(midX - 16, midY);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(math.formatMeasure(length), 0, 0);
          ctx.restore();
        }

        // C. Controladores de Pared y Anclajes Fantasma para el elemento seleccionado
        if (isSelected && length >= CONFIG.gridSize * 2) {
          const isEdgeHover =
            hover.targetId === id && hover.type === 'edge' && hover.index === i;

          // Píldora Central (Mueve la pared completa en paralelo)
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

          // Anclajes Fantasmas a los lados (Para seccionar por mitades si la longitud lo permite)
          if (length >= CONFIG.gridSize * 4) {
            const q1X = p1.x + (p2.x - p1.x) * 0.25;
            const q1Y = p1.y + (p2.y - p1.y) * 0.25;
            const q2X = p1.x + (p2.x - p1.x) * 0.75;
            const q2Y = p1.y + (p2.y - p1.y) * 0.75;

            const isGh1Hover =
              hover.targetId === id &&
              hover.type === 'ghost' &&
              hover.index === i &&
              hover.subIndex === 0;
            const isGh2Hover =
              hover.targetId === id &&
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

      // D. Título y Contador de Cuadros en el Centro
      const center = math.getPolygonCenter(points);
      ctx.fillStyle = isSelected ? '#fbbf24' : '#e2e8f0';
      ctx.font = 'bold 13px "Cinzel", Georgia, serif';
      ctx.fillText(title, center.x, center.y - 8);

      ctx.fillStyle = isSelected ? '#fef08a' : '#94a3b8';
      ctx.font = '11px "Fira Code", monospace';
      ctx.fillText(cellCountText, center.x, center.y + 10);

      // E. Esquinas Manipulables Ortogonales (Manijas cuadradas con paridad a 90 grados)
      if (isSelected) {
        for (let i = 0; i < N; i++) {
          const p = points[i];
          const isCornerHover =
            hover.targetId === id && hover.type === 'corner' && hover.index === i;
          const size = isCornerHover ? CONFIG.cornerSize + 4 : CONFIG.cornerSize;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
          ctx.strokeStyle = isCornerHover ? '#fbbf24' : '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
        }
      }
    };

    // 2. Renderizar Núcleo del Bastión (Bloque Principal)
    const isMainSelected = selectedId === mainBlock.id;
    const mainCells = math.calculateCellCount(mainBlock.points);
    renderBlock(
      mainBlock.points,
      mainBlock.id,
      isMainSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
      isMainSelected ? '#f59e0b' : '#d97706',
      isMainSelected ? 2.5 : 2,
      mainBlock.name,
      `${mainCells} / ${totalAvailableCells} cuadros`,
      isMainSelected
    );

    // 3. Renderizar Edificios Hijos Integrados
    mainBlock.integratedBuildings.forEach((child) => {
      const isSelected = selectedId === child.id;
      const cells = math.calculateCellCount(child.points);
      renderBlock(
        child.points,
        child.id,
        isSelected ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.14)',
        isSelected ? '#10b981' : 'rgba(16, 185, 129, 0.7)',
        isSelected ? 2 : 1.5,
        `[Hijo] ${child.name}`,
        `${cells}/${child.maxCells} cuadros`,
        isSelected,
        true
      );
    });

    // 4. Renderizar Edificaciones Especiales Independientes (Flotantes)
    independentBuildings.forEach((building) => {
      const isSelected = selectedId === building.id;
      const cells = math.calculateCellCount(building.points);
      renderBlock(
        building.points,
        building.id,
        isSelected ? 'rgba(56, 189, 248, 0.20)' : 'rgba(56, 189, 248, 0.10)',
        isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.6)',
        isSelected ? 2 : 1.5,
        building.name,
        `${cells}/${building.maxCells} cuadros (Flotante)`,
        isSelected
      );
    });
  }, [mainBlock, independentBuildings, selectedId, totalAvailableCells, hover]);

  useEffect(() => {
    draw();
  }, [draw]);

  /** Actualiza el estado de hover para esquinas, anclajes de pared, anclajes fantasma o cuerpo */
  const updateHoverState = (pos: Vertex) => {
    if (drag.active) return;

    let targetPoints: Vertex[] | null = null;
    let targetId: string | null = null;

    if (selectedId === mainBlock.id) {
      targetPoints = mainBlock.points;
      targetId = mainBlock.id;
    } else {
      const child = mainBlock.integratedBuildings.find((b) => b.id === selectedId);
      if (child) {
        targetPoints = child.points;
        targetId = child.id;
      } else {
        const indep = independentBuildings.find((b) => b.id === selectedId);
        if (indep) {
          targetPoints = indep.points;
          targetId = indep.id;
        }
      }
    }

    let newHover: HoverState = { targetId: null, type: null, index: -1, subIndex: -1 };
    let cursor = 'default';

    if (targetPoints && targetId) {
      const N = targetPoints.length;

      // 1. Hover en Esquinas
      for (let i = 0; i < N; i++) {
        if (math.distance(pos, targetPoints[i]) < 15) {
          newHover = { targetId, type: 'corner', index: i, subIndex: -1 };
          cursor = 'move';
          break;
        }
      }

      // 2. Hover en Anclajes Fantasmas y Centrales
      if (newHover.type === null) {
        for (let i = 0; i < N; i++) {
          const p1 = targetPoints[i];
          const p2 = targetPoints[(i + 1) % N];
          const isHorizontal = Math.abs(p1.y - p2.y) < 1;
          const length = isHorizontal ? Math.abs(p2.x - p1.x) : Math.abs(p2.y - p1.y);

          // Anclajes Fantasmas
          if (length >= CONFIG.gridSize * 4) {
            const q1X = p1.x + (p2.x - p1.x) * 0.25;
            const q1Y = p1.y + (p2.y - p1.y) * 0.25;
            if (math.distance(pos, { x: q1X, y: q1Y }) < 14) {
              newHover = { targetId, type: 'ghost', index: i, subIndex: 0 };
              cursor = isHorizontal ? 'row-resize' : 'col-resize';
              break;
            }

            const q2X = p1.x + (p2.x - p1.x) * 0.75;
            const q2Y = p1.y + (p2.y - p1.y) * 0.75;
            if (math.distance(pos, { x: q2X, y: q2Y }) < 14) {
              newHover = { targetId, type: 'ghost', index: i, subIndex: 1 };
              cursor = isHorizontal ? 'row-resize' : 'col-resize';
              break;
            }
          }

          // Píldora Central de Pared
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          if (math.distance(pos, { x: midX, y: midY }) < 18) {
            newHover = { targetId, type: 'edge', index: i, subIndex: -1 };
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

    // 1. Si se hace clic en un anclaje fantasma (Inyección dinámica de mitades y seccionamiento)
    if (hover.type === 'ghost' && hover.targetId && hover.index !== -1) {
      let pts: Vertex[] = [];
      let isMain = false;
      let isIntegrated = false;

      if (hover.targetId === mainBlock.id) {
        pts = mainBlock.points.map((p) => ({ ...p }));
        isMain = true;
      } else {
        const child = mainBlock.integratedBuildings.find((b) => b.id === hover.targetId);
        if (child) {
          pts = child.points.map((p) => ({ ...p }));
          isIntegrated = true;
        } else {
          const indep = independentBuildings.find((b) => b.id === hover.targetId);
          if (indep) pts = indep.points.map((p) => ({ ...p }));
        }
      }

      if (pts.length >= 4) {
        const i = hover.index;
        const N = pts.length;
        const A = pts[i];
        const B = pts[(i + 1) % N];

        // Punto de división exactamente a la mitad ajustado a la cuadrícula de 5ft (40px)
        const splitX = math.snap((A.x + B.x) / 2);
        const splitY = math.snap((A.y + B.y) / 2);

        // Inyectar dos vértices superpuestos en el centro para dividir la pared
        const newPts: Vertex[] = [
          { x: splitX, y: splitY },
          { x: splitX, y: splitY },
        ];

        pts.splice(i + 1, 0, ...newPts);

        // SubIndex 0 mueve segmento i, SubIndex 1 mueve nuevo segmento i + 2
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

        if (isMain) {
          onUpdateMainPoints(pts, mainBlock.integratedBuildings);
        } else if (hover.targetId) {
          onUpdateBuildingPoints(hover.targetId, isIntegrated, pts);
        }
        return;
      }
    }

    // 2. Clic en Esquina o Pared Central
    if ((hover.type === 'corner' || hover.type === 'edge') && hover.targetId) {
      let pts: Vertex[] = [];
      if (hover.targetId === mainBlock.id) {
        pts = mainBlock.points.map((p) => ({ ...p }));
      } else {
        const child = mainBlock.integratedBuildings.find((b) => b.id === hover.targetId);
        if (child) pts = child.points.map((p) => ({ ...p }));
        else {
          const indep = independentBuildings.find((b) => b.id === hover.targetId);
          if (indep) pts = indep.points.map((p) => ({ ...p }));
        }
      }

      setDrag({
        active: true,
        targetId: hover.targetId,
        type: hover.type,
        index: hover.index,
        startX: pos.x,
        startY: pos.y,
        startPoints: pts,
      });
      return;
    }

    // 3. Clic en el Cuerpo del Bloque para moverlo completo
    for (const child of mainBlock.integratedBuildings) {
      if (math.isPointInPolygon(pos, child.points)) {
        onSelectElement(child.id);
        setDrag({
          active: true,
          targetId: child.id,
          type: 'body',
          index: -1,
          startX: pos.x,
          startY: pos.y,
          startPoints: child.points.map((p) => ({ ...p })),
        });
        return;
      }
    }

    for (const indep of independentBuildings) {
      if (math.isPointInPolygon(pos, indep.points)) {
        onSelectElement(indep.id);
        setDrag({
          active: true,
          targetId: indep.id,
          type: 'body',
          index: -1,
          startX: pos.x,
          startY: pos.y,
          startPoints: indep.points.map((p) => ({ ...p })),
        });
        return;
      }
    }

    if (math.isPointInPolygon(pos, mainBlock.points)) {
      onSelectElement(mainBlock.id);
      setDrag({
        active: true,
        targetId: mainBlock.id,
        type: 'body',
        index: -1,
        startX: pos.x,
        startY: pos.y,
        startPoints: mainBlock.points.map((p) => ({ ...p })),
        startChildrenPoints: mainBlock.integratedBuildings.map((c) => ({
          id: c.id,
          points: c.points.map((p) => ({ ...p })),
        })),
      });
      return;
    }
  };

  /** Movimiento durante el arrastre (Pointer Move) con snap estricto a 5ft x 5ft (40px) */
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (!drag.active || !drag.targetId) {
      updateHoverState(pos);
      return;
    }

    const pts = drag.startPoints.map((p) => ({ ...p }));
    const N = pts.length;
    const isMain = drag.targetId === mainBlock.id;
    const isIntegrated = mainBlock.integratedBuildings.some((b) => b.id === drag.targetId);

    if (drag.type === 'corner' && drag.index !== -1) {
      // Modificación Ortogonal de Esquinas a 90 grados
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

      if (isMain) {
        const newCells = math.calculateCellCount(pts);
        if (newCells > totalAvailableCells) {
          if (onExceedMainLimit) onExceedMainLimit();
          return;
        }
        onUpdateMainPoints(pts, mainBlock.integratedBuildings);
      } else {
        onUpdateBuildingPoints(drag.targetId, isIntegrated, pts);
      }
    } else if (drag.type === 'edge' && drag.index !== -1) {
      // Desplazamiento de Pared Completa Paralela en Cuadros de 5ft
      if (drag.index % 2 === 0) {
        const y = math.snap(pos.y);
        pts[drag.index].y = y;
        pts[(drag.index + 1) % N].y = y;
      } else {
        const x = math.snap(pos.x);
        pts[drag.index].x = x;
        pts[(drag.index + 1) % N].x = x;
      }

      if (isMain) {
        const newCells = math.calculateCellCount(pts);
        if (newCells > totalAvailableCells) {
          if (onExceedMainLimit) onExceedMainLimit();
          return;
        }
        onUpdateMainPoints(pts, mainBlock.integratedBuildings);
      } else {
        onUpdateBuildingPoints(drag.targetId, isIntegrated, pts);
      }
    } else if (drag.type === 'body') {
      // Traslación del Bloque Completo en Cuadros de 5ft x 5ft
      const deltaX = math.snap(pos.x - drag.startX);
      const deltaY = math.snap(pos.y - drag.startY);

      const movedPoints = drag.startPoints.map((p) => ({
        x: p.x + deltaX,
        y: p.y + deltaY,
      }));

      if (isMain) {
        const updatedChildren = (drag.startChildrenPoints || []).map((cp) => {
          const originalChild = mainBlock.integratedBuildings.find((c) => c.id === cp.id);
          return {
            ...originalChild!,
            points: cp.points.map((p) => ({
              x: p.x + deltaX,
              y: p.y + deltaY,
            })),
          };
        });
        onUpdateMainPoints(movedPoints, updatedChildren);
      } else {
        onUpdateBuildingPoints(drag.targetId, isIntegrated, movedPoints);
      }
    }
  };

  /** Fin del arrastre (Pointer Up): Simplificación Colineal y Anclaje por Proximidad */
  const handlePointerUp = () => {
    if (drag.active && drag.targetId) {
      const isMain = drag.targetId === mainBlock.id;
      const isIntegrated = mainBlock.integratedBuildings.some((b) => b.id === drag.targetId);

      if (isMain) {
        const simplified = simplifyPolygon(mainBlock.points);
        const cells = math.calculateCellCount(simplified);
        if (cells <= totalAvailableCells) {
          onUpdateMainPoints(simplified, mainBlock.integratedBuildings);
        }
      } else {
        const target = isIntegrated
          ? mainBlock.integratedBuildings.find((b) => b.id === drag.targetId)
          : independentBuildings.find((b) => b.id === drag.targetId);

        if (target) {
          const simplified = simplifyPolygon(target.points);
          onUpdateBuildingPoints(target.id, isIntegrated, simplified);

          // Si es independiente y se acerca al perímetro, integrarlo como hijo
          if (!isIntegrated) {
            const isNear = math.checkBlocksProximity(target.points, mainBlock.points);
            if (isNear) {
              onIntegrateBuilding(target.id);
            }
          }
        }
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

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0b0e14] overflow-hidden">
      <canvas
        ref={canvasRef}
        width={2400}
        height={1800}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="block touch-none"
      />
    </div>
  );
};
