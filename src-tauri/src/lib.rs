pub mod modules;

use tauri::Manager;
use crate::modules::database::DbManager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Resolve app data directory for SQLite database storage
            let app_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));

            let db_path = app_dir.join("dnd_app.db");

            // Initialize SQLite Database Singleton instance from the database module
            let db_manager = DbManager::init(&db_path)
                .map_err(|e| Box::<dyn std::error::Error>::from(e.to_string()))?;

            // Attach DbManager to Tauri state for dependency injection if needed
            app.manage(db_manager);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            modules::system::commands::check_db_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
