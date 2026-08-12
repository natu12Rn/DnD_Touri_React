use thiserror::Error;

/// Centralized database error type for clean backend error handling.
/// Prevents panics and ensures all database errors are cleanly propagated.
#[derive(Debug, Error)]
pub enum DbError {
    #[error("Database pool error: {0}")]
    Pool(#[from] r2d2::Error),

    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),

    #[error("Database connection not initialized")]
    NotInitialized,

    #[error("Migration error: {0}")]
    Migration(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

// Convert DbError into String for Tauri IPC commands.
// Tauri commands require serializable or String-convertible error types.
impl From<DbError> for String {
    fn from(error: DbError) -> Self {
        error.to_string()
    }
}

pub type DbResult<T> = Result<T, DbError>;
