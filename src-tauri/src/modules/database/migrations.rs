use rusqlite::Connection;
use crate::modules::database::error::DbResult;

/// Runs initial database migrations and configures SQLite PRAGMAs.
/// Guarantees that essential system tables are initialized cleanly on app startup.
pub fn run_migrations(conn: &Connection) -> DbResult<()> {
    // Enable Foreign Key constraints and Write-Ahead Logging (WAL) mode for performance and concurrency
    conn.execute_batch(
        "
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;

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
        "
    )?;

    // Insert or update initial system initialization timestamp
    conn.execute(
        "INSERT OR REPLACE INTO system_info (key, value, updated_at) VALUES ('app_status', 'initialized', CURRENT_TIMESTAMP)",
        [],
    )?;

    Ok(())
}
