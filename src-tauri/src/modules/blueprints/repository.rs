use crate::modules::blueprints::model::{BlueprintRecord, CreateBlueprintInput, UpdateBlueprintInput};
use crate::modules::database::connection::DbManager;
use crate::modules::database::error::DbResult;
use rusqlite::params;

/// Repositorio de acceso a datos para la entidad Blueprints en SQLite.
pub struct BlueprintRepository;

impl BlueprintRepository {
    /// Inserta un nuevo plano arquitectónico en la base de datos y retorna su ID generado.
    pub fn create(input: CreateBlueprintInput) -> DbResult<i64> {
        let db = DbManager::global()?;
        let conn = db.get_connection()?;
        let grid_size = input.grid_size_ft.unwrap_or(5);

        conn.execute(
            "INSERT INTO blueprints (name, gridSizeFt, geometryJson) VALUES (?1, ?2, ?3)",
            params![input.name, grid_size, input.geometry_json],
        )?;

        let last_id = conn.last_insert_rowid();
        Ok(last_id)
    }

    /// Actualiza un plano arquitectónico existente en la base de datos.
    pub fn update(input: UpdateBlueprintInput) -> DbResult<()> {
        let db = DbManager::global()?;
        let conn = db.get_connection()?;
        let grid_size = input.grid_size_ft.unwrap_or(5);

        conn.execute(
            "UPDATE blueprints SET name = ?1, gridSizeFt = ?2, geometryJson = ?3, updatedAt = CURRENT_TIMESTAMP WHERE idBlueprint = ?4",
            params![input.name, grid_size, input.geometry_json, input.id_blueprint],
        )?;

        Ok(())
    }

    /// Obtiene un plano específico por su identificador primario.
    pub fn get_by_id(id_blueprint: i64) -> DbResult<BlueprintRecord> {
        let db = DbManager::global()?;
        let conn = db.get_connection()?;

        let blueprint = conn.query_row(
            "SELECT idBlueprint, name, gridSizeFt, geometryJson, createdAt, updatedAt FROM blueprints WHERE idBlueprint = ?1",
            params![id_blueprint],
            |row| {
                Ok(BlueprintRecord {
                    id_blueprint: row.get(0)?,
                    name: row.get(1)?,
                    grid_size_ft: row.get(2)?,
                    geometry_json: row.get(3)?,
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                })
            },
        )?;

        Ok(blueprint)
    }

    /// Obtiene la lista completa de planos registrados en el sistema.
    pub fn list_all() -> DbResult<Vec<BlueprintRecord>> {
        let db = DbManager::global()?;
        let conn = db.get_connection()?;

        let mut stmt = conn.prepare(
            "SELECT idBlueprint, name, gridSizeFt, geometryJson, createdAt, updatedAt FROM blueprints ORDER BY updatedAt DESC",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(BlueprintRecord {
                id_blueprint: row.get(0)?,
                name: row.get(1)?,
                grid_size_ft: row.get(2)?,
                geometry_json: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })?;

        let mut list = Vec::new();
        for blueprint_result in rows {
            list.push(blueprint_result?);
        }

        Ok(list)
    }

    /// Elimina un plano de la base de datos por su ID.
    pub fn delete_by_id(id_blueprint: i64) -> DbResult<()> {
        let db = DbManager::global()?;
        let conn = db.get_connection()?;

        conn.execute(
            "DELETE FROM blueprints WHERE idBlueprint = ?1",
            params![id_blueprint],
        )?;

        Ok(())
    }
}
