import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Vertex,
  SpecialBuildingBlock,
  MainConstructionBlock,
} from '../../types/blueprint';
import {
  CONFIG,
  math,
  checkBlocksProximity,
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
  onDeintegrateBuilding: (buildingId: string) => void;
  onExceedMainLimit?: () => void;
}

interface DragState {
  targetId: string;
  type: 'vertex' | 'body';
  vertexIndex?: number;
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
  onDeintegrateBuilding,
  onExceedMainLimit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  // Espacio total disponible para el núcleo (Base + Hijos + Expansiones)
  const childCells = mainBlock.integratedBuildings.reduce(
    (acc, b) => acc + math.calculateCellCount(b.points),
    0
  );
  const expansionCells = mainBlock.expansions.reduce((acc, exp) => acc + exp.cells, 0);
  const totalAvailableCells = mainBlock.baseCells + childCells + expansionCells;

  /** Obtiene las coordenadas del puntero ajustadas a la cuadrícula */
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  /** Dibuja la cuadrícula, el bloque principal y los bloques especiales */
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Dibujar la Cuadrícula Arquitectónica (5 ft = 40 px)
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

    /** Función auxiliar para dibujar un polígono arquitectónico */
    const renderPolygon = (
      points: Vertex[],
      fillColor: string,
      strokeColor: string,
      lineWidth: number,
      title: string,
      cellCountText: string,
      isSelected: boolean,
      isIntegratedChild = false
    ) => {
      if (points.length < 3) return;

      // Relleno y Contorno
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(isIntegratedChild ? [6, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      // Medidas de las paredes
      ctx.fillStyle = isSelected ? '#f59e0b' : CONFIG.colors.text;
      ctx.font = '11px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const mid = math.getEdgeMidpoint(p1, p2);
        const dist = math.distance(p1, p2);
        ctx.fillText(math.formatMeasure(dist), mid.x, mid.y - 8);
      }

      // Etiqueta del Bloque
      const center = math.getPolygonCenter(points);
      ctx.fillStyle = isSelected ? '#fbbf24' : '#e2e8f0';
      ctx.font = 'bold 13px "Cinzel", Georgia, serif';
      ctx.fillText(title, center.x, center.y - 8);

      ctx.fillStyle = isSelected ? '#fef08a' : '#94a3b8';
      ctx.font = '11px "Fira Code", monospace';
      ctx.fillText(cellCountText, center.x, center.y + 10);

      // Vértices manipulables
      if (isSelected) {
        points.forEach((v) => {
          ctx.beginPath();
          ctx.arc(v.x, v.y, CONFIG.cornerSize, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
    };

    // 2. Renderizar el Bloque Principal (Padre)
    const isMainSelected = selectedId === mainBlock.id;
    const mainCells = math.calculateCellCount(mainBlock.points);
    renderPolygon(
      mainBlock.points,
      isMainSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
      isMainSelected ? '#f59e0b' : '#d97706',
      isMainSelected ? 2.5 : 2,
      mainBlock.name,
      `${mainCells} / ${totalAvailableCells} cuadros`,
      isMainSelected
    );

    // 3. Renderizar Edificaciones Especiales Hijas (Anidadas en el Bloque Principal)
    mainBlock.integratedBuildings.forEach((child) => {
      const isSelected = selectedId === child.id;
      const cells = math.calculateCellCount(child.points);
      renderPolygon(
        child.points,
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
      renderPolygon(
        building.points,
        isSelected ? 'rgba(56, 189, 248, 0.20)' : 'rgba(56, 189, 248, 0.10)',
        isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.6)',
        isSelected ? 2 : 1.5,
        building.name,
        `${cells}/${building.maxCells} cuadros (Flotante)`,
        isSelected
      );
    });
  }, [mainBlock, independentBuildings, selectedId, totalAvailableCells]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  /** Inicio de interacción (click o arrastre) */
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    // A. Detectar clic en vértices del elemento seleccionado
    let activePoints: Vertex[] | null = null;
    let targetId: string | null = null;

    if (selectedId === mainBlock.id) {
      activePoints = mainBlock.points;
      targetId = mainBlock.id;
    } else {
      const child = mainBlock.integratedBuildings.find((b) => b.id === selectedId);
      if (child) {
        activePoints = child.points;
        targetId = child.id;
      } else {
        const indep = independentBuildings.find((b) => b.id === selectedId);
        if (indep) {
          activePoints = indep.points;
          targetId = indep.id;
        }
      }
    }

    if (activePoints && targetId) {
      for (let i = 0; i < activePoints.length; i++) {
        if (math.distance({ x, y }, activePoints[i]) <= CONFIG.cornerSize * 1.5) {
          setDrag({
            targetId,
            type: 'vertex',
            vertexIndex: i,
            startX: x,
            startY: y,
            startPoints: [...activePoints],
          });
          return;
        }
      }
    }

    // B. Detectar clic en el cuerpo de algún polígono
    // Prioridad 1: Edificios hijos integrados
    for (const child of mainBlock.integratedBuildings) {
      if (math.isPointInPolygon({ x, y }, child.points)) {
        onSelectElement(child.id);
        setDrag({
          targetId: child.id,
          type: 'body',
          startX: x,
          startY: y,
          startPoints: [...child.points],
        });
        return;
      }
    }

    // Prioridad 2: Edificaciones independientes
    for (const indep of independentBuildings) {
      if (math.isPointInPolygon({ x, y }, indep.points)) {
        onSelectElement(indep.id);
        setDrag({
          targetId: indep.id,
          type: 'body',
          startX: x,
          startY: y,
          startPoints: [...indep.points],
        });
        return;
      }
    }

    // Prioridad 3: Bloque principal (Guarda snapshot de hijos para movimiento conjunto)
    if (math.isPointInPolygon({ x, y }, mainBlock.points)) {
      onSelectElement(mainBlock.id);
      setDrag({
        targetId: mainBlock.id,
        type: 'body',
        startX: x,
        startY: y,
        startPoints: [...mainBlock.points],
        startChildrenPoints: mainBlock.integratedBuildings.map((c) => ({
          id: c.id,
          points: [...c.points],
        })),
      });
      return;
    }
  };

  /** Movimiento durante el arrastre con límite estricto de espacio */
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag) return;
    const { x, y } = getCanvasCoords(e);

    const deltaX = math.snap(x - drag.startX);
    const deltaY = math.snap(y - drag.startY);

    if (drag.type === 'vertex' && drag.vertexIndex !== undefined) {
      const newPoints = [...drag.startPoints];
      newPoints[drag.vertexIndex] = {
        x: math.snap(drag.startPoints[drag.vertexIndex].x + deltaX),
        y: math.snap(drag.startPoints[drag.vertexIndex].y + deltaY),
      };

      if (drag.targetId === mainBlock.id) {
        // Validar límite estricto: Núcleo <= totalAvailableCells
        const newCells = math.calculateCellCount(newPoints);
        if (newCells > totalAvailableCells) {
          if (onExceedMainLimit) onExceedMainLimit();
          return; // Impedir modificación
        }
        onUpdateMainPoints(newPoints, mainBlock.integratedBuildings);
      } else {
        const isIntegrated = mainBlock.integratedBuildings.some((b) => b.id === drag.targetId);
        onUpdateBuildingPoints(drag.targetId, isIntegrated, newPoints);
      }
    } else if (drag.type === 'body') {
      const newPoints = drag.startPoints.map((p) => ({
        x: p.x + deltaX,
        y: p.y + deltaY,
      }));

      if (drag.targetId === mainBlock.id) {
        // Desplazar simultáneamente al padre y a todos los hijos integrados
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

        onUpdateMainPoints(newPoints, updatedChildren);
      } else {
        const isIntegrated = mainBlock.integratedBuildings.some((b) => b.id === drag.targetId);
        onUpdateBuildingPoints(drag.targetId, isIntegrated, newPoints);
      }
    }
  };

  /** Fin del arrastre: simplificar polígonos y verificar anclajes */
  const handlePointerUp = () => {
    if (!drag) return;

    if (drag.targetId === mainBlock.id) {
      const simplified = simplifyPolygon(mainBlock.points);
      // Validar límite al soltar
      const cells = math.calculateCellCount(simplified);
      if (cells <= totalAvailableCells) {
        onUpdateMainPoints(simplified, mainBlock.integratedBuildings);
      }
    } else {
      const isIntegrated = mainBlock.integratedBuildings.some((b) => b.id === drag.targetId);
      const target = isIntegrated
        ? mainBlock.integratedBuildings.find((b) => b.id === drag.targetId)
        : independentBuildings.find((b) => b.id === drag.targetId);

      if (target) {
        const simplified = simplifyPolygon(target.points);
        onUpdateBuildingPoints(target.id, isIntegrated, simplified);

        // Si es independiente y se acerca al bloque principal, integrarlo como hijo
        if (!isIntegrated) {
          const isNear = checkBlocksProximity(target.points, mainBlock.points);
          if (isNear) {
            onIntegrateBuilding(target.id);
          }
        }
      }
    }

    setDrag(null);
  };

  return (
    <div className="relative w-full h-full bg-[#0b0e14] overflow-hidden">
      <canvas
        ref={canvasRef}
        width={2400}
        height={1800}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="cursor-crosshair block"
      />
    </div>
  );
};
