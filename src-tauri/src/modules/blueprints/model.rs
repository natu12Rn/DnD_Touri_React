use serde::{Deserialize, Serialize};

/// Estructura que representa un plano arquitectónico 2D almacenado en la base de datos SQLite.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlueprintRecord {
    /// Identificador único del plano en SQLite
    pub id_blueprint: i64,
    /// Nombre descriptivo del plano (ej. "Posada del Dragón", "Castillo Nivel 1")
    pub name: String,
    /// Tamaño base de la cuadrícula en pies (por defecto 5 ft)
    pub grid_size_ft: i64,
    /// JSON serializado con los polígonos, zonas, anclajes y puertas
    pub geometry_json: String,
    /// Marca de tiempo de creación
    pub created_at: String,
    /// Marca de tiempo de última modificación
    pub updated_at: String,
}

/// DTO para crear un nuevo plano arquitectónico.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateBlueprintInput {
    pub name: String,
    pub grid_size_ft: Option<i64>,
    pub geometry_json: String,
}

/// DTO para actualizar un plano existente.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateBlueprintInput {
    pub id_blueprint: i64,
    pub name: String,
    pub grid_size_ft: Option<i64>,
    pub geometry_json: String,
}
