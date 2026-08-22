pub mod core;
pub mod modules;

use tauri::Manager;
use crate::core::database::DbManager;
use crate::core::error::setup_panic_hook;
use crate::core::logger::LoggerManager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("¡Hola, {}! ¡Has sido saludado desde Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 1. Resolver el directorio de datos de la aplicación (%APPDATA%/com.userj.dnddesktopapp/)
            let app_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));

            // 2. Inicializar el sistema de logging centralizado en la subcarpeta "logs/"
            let logs_dir = app_dir.join("logs");
            let _ = LoggerManager::init(logs_dir);

            // 3. Configurar el interceptor global de pánicos (Panic Hook)
            setup_panic_hook();

            log_info!("app::lifecycle", "Iniciando aplicación dndDesktopApp v{}", env!("CARGO_PKG_VERSION"));

            // 4. Inicializar la base de datos SQLite y el pool Singleton DbManager
            let db_path = app_dir.join("dnd_app.db");
            let db_manager = DbManager::init(&db_path)
                .map_err(|e| {
                    log_error!("app::setup", "Fallo crítico al inicializar base de datos: {}", e);
                    Box::<dyn std::error::Error>::from(e.to_string())
                })?;

            // 5. Adjuntar DbManager al estado administrado de Tauri
            app.manage(db_manager);

            log_info!("app::lifecycle", "Inicialización del backend completada con éxito");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            core::logger::log_frontend_event,
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

