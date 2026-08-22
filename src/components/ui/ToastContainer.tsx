import React from 'react';
import { createPortal } from 'react-dom';
import { ToastNotification } from '../../types/blueprint';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col items-end gap-2 max-w-sm w-auto pointer-events-none select-none">
      {toasts.map((toast) => {
        let borderClass = 'border-amber-500/40 bg-[#161922]/95 text-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.7)]';
        let Icon = Info;
        let iconClass = 'text-amber-400';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40 bg-[#0f1d17]/95 text-slate-100 shadow-[0_4px_25px_rgba(16,185,129,0.25)]';
          Icon = CheckCircle2;
          iconClass = 'text-emerald-400';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/40 bg-[#1f1114]/95 text-slate-100 shadow-[0_4px_25px_rgba(244,63,94,0.25)]';
          Icon = XCircle;
          iconClass = 'text-rose-400';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-[#1f170e]/95 text-slate-100 shadow-[0_4px_25px_rgba(245,158,11,0.25)]';
          Icon = AlertTriangle;
          iconClass = 'text-amber-400';
        } else {
          borderClass = 'border-sky-500/40 bg-[#0f1722]/95 text-slate-100 shadow-[0_4px_25px_rgba(56,189,248,0.25)]';
          Icon = Info;
          iconClass = 'text-sky-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-3 py-2 rounded-xl border backdrop-blur-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <Icon className={`shrink-0 ${iconClass}`} size={15} />

            <div className="flex-1 text-xs font-sans text-slate-200 leading-tight">
              {toast.title && (
                <span className="font-semibold text-slate-100 mr-1.5">{toast.title}:</span>
              )}
              <span>{toast.message}</span>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors shrink-0 ml-1"
              title="Cerrar"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
};
