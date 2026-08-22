---
name: generate-commit
description: Genera mensajes de commit estandarizados y comandos listos para ejecutar cuando el usuario escribe \commit siguiendo Conventional Commits y las reglas del proyecto.
---

# Skill: Generación de Mensajes de Commit Estandarizados (`\commit`)

Esta habilidad permite inspeccionar los cambios locales del repositorio y generar un mensaje de commit estructurado, claro y alineado con los estándares internacionales (Conventional Commits) y las directrices del proyecto cuando el usuario invoca el comando `\commit` (o `/commit`).

---

## 1. Reglas Fundamentales del Proyecto

> [!IMPORTANT]
> - **Prohibición de auto-commit**: El asistente de IA tiene **estrictamente prohibido** ejecutar `git commit` automáticamente.
> - **Disparador Exclusivo (`\commit`)**: Los mensajes de commit se generan **únicamente** cuando el usuario introduce el comando `\commit` (o `/commit`), evitando sugerencias automáticas no solicitadas al final de tareas intermedias.

---

## 2. Convención de Formato (Conventional Commits)

El formato del mensaje debe seguir la estructura:

```text
<tipo>(<ámbito opcional>): <descripción concisa en modo imperativo>

[Cuerpo opcional detallando el motivo y contexto del cambio]

[Pie opcional: Closes #123, BREAKING CHANGE: ...]
```

### Tipos de Commit Permitidos:
- **`feat`**: Nueva funcionalidad para el usuario o sistema.
- **`fix`**: Corrección de un error o bug.
- **`refactor`**: Refactorización de código que no añade funcionalidades ni corrige bugs.
- **`style`**: Cambios de formato, estilos visuales (CSS/Tailwind), espaciado, sin cambios en la lógica.
- **`perf`**: Mejoras en el rendimiento o consumo de recursos.
- **`docs`**: Modificaciones exclusivas en documentación (README, AGENTS.md, etc.).
- **`test`**: Añadir o corregir pruebas unitarias/integración.
- **`chore`**: Tareas de mantenimiento, actualización de dependencias, scripts de build o configuración del proyecto.
- **`build`**: Cambios que afectan el sistema de compilación o empaquetado (Cargo, Tauri config, Vite).

### Ámbitos Comunes en este Proyecto (`DnD_Touri_React`):
- `ui`: Componentes visuales, Bento Grid, modales, vistas.
- `theme`: Paleta de colores, tokens, tipografía, Tailwind config.
- `database`: Esquema SQLite, migraciones, PRAGMAs, `DbManager`.
- `system`: Módulo backend de diagnóstico y estado del sistema.
- `character` / `attributes` / `wallet`: Módulos de dominio de personajes y finanzas.
- `deps`: Dependencias de `pnpm` o `Cargo.toml`.
- `config`: Configuración de Tauri, Vite o herramientas del workspace.

---

## 3. Flujo de Trabajo para Generar el Commit

Cuando el usuario solicite generar un commit o redactar el mensaje:

1. **Inspeccionar Cambios**:
   - Ejecutar `git status -s` para ver los archivos modificados, añadidos o eliminados.
   - Si es necesario, ejecutar `git diff --staged` o `git diff` para entender el impacto exacto de las modificaciones.

2. **Categorizar y Redactar**:
   - Identificar el tipo principal de cambio (`feat`, `fix`, `style`, `refactor`, etc.).
   - Determinar el ámbito (`ui`, `database`, etc.).
   - Redactar el título en español o inglés según la preferencia del proyecto (por defecto español claro e imperativo, ej: `feat(ui): implementar layout Bento Grid para el dashboard`).
   - Si los cambios abarcan múltiples archivos o áreas, redactar una lista con viñetas en el cuerpo del mensaje explicando las modificaciones clave.

3. **Presentar la Propuesta al Usuario**:
   - Mostrar el análisis breve de los archivos afectados.
   - Presentar el mensaje de commit formateado.
   - Proporcionar el bloque de comandos para copiar y pegar:
     ```bash
     git add <archivos o .>
     git commit -m "tipo(ámbito): título descriptivo"
     ```
