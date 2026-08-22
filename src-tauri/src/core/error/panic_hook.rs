use std::panic;
use crate::log_error;

/// Configura un interceptor global de pánicos (Panic Hook) para capturar cualquier fallo
/// crítico no controlado y escribirlo de inmediato en el archivo de log en disco.
pub fn setup_panic_hook() {
    panic::set_hook(Box::new(|panic_info| {
        let payload = if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
            (*s).to_string()
        } else if let Some(s) = panic_info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Mensaje de pánico no disponible".to_string()
        };

        let location_str = if let Some(location) = panic_info.location() {
            format!("{}:{}:{}", location.file(), location.line(), location.column())
        } else {
            "Ubicación desconocida".to_string()
        };

        let current_thread = std::thread::current();
        let thread_name = current_thread.name().unwrap_or("hilo_principal");

        log_error!(
            "core::panic_hook",
            "🚨 CRASH CRÍTICO INTERCEPTADO en hilo '{}' [{}] - Causa: {}",
            thread_name,
            location_str,
            payload
        );
    }));
}
