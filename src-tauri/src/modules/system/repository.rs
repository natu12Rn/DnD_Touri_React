use crate::modules::database::{DbManager, DbResult};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DbStatus {
    pub is_connected: bool,
    pub status_message: String,
    pub database_path: String,
}

pub struct SystemRepository;

impl SystemRepository {
    /// Checks the current database connection health via the Singleton manager.
    pub fn get_db_status() -> DbResult<DbStatus> {
        let db = DbManager::global()?;
        let conn = db.get_connection()?;

        let mut stmt = conn.prepare("SELECT value FROM system_info WHERE key = 'app_status'")?;
        let status: String = stmt.query_row([], |row| row.get(0))?;

        Ok(DbStatus {
            is_connected: true,
            status_message: format!("SQLite Singleton Connection Active. Status: {}", status),
            database_path: "app.db".to_string(),
        })
    }
}
