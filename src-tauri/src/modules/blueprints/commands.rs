use crate::modules::blueprints::model::{BlueprintRecord, CreateBlueprintInput, UpdateBlueprintInput};
use crate::modules::blueprints::repository::BlueprintRepository;

/// Comando IPC de Tauri para crear y persistir un nuevo plano 2D.
#[tauri::command]
pub fn create_blueprint(input: CreateBlueprintInput) -> Result<i64, String> {
    BlueprintRepository::create(input).map_err(|err| err.to_string())
}

/// Comando IPC de Tauri para actualizar un plano existente.
#[tauri::command]
pub fn update_blueprint(input: UpdateBlueprintInput) -> Result<(), String> {
    BlueprintRepository::update(input).map_err(|err| err.to_string())
}

/// Comando IPC de Tauri para obtener los datos completos de un plano por su ID.
#[tauri::command]
pub fn get_blueprint_by_id(id_blueprint: i64) -> Result<BlueprintRecord, String> {
    BlueprintRepository::get_by_id(id_blueprint).map_err(|err| err.to_string())
}

/// Comando IPC de Tauri para listar todos los planos guardados.
#[tauri::command]
pub fn list_all_blueprints() -> Result<Vec<BlueprintRecord>, String> {
    BlueprintRepository::list_all().map_err(|err| err.to_string())
}

/// Comando IPC de Tauri para eliminar un plano por su ID.
#[tauri::command]
pub fn delete_blueprint_by_id(id_blueprint: i64) -> Result<(), String> {
    BlueprintRepository::delete_by_id(id_blueprint).map_err(|err| err.to_string())
}
