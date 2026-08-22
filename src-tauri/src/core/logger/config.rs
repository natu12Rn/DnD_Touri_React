use std::path::PathBuf;

/// Niveles de severidad para el sistema de logging en disco y consola.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3,
}

impl LogLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            LogLevel::Debug => "DEBUG",
            LogLevel::Info => "INFO",
            LogLevel::Warn => "WARN",
            LogLevel::Error => "ERROR",
        }
    }

    pub fn from_str(level: &str) -> Self {
        match level.to_uppercase().as_str() {
            "DEBUG" => LogLevel::Debug,
            "WARN" | "WARNING" => LogLevel::Warn,
            "ERROR" => LogLevel::Error,
            _ => LogLevel::Info,
        }
    }
}

/// Configuración del gestor de logs en disco.
#[derive(Debug, Clone)]
pub struct LoggerConfig {
    /// Directorio base donde se almacenarán los archivos .log
    pub logs_dir: PathBuf,
    /// Nivel mínimo de severidad para registrar en disco
    pub min_level: LogLevel,
    /// Tamaño máximo por archivo de log antes de rotar (en bytes, default 5 MB)
    pub max_file_size_bytes: u64,
    /// Cantidad máxima de días de retención de archivos históricos de logs
    pub max_history_days: u32,
}

impl LoggerConfig {
    pub fn new(logs_dir: PathBuf) -> Self {
        Self {
            logs_dir,
            min_level: LogLevel::Info,
            max_file_size_bytes: 5 * 1024 * 1024, // 5 MB
            max_history_days: 7,                  // 7 días de retención
        }
    }
}
