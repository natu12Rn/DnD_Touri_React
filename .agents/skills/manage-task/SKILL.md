---
name: manage-task
description: Gestiona la creación, seguimiento y verificación de completitud de actividades en ROADMAP_ACTIVIDADES.md cuando el usuario ejecuta el comando \task.
---

# Skill: Gestión del Ciclo de Vida de Actividades (`\task`)

Esta habilidad permite gestionar, planificar y actualizar el estado de las tareas y actividades del proyecto en el archivo [`ROADMAP_ACTIVIDADES.md`](file:///d:/User/Documents/Programacion/DnD_Touri_React/ROADMAP_ACTIVIDADES.md) utilizando el disparador `\task` (o `/task`).

---

## 1. Reglas Fundamentales del Comando `\task`

1. **Auto-Creación del Archivo**: Si el archivo [`ROADMAP_ACTIVIDADES.md`](file:///d:/User/Documents/Programacion/DnD_Touri_React/ROADMAP_ACTIVIDADES.md) no existe en la raíz del espacio de trabajo al momento de invocar `\task`, el agente debe crearlo automáticamente con su estructura base y fases del proyecto.
2. **Alineación con la Rama/Feature Activa**: Cada módulo funcional se desarrolla dentro de su propia rama de feature (ej. `feature/modulo_de_bastion`). Todas las actividades principales registradas y desglosadas en `ROADMAP_ACTIVIDADES.md` deben pertenecer estrictamente al módulo de la rama activa en curso.
3. **Prohibición Estricta de Auto-Inclusión de Tareas no Solicitadas**:
   > [!IMPORTANT]
   > El agente **TIENE ESTRICTAMENTE PROHIBIDO** agregar, deducir o inventar tareas o subtareas especulativas por su cuenta en [`ROADMAP_ACTIVIDADES.md`](file:///d:/User/Documents/Programacion/DnD_Touri_React/ROADMAP_ACTIVIDADES.md).
   > **Únicamente** se registrarán las actividades pendientes que el usuario mencione o solicite explícitamente mediante el comando `\task`. Si el agente considera que una tarea complementaria es conveniente, **DEBE preguntar primero al usuario y obtener su confirmación** antes de incluirla en el documento.
4. **Evaluación Técnica Obligatoria**: Antes de proponer o marcar cualquier actividad como completada, el agente debe evaluar minuciosamente el código, verificar la arquitectura modular y validar que las pruebas de compilación pasen con 0 errores (`pnpm tsc --noEmit` o `cargo check`).
5. **Confirmación Obligatoria con el Usuario para Completar Tareas**:
   > [!IMPORTANT]
   > El agente **TIENE ESTRICTAMENTE PROHIBIDO** marcar una tarea como completada (`[x]`) de forma unilateral sin previa confirmación.
   > Tras evaluar técnicamente la implementación, el agente **DEBE preguntar explícitamente al usuario** si está satisfecho con el resultado antes de actualizar la casilla a `[x]`.

---

## 2. Flujos de Trabajo de `\task`

### A. Creación / Adición de Nuevas Tareas (`\task crear ...` o `\task [descripción]`)
Cuando el usuario solicita registrar una nueva actividad:
1. Analizar a qué módulo o fase del proyecto pertenece (Personajes, Monedero, Bastiones, Dados, Inventario, Infraestructura).
2. Insertar la actividad en [`ROADMAP_ACTIVIDADES.md`](file:///d:/User/Documents/Programacion/DnD_Touri_React/ROADMAP_ACTIVIDADES.md) con el formato:
   ```markdown
   - [ ] **Nombre de la Tarea**: Breve descripción técnica de los requerimientos.
   ```
3. Informar al usuario de la actividad registrada indicando la fase asignada.

---

### B. Completado de Tareas (`\task done`, `\task completar` o finalización de trabajo)
Cuando una tarea ha sido implementada:
1. **Paso 1 - Evaluación y Validación**:
   - Verificar que los archivos modificados cumplan con las reglas de [AGENTS.md](file:///d:/User/Documents/Programacion/DnD_Touri_React/.agents/AGENTS.md) y [STYLE.md](file:///d:/User/Documents/Programacion/DnD_Touri_React/.agents/STYLE.md).
   - Ejecutar `pnpm tsc --noEmit` / `cargo check` y confirmar código de salida 0.
2. **Paso 2 - Consulta al Usuario**:
   - Presentar un resumen conciso de lo implementado y comprobado.
   - Realizar la pregunta formal de cierre:
     *"¿Confirmas que la actividad se encuentra completada a tu entera satisfacción para marcarla como `[x]` en el Roadmap?"*
3. **Paso 3 - Actualización tras Confirmación**:
   - Solo cuando el usuario responda afirmativamente, modificar el archivo [`ROADMAP_ACTIVIDADES.md`](file:///d:/User/Documents/Programacion/DnD_Touri_React/ROADMAP_ACTIVIDADES.md) cambiando `[ ]` por `[x]`.

---

### C. Listado y Seguimiento de Tareas (`\list task` o `/list task`)
Cuando el usuario ejecuta el comando `\list task`:
1. **Inspeccionar el Estado Actual**:
   - Consultar la rama Git activa (`git branch --show-current`).
   - Leer [`ROADMAP_ACTIVIDADES.md`](file:///d:/User/Documents/Programacion/DnD_Touri_React/ROADMAP_ACTIVIDADES.md).
2. **Presentar el Informe de Tareas**:
   - **Rama y Módulo Activo**: Detallar la feature en desarrollo (ej. `feature/modulo_de_bastion`).
   - **🎯 Tarea Activa / En Foco**: Resaltar cuál es la tarea inmediata sobre la que se está trabajando.
   - **📋 Lista de Tareas Pendientes (`[ ]`)**: Enumerar todas las tareas pendientes solicitadas con sus objetivos.
   - **✅ Tareas Completadas (`[x]`)**: Resumen de logros ya consolidados.

---

### D. Notas y Consideraciones Contextuales (`\note` o `/note`)
Cuando el usuario ejecuta el comando `\note [texto o apunte]`:
1. **Identificar la Tarea Activa / en Foco**: Vincular la nota con la actividad que se está desarrollando actualmente o con la tarea indicada.
2. **Registrar la Nota en el Documento**: Anexar el apunte debajo de la tarea correspondiente en [`ROADMAP_ACTIVIDADES.md`](file:///d:/User/Documents/Programacion/DnD_Touri_React/ROADMAP_ACTIVIDADES.md) con el formato:
   ```markdown
     > 💡 **Nota**: [Texto del apunte, restricción técnica o consideración especial]
   ```
3. **Confirmar Registro**: Notificar al usuario la consideración agregada a la tarea activa.
