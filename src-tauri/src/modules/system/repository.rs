use crate::core::database::{DbManager, DbResult};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DbStatus {
    pub is_connected: bool,
    pub status_message: String,
    pub database_path: String,
}

pub struct SystemRepository;

impl SystemRepository {
    /// Consulta el estado de salud de la conexión a la base de datos a través del administrador Singleton.
    pub fn get_db_status() -> DbResult<DbStatus> {
        let db = DbManager::global()?;
        let conn = db.get_connection()?;

        let mut stmt = conn.prepare("SELECT value FROM system_info WHERE key = 'app_status'")?;
        let status: String = stmt.query_row([], |row| row.get(0))?;

        crate::log_info!(
            "modules::system",
            "Diagnóstico de salud de SQLite exitoso | Clave: 'app_status' | Valor: '{}'",
            status
        );

        Ok(DbStatus {
            is_connected: true,
            status_message: format!("Conexión Singleton de SQLite Activa. Estado: {}", status),
            database_path: "dnd_app.db".to_string(),
        })
    }
}
