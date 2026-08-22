# Project Guidelines & Rules (AGENTS.md)

This document contains project guidelines, code standards, design principles, and AI agent workflows for **dndDesktopApp**.

---

## 1. Project Overview & Tech Stack

- **Strict Tech Stack**: Tauri, React, TypeScript, and `pnpm`.
- **Application Directory**: The main application resides in the workspace root directory ([`dndDesktopApp`](file:///d:/User/Documents/Programacion/dndDesktopApp)).

---

## 2. Code Standards & Conventions

- **Exclusive Package Manager**: `pnpm` is the sole allowed package manager. Proposing or running commands with `npm`, `yarn`, or other package managers is strictly prohibited.
- **Execution & Build Paths**: All relative execution and build commands must strictly respect that the main application is located inside the workspace directory.
- **Separation of Concerns**:
  - **React Environment (`src`)**: Restricted exclusively to the user interface presentation and visual state management.
  - **Rust Environment (`src-tauri`)**: Solely responsible for heavy processing, complex business logic, local file system access, and database operations.
- **Strong Typing & Interfaces**:
  - The use of the generic `any` type in TypeScript is strictly prohibited. Everything must be explicitly typed.
  - Communication between the frontend and backend via Tauri commands (`invoke`) requires explicit matching interfaces across both layers.
- **Modular Backend Architecture (`src-tauri/src/core/` & `src-tauri/src/modules/`)**:
  - El backend de Rust DEBE respetar una clara separación entre infraestructura transversal (`core`) y módulos de dominio funcional (`modules`):
    - **Capa `core` (`src-tauri/src/core/`)**: Aloja utilidades compartidas, herramientas generales e infraestructura común (como `core::database`, helpers, gestión de errores transversales).
    - **Capa `modules` (`src-tauri/src/modules/<feature_name>/`)**: Aloja los módulos de dominio del negocio (ej. `blueprints`, `system`, `characters`, `campaigns`) con separación estricta:
      - **IPC Commands (Controller)**: Manejo de solicitudes desde React y validación de entrada.
      - **Repository / Service (Domain)**: Lógica de negocio y acceso a datos.
      - **Model**: Estructuras de datos serializables.
  - La infraestructura de base de datos DEBE residir dentro de `src-tauri/src/core/database/`.
- **SQLite Database Singleton**:
  - Todo acceso a la base de datos DEBE utilizar el patrón Singleton `DbManager` (`DbManager::global()`) impulsado por pooling de conexiones `r2d2` para prevenir conexiones redundantes y bloqueos de SQLite.
  - La inicialización de la base de datos debe configurar PRAGMAs de SQLite (`journal_mode = WAL`, `foreign_keys = ON`, `synchronous = NORMAL`).
- **Error Handling & Centralized AppError (Rust & React)**:
  - Using `.unwrap()` or `.expect()` in production logic inside `src-tauri` is strictly prohibited.
  - Functions in Rust must always return the `Result<T, E>` or `AppResult<T>` type.
  - **Regla Estricta para Errores Personalizados**: Todo nuevo error o variante de error específico que se cree en cualquier módulo DEBE integrarse obligatoriamente dentro del enum central `AppError` en `core::error` (mediante variantes explícitas o implementaciones del trait `From<ModuleError> for AppError`), garantizando que jamás existan errores dispersos no tipados o sin registrar en disco.
  - Backend errors must be cleanly caught and intercepted by React to display user-facing UI notifications, preventing silent crashes.
- **Descriptive & Contextual Logging Standard (Regla de Logs Descriptivos y Contextuales)**:
  - Se prohíben terminantemente los mensajes de log genéricos, ambiguos o sin contexto (ej. *"Error en BD"*, *"Fallo en operación"*, *"Ocurrió un error"*).
  - **Requisitos Obligatorios al Registrar Errores y Advertencias (`log_error!`, `log_warn!`, `logger.error()`)**:
    1. **Identificador de Entidad/Recurso**: Especificar IDs, nombres o claves de la entidad afectada (ej. `id_blueprint`, `name`, `id_character`).
    2. **Datos / Parámetros en Procesamiento**: Incluir los valores relevantes que se estaban evaluando o transformando al momento del fallo (ej. coordenadas `(x, y)`, tamaño de cuadrícula, tipo de edificación, dimensiones).
    3. **Causa Técnica / Excepción Subyacente**: Incluir el mensaje de error nativo exacto (`e.to_string()`, código SQLite, error de IO o stack trace) para permitir un diagnóstico post-mortem certero en producción sin necesidad de adivinanzas.
- **Idioma Español Obligatorio en Todo el Proyecto (Logs, Errores, UI y Código)**:
  - Todos los mensajes de log (`log_info!`, `log_warn!`, `log_error!`, `logger.error()`), mensajes y variantes de error en `AppError` y `DbError`, textos de notificaciones Toast, etiquetas/textos de interfaz de usuario en React, comentarios de código (`//`), bloques de documentación de Rust (`///` o `/** */`) y docstrings DEBEN estar estricta e íntegramente redactados en idioma español.


---

## 3. UI/UX, Frontend Design & Component Guidelines

> [!IMPORTANT]
> **Fuente Única de Verdad para Frontend (`STYLE.md`)**:
> Todo lo referente al diseño visual, tokens de Tailwind, tipografía, paleta de colores, arquitectura de layouts (Bento Grid), reglas de interacción, directrices de notificaciones Toast y definiciones/catálogo de componentes de React reside y se rige exclusivamente bajo [STYLE.md](file:///d:/User/Documents/Programacion/DnD_Touri_React/.agents/STYLE.md).

- **Documento Maestro**: Consultar [STYLE.md](file:///d:/User/Documents/Programacion/DnD_Touri_React/.agents/STYLE.md) antes de crear o modificar cualquier componente, estilo CSS o vista de usuario.
- **Theme Base**: Modern dark mode desktop app con Bento Grid, glassmorphism y sutiles acentos dorados D&D.
- **Framework & Styling**: Tailwind CSS como base estricta.
- **Componentes y Notificaciones Toast**: Todas las especificaciones de layout, el catálogo de componentes (`BlueprintCanvas`, `CanvasZoomControls`, `ToastContainer`, etc.) y la regla estricta de notificaciones Toast (FIFO max 4) están detalladas en [STYLE.md](file:///d:/User/Documents/Programacion/DnD_Touri_React/.agents/STYLE.md).

---

## 4. Agent Workflow & Rules

- **Agent Commit Prohibition**: The AI agent **IS NOT ALLOWED** to perform `git commit` or create commits on any branch under any circumstances. Creating and managing commits is the exclusive responsibility of the user.
- **Validación y Pruebas Obligatorias en Cambios de Código**:
  - Al realizar implementaciones funcionales, modificaciones de componentes o cambios de código (Frontend en `src/` o Backend en `src-tauri/`), el agente **DEBE ejecutar obligatoriamente verificaciones de compilación y tipado** (`pnpm tsc --noEmit`, `pnpm build` o `cargo check`).
  - En caso de presentarse cualquier error de compilación o tipado, el agente **debe corregir iterativamente hasta que la verificación pase con 0 errores (código de salida 0)**.
  - **Excepción para Documentación**: Si únicamente se modifican archivos de documentación, reglas de agente (ej. `AGENTS.md`, `STYLE.md`, `README.md`) o texto plano sin tocar lógica de código, **NO se deben ejecutar comandos de compilación o pruebas innecesarias**.
- **Registro y Documentación Obligatoria de Módulos**:
  - Cada nuevo funcionamiento, servicio, comando IPC o módulo backend implementado **DEBE documentarse formalmente en la Sección 5 (*Backend Modules & API Reference*) de `AGENTS.md`**, detallando su propósito, funciones públicas, comandos IPC y comportamiento técnico.
- **Commit Message Generation Standards (Disparador Exclusivo `\commit`)**:
  - Las propuestas de mensajes y comandos de commit **SÓLO se generarán cuando el usuario lo solicite explícitamente mediante el comando `\commit` (o `/commit`)**, evitando sugerencias automáticas no solicitadas en cada respuesta.
  - Al recibir `\commit`, el agente debe analizar `git status` / `git diff`, redactar el mensaje estructurado bajo **Conventional Commits 1.0.0** (`<type>(<scope>): <description>`) y entregar el comando listo para copiar y pegar.
  - Allowed types: `feat`, `fix`, `refactor`, `style`, `perf`, `docs`, `test`, `chore`, `build`.
  - Common scopes: `ui`, `theme`, `database`, `system`, `character`, `attributes`, `wallet`, `blueprints`, `logger`, `error`, `deps`, `config`.

---

## 5. Backend Modules & API Reference (`src-tauri/src/`)

Esta sección documenta los módulos de arquitectura backend registrados en Rust, sus funciones públicas y comandos IPC de Tauri. Para la documentación y catálogo de componentes Frontend, consultar la sección 9 de [STYLE.md](file:///d:/User/Documents/Programacion/DnD_Touri_React/.agents/STYLE.md).

### A. Core Database Module (`core::database` - Rust)
Provides thread-safe, centralized SQLite connection management and migration runner.

- **`DbManager::init<P: AsRef<Path>>(db_path: P) -> DbResult<DbManager>`**
  - **Description**: Initializes the global `r2d2` SQLite connection pool Singleton, configures PRAGMAs (`WAL`, `foreign_keys = ON`), and runs database migrations.
  - **Usage**:
    ```rust
    let db_manager = DbManager::init(&db_path)?;
    ```
- **`DbManager::global() -> DbResult<&'static DbManager>`**
  - **Description**: Returns a static reference to the global `DbManager` Singleton instance.
  - **Usage**:
    ```rust
    let db = DbManager::global()?;
    let conn = db.get_connection()?;
    ```
- **`DbManager::get_connection(&self) -> DbResult<PooledConnection<SqliteConnectionManager>>`**
  - **Description**: Obtains a thread-safe connection from the Singleton pool for database operations.
- **`run_migrations(conn: &Connection) -> DbResult<()>`**
  - **Description**: Configures SQLite PRAGMAs and creates system & domain tables (`blueprints`, `system_info`, `race`, `character`, `attributes`, `wallet`, `transactions`, `movement`).

---

### B. Core Logger Module (`core::logger` - Rust)
Proporciona persistencia de registros en disco en `%APPDATA%/com.userj.dnddesktopapp/logs/` con rotación diaria y purga de logs antiguos (retención de 7 días / máx 5 MB por archivo).

- **`LoggerManager::init(logs_dir: PathBuf) -> Result<&'static LogWriter, String>`**
  - **Description**: Inicializa el Singleton global de logging en disco.
- **`log_info!(target, message, ...)` / `log_warn!` / `log_error!` / `log_debug!`**
  - **Description**: Macros para registro formateado con timestamp ISO, nivel de severidad y módulo de origen.
- **`log_frontend_event(payload: FrontendLogPayload) -> Result<(), String>`**
  - **Description**: Comando IPC de Tauri para recibir y escribir en el log de disco los eventos y errores capturados en la interfaz de React.
  - **Frontend IPC**: `invoke('log_frontend_event', { payload: { level, module, message, stack } })`

---

### C. Core Error Module (`core::error` - Rust)
Centraliza el manejo de errores tipados de toda la aplicación y la captura de caídas críticas.

- **`AppError`**: Enum estructurado (`Database`, `Validation`, `NotFound`, `Io`, `Serialization`, `Internal`) serializable para Tauri IPC con auto-logging automático.
- **`setup_panic_hook()`**: Intercepta cualquier pánico no controlado con `std::panic::set_hook` y escribe el stack trace completo en el archivo de log en disco antes de la salida segura.

---

### D. System Module (`modules::system` - Rust)
Provides system status verification and database health monitoring IPC commands.

- **`SystemRepository::get_db_status() -> DbResult<DbStatus>`**
  - **Description**: Queries `system_info` table to check database connection status.
- **`check_db_connection() -> Result<DbStatus, String>`**
  - **Description**: Tauri IPC command `#[tauri::command]` callable from React frontend via `invoke('check_db_connection')`.

---

### E. Blueprints Module (`modules::blueprints` - Rust)
Provides full persistence and lifecycle management for architectural 2D bastion blueprints in SQLite.

- **`create_blueprint(input: CreateBlueprintInput) -> Result<i64, String>`**
  - **Description**: Inserts a new blueprint geometry record and returns its generated `id_blueprint`.
  - **Frontend IPC**: `invoke<number>('create_blueprint', { input: { name, grid_size_ft, geometry_json } })`
- **`update_blueprint(input: UpdateBlueprintInput) -> Result<(), String>`**
  - **Description**: Updates the geometry or name of an existing blueprint by ID.
  - **Frontend IPC**: `invoke('update_blueprint', { input: { id_blueprint, name, grid_size_ft, geometry_json } })`
- **`get_blueprint_by_id(id_blueprint: i64) -> Result<BlueprintRecord, String>`**
  - **Description**: Retrieves a single blueprint record with parsed JSON geometry.
  - **Frontend IPC**: `invoke<BlueprintRecordBackend>('get_blueprint_by_id', { id_blueprint })`
- **`list_all_blueprints() -> Result<Vec<BlueprintRecord>, String>`**
  - **Description**: Returns all saved blueprints ordered by `updated_at DESC`.
  - **Frontend IPC**: `invoke<BlueprintRecordBackend[]>('list_all_blueprints')`
- **`delete_blueprint_by_id(id_blueprint: i64) -> Result<(), String>`**
  - **Description**: Permanently deletes a blueprint record from SQLite.
  - **Frontend IPC**: `invoke('delete_blueprint_by_id', { id_blueprint })`



