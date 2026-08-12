use thiserror::Error;

/// Tipo de error centralizado de base de datos para un manejo de errores limpio en el backend.
/// Previene panics y garantiza que todos los errores de base de datos se propaguen correctamente.
#[derive(Debug, Error)]
pub enum DbError {
    #[error("Error en el pool de conexiones: {0}")]
    Pool(#[from] r2d2::Error),

    #[error("Error de SQLite: {0}")]
    Sqlite(#[from] rusqlite::Error),

    #[error("La conexión a la base de datos no ha sido inicializada")]
    NotInitialized,

    #[error("Error de migración: {0}")]
    Migration(String),

    #[error("Error de entrada/salida (IO): {0}")]
    Io(#[from] std::io::Error),
}

// Convierte DbError en String para los comandos de Tauri IPC.
// Los comandos IPC de Tauri requieren tipos de error serializables o convertibles a String.
impl From<DbError> for String {
    fn from(error: DbError) -> Self {
        error.to_string()
    }
}

pub type DbResult<T> = Result<T, DbError>;
