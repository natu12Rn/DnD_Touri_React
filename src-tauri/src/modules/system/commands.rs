use crate::modules::system::repository::{DbStatus, SystemRepository};

/// Comando Tauri IPC para consultar el estado de la conexión SQLite.
/// Demuestra una capa de control limpia y manejo estricto de errores sin panics.
#[tauri::command]
pub fn check_db_connection() -> Result<DbStatus, String> {
    SystemRepository::get_db_status().map_err(Into::into)
}
