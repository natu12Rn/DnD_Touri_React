use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::path::Path;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use crate::core::logger::config::{LogLevel, LoggerConfig};

/// Formatea un SystemTime en una cadena legible UTC/Local (YYYY-MM-DD HH:MM:SS.mmm).
fn format_system_time(time: SystemTime) -> (String, String) {
    let duration = time.duration_since(UNIX_EPOCH).unwrap_or_default();
    let total_secs = duration.as_secs();
    let millis = duration.subsec_millis();

    // Cálculos de fecha y hora basados en tiempo transcurrido
    let seconds_in_day = total_secs % 86400;
    let hours = seconds_in_day / 3600;
    let minutes = (seconds_in_day % 3600) / 60;
    let seconds = seconds_in_day % 60;

    let days = total_secs / 86400;
    // Aproximación de calendario desde 1970-01-01
    let mut year = 1970;
    let mut day_count = days;

    loop {
        let is_leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
        let days_in_year = if is_leap { 366 } else { 365 };
        if day_count < days_in_year {
            break;
        }
        day_count -= days_in_year;
        year += 1;
    }

    let is_leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    let days_in_months = [
        31,
        if is_leap { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];

    let mut month = 1;
    for &dim in &days_in_months {
        if day_count < dim {
            break;
        }
        day_count -= dim;
        month += 1;
    }
    let day = day_count + 1;

    let date_str = format!("{:04}-{:02}-{:02}", year, month, day);
    let time_str = format!(
        "{:04}-{:02}-{:02} {:02}:{:02}:{:02}.{:03}",
        year, month, day, hours, minutes, seconds, millis
    );

    (date_str, time_str)
}

/// Escritor de registros en disco thread-safe con soporte para rotación diaria y purga de logs antiguos.
pub struct LogWriter {
    config: LoggerConfig,
    file_mutex: Mutex<Option<(String, File)>>, // (Fecha actual, Archivo abierto)
}

impl LogWriter {
    pub fn new(config: LoggerConfig) -> Result<Self, std::io::Error> {
        if !config.logs_dir.exists() {
            fs::create_dir_all(&config.logs_dir)?;
        }

        let writer = Self {
            config,
            file_mutex: Mutex::new(None),
        };

        writer.cleanup_old_logs();
        Ok(writer)
    }

    /// Obtiene o rota el archivo de log correspondiente a la fecha actual.
    fn get_or_rotate_file(&self, date_str: &str) -> Result<File, std::io::Error> {
        let file_path = self.config.logs_dir.join(format!("app_{}.log", date_str));

        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&file_path)?;

        Ok(file)
    }

    /// Escribe una línea formateada en el archivo de log en disco y en la consola.
    pub fn write_log(&self, level: LogLevel, target: &str, message: &str) {
        if level < self.config.min_level {
            return;
        }

        let now = SystemTime::now();
        let (date_str, timestamp_str) = format_system_time(now);
        let log_line = format!("[{}] [{:<5}] [{}] {}\n", timestamp_str, level.as_str(), target, message);

        // Imprimir en terminal en desarrollo
        #[cfg(debug_assertions)]
        {
            match level {
                LogLevel::Error => eprintln!("\x1b[31m{}\x1b[0m", log_line.trim_end()),
                LogLevel::Warn => eprintln!("\x1b[33m{}\x1b[0m", log_line.trim_end()),
                LogLevel::Info => println!("\x1b[36m{}\x1b[0m", log_line.trim_end()),
                LogLevel::Debug => println!("\x1b[90m{}\x1b[0m", log_line.trim_end()),
            }
        }

        // Escritura protegida en disco
        if let Ok(mut guard) = self.file_mutex.lock() {
            let needs_rotation = match &*guard {
                Some((current_date, _)) => current_date != &date_str,
                None => true,
            };

            if needs_rotation {
                match self.get_or_rotate_file(&date_str) {
                    Ok(new_file) => {
                        *guard = Some((date_str, new_file));
                        self.cleanup_old_logs();
                    }
                    Err(err) => {
                        eprintln!("Error al rotar archivo de logs: {}", err);
                        return;
                    }
                }
            }

            if let Some((_, ref mut file)) = *guard {
                let _ = file.write_all(log_line.as_bytes());
                let _ = file.flush();
            }
        }
    }

    /// Elimina archivos de log que superen los días máximos de retención configurados.
    fn cleanup_old_logs(&self) {
        let Ok(entries) = fs::read_dir(&self.config.logs_dir) else {
            return;
        };

        let now = SystemTime::now();
        let max_age_secs = (self.config.max_history_days as u64) * 86400;

        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|e| e.to_str()) == Some("log") {
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(modified) = metadata.modified() {
                        if let Ok(age) = now.duration_since(modified) {
                            if age.as_secs() > max_age_secs {
                                let _ = fs::remove_file(&path);
                            }
                        }
                    }
                }
            }
        }
    }

    /// Retorna la ruta al directorio de logs.
    pub fn get_logs_dir(&self) -> &Path {
        &self.config.logs_dir
    }
}
