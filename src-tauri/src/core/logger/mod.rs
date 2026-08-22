pub mod config;
pub mod writer;

use std::path::PathBuf;
use std::sync::OnceLock;
use serde::Deserialize;
pub use config::{LogLevel, LoggerConfig};
pub use writer::LogWriter;

static LOGGER_INSTANCE: OnceLock<LogWriter> = OnceLock::new();

/// Gestor global del sistema de logs.
pub struct LoggerManager;

impl LoggerManager {
    /// Inicializa la instancia Singleton global de logging en la ruta indicada.
    pub fn init(logs_dir: PathBuf) -> Result<&'static LogWriter, String> {
        let config = LoggerConfig::new(logs_dir);
        let writer = LogWriter::new(config).map_err(|e| format!("Error al inicializar LogWriter: {}", e))?;

        let instance = LOGGER_INSTANCE.get_or_init(|| writer);
        instance.write_log(LogLevel::Info, "core::logger", "Sistema de logs inicializado correctamente");
        Ok(instance)
    }

    /// Retorna una referencia estática al Logger global.
    pub fn global() -> Option<&'static LogWriter> {
        LOGGER_INSTANCE.get()
    }

    /// Registra un mensaje en el log global con nivel y módulo especificados.
    pub fn log(level: LogLevel, target: &str, message: &str) {
        if let Some(logger) = Self::global() {
            logger.write_log(level, target, message);
        } else {
            eprintln!("[{}] [{}] {}", level.as_str(), target, message);
        }
    }
}

/// Macro para registrar mensajes de nivel INFO
#[macro_export]
macro_rules! log_info {
    ($target:expr, $($arg:tt)*) => {
        $crate::core::logger::LoggerManager::log(
            $crate::core::logger::LogLevel::Info,
            $target,
            &format!($($arg)*)
        )
    };
}

/// Macro para registrar mensajes de nivel WARN
#[macro_export]
macro_rules! log_warn {
    ($target:expr, $($arg:tt)*) => {
        $crate::core::logger::LoggerManager::log(
            $crate::core::logger::LogLevel::Warn,
            $target,
            &format!($($arg)*)
        )
    };
}

/// Macro para registrar mensajes de nivel ERROR
#[macro_export]
macro_rules! log_error {
    ($target:expr, $($arg:tt)*) => {
        $crate::core::logger::LoggerManager::log(
            $crate::core::logger::LogLevel::Error,
            $target,
            &format!($($arg)*)
        )
    };
}

/// Macro para registrar mensajes de nivel DEBUG
#[macro_export]
macro_rules! log_debug {
    ($target:expr, $($arg:tt)*) => {
        $crate::core::logger::LoggerManager::log(
            $crate::core::logger::LogLevel::Debug,
            $target,
            &format!($($arg)*)
        )
    };
}

/// Entrada para registrar eventos recibidos desde el Frontend (React)
#[derive(Debug, Deserialize)]
pub struct FrontendLogPayload {
    pub level: String,
    pub module: Option<String>,
    pub message: String,
    pub stack: Option<String>,
}

/// Comando IPC de Tauri para registrar logs emitidos desde la interfaz de React
#[tauri::command]
pub fn log_frontend_event(payload: FrontendLogPayload) -> Result<(), String> {
    let level = LogLevel::from_str(&payload.level);
    let target = payload.module.unwrap_or_else(|| "frontend::ui".to_string());
    let formatted_message = if let Some(stack) = payload.stack {
        format!("{} | Stack: {}", payload.message, stack)
    } else {
        payload.message
    };

    LoggerManager::log(level, &target, &formatted_message);
    Ok(())
}
