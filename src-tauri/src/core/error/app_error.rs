use serde::Serialize;
use thiserror::Error;
use crate::core::database::DbError;
use crate::log_error;

/// Enum de errores centralizados fuertemente tipados para toda la aplicación.
/// Garantiza que todo fallo del backend sea serializable para la interfaz de React
/// y quede automáticamente persistido en el archivo de logs en disco.
#[derive(Debug, Error, Serialize)]
#[serde(tag = "error_type", content = "message")]
pub enum AppError {
    #[error("Error de base de datos: {0}")]
    Database(String),

    #[error("Error de validación: {0}")]
    Validation(String),

    #[error("Recurso no encontrado: {0}")]
    NotFound(String),

    #[error("Error de entrada/salida (IO): {0}")]
    Io(String),

    #[error("Error de serialización JSON: {0}")]
    Serialization(String),

    #[error("Error interno del sistema: {0}")]
    Internal(String),
}

impl AppError {
    /// Registra el error en el sistema de logs antes de ser retornado.
    pub fn log_and_return(self, module: &str) -> Self {
        log_error!(module, "Ocurrió un error: {}", self);
        self
    }
}

impl From<DbError> for AppError {
    fn from(err: DbError) -> Self {
        let error = AppError::Database(err.to_string());
        log_error!("core::database", "Fallo de base de datos: {}", error);
        error
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        let error = AppError::Io(err.to_string());
        log_error!("core::io", "Fallo de IO en disco: {}", error);
        error
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        let error = AppError::Serialization(err.to_string());
        log_error!("core::serialization", "Fallo de serialización JSON: {}", error);
        error
    }
}

impl From<AppError> for String {
    fn from(err: AppError) -> Self {
        err.to_string()
    }
}

pub type AppResult<T> = Result<T, AppError>;
