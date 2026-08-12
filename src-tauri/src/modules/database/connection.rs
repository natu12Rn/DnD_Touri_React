use std::path::Path;
use std::sync::OnceLock;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

use crate::modules::database::error::{DbError, DbResult};
use crate::modules::database::migrations::run_migrations;

/// Global Singleton instance of the Database Manager.
static DB_SINGLETON: OnceLock<DbManager> = OnceLock::new();

/// Database Manager holding the thread-safe connection pool.
/// Implements the Singleton pattern to prevent creating redundant connections.
#[derive(Clone)]
pub struct DbManager {
    pool: Pool<SqliteConnectionManager>,
}

impl DbManager {
    /// Initializes the database connection pool Singleton.
    /// If already initialized, returns a clone of the existing Singleton instance.
    pub fn init<P: AsRef<Path>>(db_path: P) -> DbResult<Self> {
        if let Some(existing) = DB_SINGLETON.get() {
            return Ok(existing.clone());
        }

        // Ensure parent directory exists
        if let Some(parent) = db_path.as_ref().parent() {
            std::fs::create_dir_all(parent)?;
        }

        let manager = SqliteConnectionManager::file(db_path);
        let pool = Pool::builder()
            .max_size(10) // Concurrency pool limit
            .build(manager)?;

        // Run migrations on the initial connection
        let conn = pool.get()?;
        run_migrations(&conn)?;

        let db_manager = DbManager { pool };

        // Store into global Singleton OnceLock
        let _ = DB_SINGLETON.set(db_manager.clone());

        Ok(db_manager)
    }

    /// Returns a reference to the global Database Singleton instance.
    /// Fails with `DbError::NotInitialized` if `init()` was not called first.
    pub fn global() -> DbResult<&'static Self> {
        DB_SINGLETON.get().ok_or(DbError::NotInitialized)
    }

    /// Retrieves a thread-safe pooled connection from the Singleton pool.
    pub fn get_connection(&self) -> DbResult<r2d2::PooledConnection<SqliteConnectionManager>> {
        let conn = self.pool.get()?;
        Ok(conn)
    }
}
