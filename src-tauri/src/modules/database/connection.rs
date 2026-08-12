use std::path::Path;
use std::sync::OnceLock;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

use crate::modules::database::error::{DbError, DbResult};
use crate::modules::database::migrations::run_migrations;

/// Instancia estática global Singleton para el administrador de la base de datos.
static DB_SINGLETON: OnceLock<DbManager> = OnceLock::new();

/// Gestor de la base de datos SQLite que mantiene el pool de conexiones multihilo seguro.
/// Implementa el patrón Singleton para prevenir la creación de conexiones redundantes.
#[derive(Clone)]
pub struct DbManager {
    pool: Pool<SqliteConnectionManager>,
}

impl DbManager {
    /// Inicializa el Singleton del pool de conexiones a la base de datos.
    /// Si ya ha sido inicializado anteriormente, retorna un clon de la instancia Singleton existente.
    pub fn init<P: AsRef<Path>>(db_path: P) -> DbResult<Self> {
        if let Some(existing) = DB_SINGLETON.get() {
            return Ok(existing.clone());
        }

        // Asegurar que el directorio padre del archivo .db exista
        if let Some(parent) = db_path.as_ref().parent() {
            std::fs::create_dir_all(parent)?;
        }

        let manager = SqliteConnectionManager::file(db_path);
        let pool = Pool::builder()
            .max_size(10) // Límite máximo de conexiones simultáneas en el pool
            .build(manager)?;

        // Ejecutar migraciones en la conexión inicial
        let conn = pool.get()?;
        run_migrations(&conn)?;

        let db_manager = DbManager { pool };

        // Almacenar en el OnceLock estático global
        let _ = DB_SINGLETON.set(db_manager.clone());

        Ok(db_manager)
    }

    /// Retorna una referencia estática a la instancia Singleton global de la base de datos.
    /// Retorna `DbError::NotInitialized` si no se ha llamado previamente a `init()`.
    pub fn global() -> DbResult<&'static Self> {
        DB_SINGLETON.get().ok_or(DbError::NotInitialized)
    }

    /// Obtiene una conexión reutilizable desde el pool del Singleton de forma segura para hilos.
    pub fn get_connection(&self) -> DbResult<r2d2::PooledConnection<SqliteConnectionManager>> {
        let conn = self.pool.get()?;
        Ok(conn)
    }
}
