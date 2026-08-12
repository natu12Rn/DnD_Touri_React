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
- **Modular Backend Architecture (`src-tauri/src/modules/`)**:
  - The Rust backend MUST strictly adhere to a domain-driven Modular Architecture.
  - All feature modules (e.g. `system`, `characters`, `campaigns`) must reside in `src-tauri/src/modules/<feature_name>/` and maintain clean layered separation:
    - **IPC Commands (Controller)**: Handles requests from React and input validation.
    - **Repository / Service (Domain)**: Handles business logic and data access.
  - Core database infrastructure MUST reside inside `src-tauri/src/modules/database/`.
- **SQLite Database Singleton**:
  - All database access MUST use the thread-safe `DbManager` Singleton pattern (`DbManager::global()`) powered by `r2d2` connection pooling to prevent creating redundant database connections or encountering SQLite lock issues.
  - Database initialization must configure SQLite PRAGMAs (`journal_mode = WAL`, `foreign_keys = ON`, `synchronous = NORMAL`).
- **Error Handling (Rust & React)**:
  - Using `.unwrap()` or `.expect()` in production logic inside `src-tauri` is strictly prohibited.
  - Functions in Rust must always return the `Result<T, E>` type.
  - Backend errors must be cleanly caught and intercepted by React to display user-facing UI notifications, preventing silent crashes.
- **Documentación de Código en Español**:
  - Todos los comentarios de código (`//`), bloques de documentación de Rust (`///` o `/** */`) y docstrings redactados dentro del código fuente DEBEN estar estrictamente redactados en idioma español.


---

## 3. UI/UX & Design Guidelines

All visual designs, CSS architecture, color variables, typography, and component styling standards are defined in [STYLE.md](file:///d:/User/Documents/Programacion/dndDesktopApp/.agents/STYLE.md).

- **Theme**: Modern dark mode desktop app with glassmorphism, Bento Grid layout, and subtle D&D fantasy accents.
- **Framework & Styling**: Tailwind CSS as the primary styling base.
- **Design Tokens**: Standardized Tailwind palette, custom theme extensions, and CSS variables defined in [STYLE.md](file:///d:/User/Documents/Programacion/dndDesktopApp/.agents/STYLE.md).
- **Layout Architecture**: Bento Grid style (`grid col-span-*`, `rounded-2xl`, `backdrop-blur-xl`, `border-white/10`).
- **Typography**: Inter (UI Body), Cinzel (Fantasy Headings), Fira Code (Monospace/Stats).

---

## 4. Agent Workflow & Rules

- **Agent Commit Prohibition**: The AI agent **IS NOT ALLOWED** to perform `git commit` or create commits on any branch under any circumstances. Creating and managing commits is the exclusive responsibility of the user.
