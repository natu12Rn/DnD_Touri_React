pub mod modules;

use tauri::Manager;
use crate::modules::database::DbManager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("¡Hola, {}! ¡Has sido saludado desde Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Resolver el directorio de datos de la aplicación para almacenar la base de datos SQLite
            let app_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));

            let db_path = app_dir.join("dnd_app.db");

            // Inicializar la instancia Singleton del gestor de la base de datos SQLite
            let db_manager = DbManager::init(&db_path)
                .map_err(|e| Box::<dyn std::error::Error>::from(e.to_string()))?;

            // Adjuntar DbManager al estado administrado de Tauri para inyección de dependencias
            app.manage(db_manager);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            modules::system::commands::check_db_connection,
            modules::blueprints::commands::create_blueprint,
            modules::blueprints::commands::update_blueprint,
            modules::blueprints::commands::get_blueprint_by_id,
            modules::blueprints::commands::list_all_blueprints,
            modules::blueprints::commands::delete_blueprint_by_id,
        ])
        .run(tauri::generate_context!())
        .expect("error al ejecutar la aplicación tauri");
}
