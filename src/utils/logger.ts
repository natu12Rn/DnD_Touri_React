import { invoke } from '@tauri-apps/api/core';

interface FrontendLogPayload {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  module?: string;
  message: string;
  stack?: string;
}

/**
 * Cliente de logging del Frontend conectado al backend de Rust.
 * Escribe las trazas de la interfaz en el archivo de log en %APPDATA%/logs/.
 */
export const logger = {
  debug: async (message: string, module = 'frontend') => {
    console.debug(`[${module}] ${message}`);
    try {
      await invoke('log_frontend_event', {
        payload: { level: 'DEBUG', module, message } as FrontendLogPayload,
      });
    } catch {
      // Ignorar fallos de logging silenciosamente
    }
  },

  info: async (message: string, module = 'frontend') => {
    console.info(`[${module}] ${message}`);
    try {
      await invoke('log_frontend_event', {
        payload: { level: 'INFO', module, message } as FrontendLogPayload,
      });
    } catch {
      // Ignorar fallos de logging silenciosamente
    }
  },

  warn: async (message: string, module = 'frontend') => {
    console.warn(`[${module}] ${message}`);
    try {
      await invoke('log_frontend_event', {
        payload: { level: 'WARN', module, message } as FrontendLogPayload,
      });
    } catch {
      // Ignorar fallos de logging silenciosamente
    }
  },

  error: async (message: string, module = 'frontend', stack?: string) => {
    console.error(`[${module}] ${message}`, stack);
    try {
      await invoke('log_frontend_event', {
        payload: { level: 'ERROR', module, message, stack } as FrontendLogPayload,
      });
    } catch {
      // Ignorar fallos de logging silenciosamente
    }
  },
};

/**
 * Inicializa los escuchadores globales de excepciones no controladas de React/Navegador
 * para guardarlas automáticamente en el archivo de log de disco.
 */
export function initGlobalErrorLogging() {
  window.addEventListener('error', (event) => {
    logger.error(
      `Excepción JavaScript no controlada: ${event.message} en ${event.filename}:${event.lineno}`,
      'frontend::window',
      event.error?.stack
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    logger.error(`Promesa rechazada no controlada: ${message}`, 'frontend::promise', stack);
  });
}
