use crate::modules::blueprints::model::{BlueprintRecord, CreateBlueprintInput, UpdateBlueprintInput};
use crate::core::database::DbManager;
use crate::core::error::{AppError, AppResult};
use crate::log_info;
use rusqlite::params;

/// Repositorio de acceso a datos para la entidad Blueprints en SQLite.
pub struct BlueprintRepository;

impl BlueprintRepository {
    /// Inserta un nuevo plano arquitectónico en la base de datos y retorna su ID generado.
    pub fn create(input: CreateBlueprintInput) -> AppResult<i64> {
        let db = DbManager::global().map_err(AppError::from)?;
        let conn = db.get_connection().map_err(AppError::from)?;
        let grid_size = input.grid_size_ft.unwrap_or(5);
        let geo_len = input.geometry_json.len();

        conn.execute(
            "INSERT INTO blueprints (name, gridSizeFt, geometryJson) VALUES (?1, ?2, ?3)",
            params![input.name, grid_size, input.geometry_json],
        )
        .map_err(|e| {
            let err = AppError::Database(format!(
                "Fallo al insertar plano '{}' | Parámetros: [grid_size: {}ft, geo_bytes: {}] - Causa: {}",
                input.name, grid_size, geo_len, e
            ));
            err.log_and_return("modules::blueprints")
        })?;

        let last_id = conn.last_insert_rowid();
        log_info!(
            "modules::blueprints",
            "Plano creado en SQLite: ID #{} ('{}') | Cuadrícula: {}ft | Tamaño Geometría: {} bytes",
            last_id,
            input.name,
            grid_size,
            geo_len
        );
        Ok(last_id)
    }

    /// Actualiza un plano arquitectónico existente en la base de datos.
    pub fn update(input: UpdateBlueprintInput) -> AppResult<()> {
        let db = DbManager::global().map_err(AppError::from)?;
        let conn = db.get_connection().map_err(AppError::from)?;
        let grid_size = input.grid_size_ft.unwrap_or(5);
        let geo_len = input.geometry_json.len();

        let rows_affected = conn.execute(
            "UPDATE blueprints SET name = ?1, gridSizeFt = ?2, geometryJson = ?3, updatedAt = CURRENT_TIMESTAMP WHERE idBlueprint = ?4",
            params![input.name, grid_size, input.geometry_json, input.id_blueprint],
        )
        .map_err(|e| {
            let err = AppError::Database(format!(
                "Fallo al actualizar plano ID #{} ('{}') | Parámetros: [grid_size: {}ft, geo_bytes: {}] - Causa: {}",
                input.id_blueprint, input.name, grid_size, geo_len, e
            ));
            err.log_and_return("modules::blueprints")
        })?;

        if rows_affected == 0 {
            let err = AppError::NotFound(format!(
                "No se encontró ningún plano con ID #{} para actualizar ('{}')",
                input.id_blueprint, input.name
            ));
            return Err(err.log_and_return("modules::blueprints"));
        }

        log_info!(
            "modules::blueprints",
            "Plano ID #{} ('{}') actualizado exitosamente | Cuadrícula: {}ft | Tamaño Geometría: {} bytes",
            input.id_blueprint,
            input.name,
            grid_size,
            geo_len
        );
        Ok(())
    }

    /// Obtiene un plano específico por su identificador primario.
    pub fn get_by_id(id_blueprint: i64) -> AppResult<BlueprintRecord> {
        let db = DbManager::global().map_err(AppError::from)?;
        let conn = db.get_connection().map_err(AppError::from)?;

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
        )
        .map_err(|e| {
            match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    let err = AppError::NotFound(format!("Plano con ID #{} no existe en la base de datos", id_blueprint));
                    err.log_and_return("modules::blueprints")
                }
                _ => {
                    let err = AppError::Database(format!("Error en consulta SQL para obtener plano ID #{}: {}", id_blueprint, e));
                    err.log_and_return("modules::blueprints")
                }
            }
        })?;

        log_info!(
            "modules::blueprints",
            "Plano recuperado de SQLite: ID #{} ('{}') | Creado: {} | Modificado: {}",
            blueprint.id_blueprint,
            blueprint.name,
            blueprint.created_at,
            blueprint.updated_at
        );
        Ok(blueprint)
    }

    /// Obtiene la lista completa de planos registrados en el sistema.
    pub fn list_all() -> AppResult<Vec<BlueprintRecord>> {
        let db = DbManager::global().map_err(AppError::from)?;
        let conn = db.get_connection().map_err(AppError::from)?;

        let mut stmt = conn.prepare(
            "SELECT idBlueprint, name, gridSizeFt, geometryJson, createdAt, updatedAt FROM blueprints ORDER BY updatedAt DESC",
        )
        .map_err(|e| {
            let err = AppError::Database(format!("Fallo al preparar consulta SELECT para listado de planos: {}", e));
            err.log_and_return("modules::blueprints")
        })?;

        let rows = stmt.query_map([], |row| {
            Ok(BlueprintRecord {
                id_blueprint: row.get(0)?,
                name: row.get(1)?,
                grid_size_ft: row.get(2)?,
                geometry_json: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| {
            let err = AppError::Database(format!("Fallo al ejecutar cursor de lectura de planos: {}", e));
            err.log_and_return("modules::blueprints")
        })?;

        let mut list = Vec::new();
        for blueprint_result in rows {
            let record = blueprint_result.map_err(|e| {
                let err = AppError::Database(format!("Fallo al mapear fila de plano a estructura BlueprintRecord: {}", e));
                err.log_and_return("modules::blueprints")
            })?;
            list.push(record);
        }

        log_info!("modules::blueprints", "Listado de planos obtenido desde SQLite (total registros: {})", list.len());
        Ok(list)
    }

    /// Elimina un plano de la base de datos por su ID.
    pub fn delete_by_id(id_blueprint: i64) -> AppResult<()> {
        let db = DbManager::global().map_err(AppError::from)?;
        let conn = db.get_connection().map_err(AppError::from)?;

        let rows_affected = conn.execute(
            "DELETE FROM blueprints WHERE idBlueprint = ?1",
            params![id_blueprint],
        )
        .map_err(|e| {
            let err = AppError::Database(format!("Fallo al ejecutar DELETE para plano ID #{}: {}", id_blueprint, e));
            err.log_and_return("modules::blueprints")
        })?;

        if rows_affected == 0 {
            let err = AppError::NotFound(format!("No se encontró ningún plano con ID #{} para eliminar", id_blueprint));
            return Err(err.log_and_return("modules::blueprints"));
        }

        log_info!("modules::blueprints", "Plano ID #{} eliminado permanentemente de SQLite (filas afectadas: {})", id_blueprint, rows_affected);
        Ok(())
    }
}

