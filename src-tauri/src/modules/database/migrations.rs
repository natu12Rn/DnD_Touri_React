use rusqlite::Connection;
use crate::modules::database::error::DbResult;

/// Ejecuta las migraciones iniciales de la base de datos y configura los PRAGMAs de SQLite.
/// Garantiza que las tablas del sistema y de dominio se creen de forma limpia al iniciar la aplicación.
pub fn run_migrations(conn: &Connection) -> DbResult<()> {
    // Habilitar restricciones de Clave Foránea y modo Write-Ahead Logging (WAL) para alto rendimiento y concurrencia
    conn.execute_batch(
        "
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;

        -- Tablas de Metadatos del Sistema
        CREATE TABLE IF NOT EXISTS system_migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version INTEGER NOT NULL UNIQUE,
            name TEXT NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS system_info (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 1. TABLA RACE (Razas)
        CREATE TABLE IF NOT EXISTS race (
            idRace INTEGER PRIMARY KEY AUTOINCREMENT,
            idBook INTEGER,
            name TEXT NOT NULL,
            size TEXT,
            alignment TEXT,
            speed INTEGER,
            darkVision BOOLEAN DEFAULT 0,
            darkVisionFt INTEGER DEFAULT 0,
            racialBonusStr INTEGER DEFAULT 0,
            racialBonusDex INTEGER DEFAULT 0,
            racialBonusCon INTEGER DEFAULT 0,
            racialBonusInt INTEGER DEFAULT 0,
            racialBonusWis INTEGER DEFAULT 0,
            racialBonusCha INTEGER DEFAULT 0
        );

        -- 2. TABLA CHARACTER (Personajes)
        CREATE TABLE IF NOT EXISTS character (
            idCharacter INTEGER PRIMARY KEY AUTOINCREMENT,
            idUser INTEGER NOT NULL,
            idRace INTEGER NOT NULL,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            FOREIGN KEY (idRace) REFERENCES race(idRace)
        );

        -- 3. TABLA ATTRIBUTES (Atributos base del personaje)
        CREATE TABLE IF NOT EXISTS attributes (
            idCharacter INTEGER PRIMARY KEY,
            strength INTEGER DEFAULT 10,
            dexterity INTEGER DEFAULT 10,
            constitution INTEGER DEFAULT 10,
            intelligence INTEGER DEFAULT 10,
            wisdom INTEGER DEFAULT 10,
            charisma INTEGER DEFAULT 10,
            FOREIGN KEY (idCharacter) REFERENCES character(idCharacter) ON DELETE CASCADE
        );

        -- 4. TABLA WALLET (Billetera por moneda)
        CREATE TABLE IF NOT EXISTS wallet (
            idWallet INTEGER PRIMARY KEY AUTOINCREMENT,
            idCharacter INTEGER NOT NULL,
            codeCoin TEXT NOT NULL,
            balance INTEGER DEFAULT 0,
            UNIQUE(idCharacter, codeCoin),
            FOREIGN KEY (idCharacter) REFERENCES character(idCharacter) ON DELETE CASCADE
        );

        -- 5. TABLA TRANSACTIONS (Registro del evento)
        CREATE TABLE IF NOT EXISTS transactions (
            idTransactions INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT DEFAULT CURRENT_TIMESTAMP,
            message TEXT NOT NULL
        );

        -- 6. TABLA MOVEMENT (Detalle del movimiento económico)
        CREATE TABLE IF NOT EXISTS movement (
            idMovement INTEGER PRIMARY KEY AUTOINCREMENT,
            idTransactions INTEGER NOT NULL,
            idCharacter INTEGER NOT NULL,
            codeCoin TEXT NOT NULL,
            amount INTEGER NOT NULL,
            FOREIGN KEY (idTransactions) REFERENCES transactions(idTransactions) ON DELETE CASCADE,
            FOREIGN KEY (idCharacter) REFERENCES character(idCharacter) ON DELETE CASCADE
        );
        "
    )?;

    // Insertar o actualizar la marca de tiempo de inicialización del sistema
    conn.execute(
        "INSERT OR REPLACE INTO system_info (key, value, updated_at) VALUES ('app_status', 'initialized', CURRENT_TIMESTAMP)",
        [],
    )?;

    Ok(())
}
