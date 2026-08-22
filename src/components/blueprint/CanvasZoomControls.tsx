import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ChevronUp } from 'lucide-react';

interface CanvasZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSetZoom: (newZoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
}

const ZOOM_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

/**
 * Ventana flotante de control de zoom óptico del lienzo Canvas.
 * Se ubica en la esquina inferior izquierda y permite controlar el nivel
 * de ampliación/reducción con respecto al centro de la cuadrícula.
 */
export const CanvasZoomControls: React.FC<CanvasZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSetZoom,
  minZoom = 0.3,
  maxZoom = 2.5,
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const zoomPercent = Math.round(zoom * 100);

  const canZoomIn = zoom < maxZoom - 0.01;
  const canZoomOut = zoom > minZoom + 0.01;

  return (
    <div
      className="absolute bottom-5 left-5 z-30 select-none flex flex-col items-start gap-1.5 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Menú emergente de valores predefinidos (Presets) */}
      {showPresets && (
        <div className="flex flex-col gap-1 p-2 rounded-2xl bg-[#161922]/95 backdrop-blur-xl border border-amber-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-2 duration-150 min-w-[120px]">
          <div className="px-2 py-1 text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider border-b border-white/10">
            Escala
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {ZOOM_PRESETS.map((preset) => {
              const isCurrent = Math.abs(zoom - preset) < 0.02;
              return (
                <button
                  key={preset}
                  onClick={() => {
                    onSetZoom(preset);
                    setShowPresets(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                  }`}
                >
                  {Math.round(preset * 100)}%
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de control flotante principal */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#161922]/90 backdrop-blur-xl border border-amber-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.7)] transition-all">
        {/* Botón Zoom Out (Reducir / Alejar) */}
        <button
          onClick={onZoomOut}
          disabled={!canZoomOut}
          title="Alejar cuadrícula (Zoom Out)"
          className="p-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 flex items-center justify-center"
        >
          <ZoomOut size={16} />
        </button>

        {/* Indicador interactivo de Porcentaje de Zoom */}
        <button
          onClick={() => setShowPresets((prev) => !prev)}
          title="Ver escalas predefinidas de zoom"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-amber-300 hover:bg-amber-500/10 transition-all font-mono text-xs font-bold"
        >
          <span>{zoomPercent}%</span>
          <ChevronUp
            size={13}
            className={`transition-transform duration-200 ${showPresets ? 'rotate-180 text-amber-400' : 'text-slate-400'}`}
          />
        </button>

        {/* Botón Zoom In (Aumentar / Acercar) */}
        <button
          onClick={onZoomIn}
          disabled={!canZoomIn}
          title="Acercar cuadrícula (Zoom In)"
          className="p-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 flex items-center justify-center"
        >
          <ZoomIn size={16} />
        </button>

        {/* Separador vertical */}
        <div className="w-px h-5 bg-white/10 mx-0.5" />

        {/* Botón Restablecer a 100% y centrar */}
        <button
          onClick={() => {
            onResetZoom();
            setShowPresets(false);
          }}
          title="Restablecer cuadrícula al 100%"
          className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all active:scale-95 flex items-center justify-center"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
};
