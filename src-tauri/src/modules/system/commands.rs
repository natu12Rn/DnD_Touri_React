use crate::modules::system::repository::{DbStatus, SystemRepository};

/// Tauri command to query SQLite connection status.
/// Demonstrates clean controller layer and error handling.
#[tauri::command]
pub fn check_db_connection() -> Result<DbStatus, String> {
    SystemRepository::get_db_status().map_err(Into::into)
}
