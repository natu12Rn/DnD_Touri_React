# UI/UX & Design System Standards (`STYLE.md`)

This document defines the visual standards, design tokens, component rules, and CSS architecture for **dndDesktopApp**. All UI components and styles created or modified within this repository must adhere to these guidelines.

---

## 1. Core Stack & Design Philosophy

- **Framework Standard**: **Tailwind CSS** is the core styling framework for all components, utility classes, and layout structures.
- **Layout Architecture**: **Bento Grid Style** (asymmetric, modular card grids with rounded corners, clean padding, inner borders, and high visual hierarchy).
- **Theme & Aesthetics**: Modern dark mode desktop application combining sleek Bento UI card structures with subtle D&D / Tabletop fantasy elements (arcane gold glows, obsidian/slate dark surfaces, parchment stat accents).
- **Desktop First (Tauri & React)**: Optimized for desktop viewports with fluid window scaling, custom draggable titlebars, split-screen Bento panels, and collapsible drawers.
- **Principio Anti-Redundancia en la Interfaz**: Queda estrictamente prohibido incluir elementos interactivos redundantes o duplicados en el diseño visual (por ejemplo: botones secundarios como "Abrir" o "Seleccionar" dentro de filas o tarjetas que ya son interactivas y clickeables en su totalidad). Toda interacción principal debe ser directa y minimalista.

---

## 2. Bento Grid Layout Guidelines

Bento Grid layouts organize complex D&D tabletop tools (character stats, dice rollers, initiative trackers, map controls, spell slots) into clean, visual card units.

### Bento Container Rules
- **Grid Container**: Use CSS Grid via Tailwind (`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4`).
- **Bento Cards**:
  - Background: Dark glass (`bg-slate-900/70` or `bg-[#161922]/80 backdrop-blur-xl`).
  - Borders: Subtle translucent borders (`border border-white/10` or `border-amber-500/20`).
  - Border Radius: Large smooth corners (`rounded-2xl` or `rounded-3xl`).
  - Padding: Consistent internal spacing (`p-5` or `p-6`).
  - Shadows: Subtle drop shadow with hover glow (`shadow-lg shadow-black/40 hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)] transition-all duration-300`).

### Common Bento Card Sizes
- **Compact Widget (1x1)**: `col-span-1 row-span-1` (Quick Stat Counters, Dice Bag, Spell Slot Tracker).
- **Wide Feature Card (2x1 / 3x1)**: `col-span-2 row-span-1` or `col-span-3 row-span-1` (Initiative Timeline, Active Effects, Quick Action Toolbar).
- **Tall Inspector Card (1x2 / 1x3)**: `col-span-1 row-span-2` (Character Avatar & Vitals, Inventory List, Spellbook Drawer).
- **Main Canvas Hero (2x2 / 3x2)**: `col-span-2 row-span-2` or `col-span-3 row-span-2` (Battle Map View, Campaign Notes, Interactive Sheet).

---

## 3. Tailwind Color System & Tokens

Tailwind colors and custom theme extensions:

### Color Definitions
- **Background Base**: `bg-[#0f1117]` (App background), `bg-[#161922]` (Bento surface), `bg-[#1e2230]` (Card secondary).
- **Fantasy Accents**:
  - Gold / Arcane: `amber-400` / `yellow-500` (`#d4af37` accent glow).
  - Dragon Red: `rose-600` / `red-500` (Health / Danger / Combat).
  - Mana Blue: `sky-500` / `blue-600` (Spell Slots / Magic).
  - Mystic Purple: `purple-500` / `violet-600` (Legendary / Special Effects).
  - Emerald Healing: `emerald-500` (Rest / Healing / Success).
- **Text Scale**:
  - Primary: `text-slate-100` (`#f8fafc`)
  - Secondary: `text-slate-400` (`#94a3b8`)
  - Muted: `text-slate-500` (`#64748b`)
  - Gold Heading: `text-amber-400` / `text-amber-300`

---

## 4. Typography Standard

- **Primary UI Body (`font-sans`)**: `Inter`, `Outfit`, or system sans-serif. Used for labels, body text, form controls.
- **Fantasy Headings (`font-serif` / `font-fantasy`)**: `Cinzel`, `Cinzel Decorative`, or serif. Used for Bento card titles, character names, chapter headings.
- **Monospace & Stats (`font-mono`)**: `Fira Code` or `JetBrains Mono`. Used for numerical stats, dice formulas (`2d20 + 5`), armor class, HP counters.

### Tailwind Classes Scale
- Card Titles: `font-serif text-lg font-semibold text-amber-400 tracking-wide`
- Hero Titles: `font-serif text-3xl font-bold text-slate-100`
- Stat Values: `font-mono text-2xl font-bold text-slate-100`
- Muted Labels: `text-xs uppercase tracking-wider text-slate-400 font-medium`

---

## 5. Bento Component Examples (Tailwind CSS)

### Bento Card Base Snippet
```tsx
<div className="group relative col-span-1 row-span-1 rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]">
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-serif text-base font-semibold text-amber-400">Card Title</h3>
    <span className="text-xs font-mono text-slate-400">Tag/Stat</span>
  </div>
  <div className="text-slate-300 text-sm">
    Card Content
  </div>
</div>
```
### Action Button Snippets (Icon-First Standard)

#### Botón de Icono Estándar (Predeterminado)
```tsx
<button
  onClick={handleAction}
  title="Descripción de la acción"
  className="p-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 transition-all duration-200 active:scale-95 flex items-center justify-center"
>
  <RotateCcw size={16} />
</button>
```

#### Botón de Texto / Llamado a la Acción Principal (Excepciones autorizadas)
```tsx
<button className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 font-sans text-sm font-medium text-amber-300 border border-amber-500/30 transition-all duration-200 hover:bg-amber-500/20 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95">
  <Plus size={16} />
  <span>Crear Nuevo Plano</span>
</button>
```

---

## 6. Micro-animations & Visual Effects

- **Hover Elevation**: Bento cards elevate slightly (`hover:-translate-y-1`) with border glow transitions (`transition-all duration-300`).
- **Active Compression**: Interactive buttons compress (`active:scale-95` or `active:scale-98`).
- **Glow Rings**: Focus rings for inputs use `focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 focus:outline-none`.
- **Glassmorphism**: Combine `bg-slate-900/70` with `backdrop-blur-md` or `backdrop-blur-xl`.

---

## 7. Tauri Desktop Specifics

- **Titlebar Area**: Dedicated top header bar with `select-none` and Tauri drag regions (`data-tauri-drag-region`).
- **Scrollbars**: Customized thin, dark scrollbars (`scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent`).
- **No Overflow Leaks**: Application root container uses `h-screen w-screen overflow-hidden` with scrollable Bento grid content areas.

---

## 8. Toast Notifications Placement & Design Standards (Regla Estricta)

- **Límite Máximo Anti-Spam (MAX_TOASTS = 4)**: Toda emisión de notificaciones Toast en la aplicación debe restringirse a un máximo estricto de 4 notificaciones simultáneas activas en pantalla.
- **Comportamiento Vertical FIFO**:
  - Las notificaciones **más nuevas** se posicionan siempre en la base inferior (`bottom`).
  - Las notificaciones **previas se desplazan hacia arriba** verticalmente.
  - Al ingresar una 5.ª notificación, la superior (la más antigua) se descarta automáticamente para dar paso a la nueva en la base.
- **Ubicación Libre de Interferencia**: Posicionamiento fijo en la esquina inferior derecha (`bottom-5 right-5` con `flex flex-col items-end gap-2` y `z-[99999]`), garantizando que jamás obstruya menús superiores, modales de métricas o paneles de diseño activos.
- **Diseño Ultra-Compacto y Conciso**:
  - Contenedor compacto (`px-3.5 py-2`, `max-w-sm`), tipografía `text-xs font-sans`, bordes temáticos translúcidos y backdrop blur (`backdrop-blur-xl`).
  - Textos breves, directos y esenciales (ej. *"Biblioteca integrada correctamente."*, *"Expansión aplicada."*, *"Plano guardado en SQLite."*).
  - Duración estándar de 3.5 segundos (`3500ms`) con botón de descarte manual `(X)`.

---

## 9. Frontend Component Architecture & Standards (`src/components/`)

Todas las definiciones de componentes de interfaz, su diseño visual y sus patrones de interacción residen y se rigen bajo este documento.

### A. Componentes del Diseñador Arquitectónico (`src/components/blueprint/`)
- **`BlueprintCanvas` (`BlueprintCanvas.tsx`)**:
  - **Función**: Lienzo HTML5 Canvas 2D interactivo para el diseño de bastiones y edificaciones.
  - **Reglas de Diseño**: Viewport dinámico adaptativo con `ResizeObserver` (100% de ancho/alto del contenedor), renderizado de cuadrícula infinita de 5x5 ft (40px) y zoom centrado en el punto focal del bastión.
  - **Interacción**: Paneo libre al arrastrar sobre fondo vacío (`cursor: grabbing`), manijas cuadradas en esquinas, píldoras centrales de pared, anclajes fantasma de inyección y menú rápido contextual proyectado para rotación (90°) y eliminación.
- **`CanvasZoomControls` (`CanvasZoomControls.tsx`)**:
  - **Función**: Ventana flotante de control óptico de escala del lienzo.
  - **Ubicación**: Esquina inferior izquierda (`bottom-5 left-5 z-30`).
  - **Componentes**: Botón Zoom Out (`-`), botón Zoom In (`+`), selector de porcentaje con menú desplegable de presets (`50%`, `75%`, `100%`, `125%`, `150%`, `200%`) y botón de recentrado al 100% (`RotateCcw`).
- **`BlueprintToolbar` (`BlueprintToolbar.tsx`)**:
  - **Función**: Barra superior de herramientas y gestión de planos.
  - **Componentes**: Input renombrador del bastión, selector de edificaciones especiales, expansiones de espacio (Apretado, Espacioso, Vasto), agregador de pasillos (Costo 0), botón de guardado en SQLite y disparador del modal de gestión de planos.
- **`BastionMetricsModal` (`BastionMetricsModal.tsx`)**:
  - **Función**: Panel lateral colapsable para métricas del bastión.
  - **Ubicación**: Esquina superior derecha (`top-4 right-4 z-20`).
  - **Componentes**: Conteo de celdas utilizadas, desglose de costes en piezas de oro (EO), cálculo de días de obra, selector rápido de elementos e inspección de instalaciones especiales.
- **`BuildingSelector` (`BuildingSelector.tsx`)**:
  - **Función**: Selector modal/desplegable del catálogo oficial de 38 edificaciones especiales con filtros por categoría y búsqueda instantánea.
- **`SpecialFacilityInfoModal` (`SpecialFacilityInfoModal.tsx`)**:
  - **Función**: Modal informativo con el trasfondo, beneficios, requisitos y costes de una edificación especial seleccionada.

### B. Componentes Globales de UI (`src/components/ui/`)
- **`ToastContainer` (`ToastContainer.tsx`)**:
  - **Función**: Contenedor global de notificaciones Toast rendered vía React Portal en `document.body`.
  - **Estructura**: `flex flex-col items-end gap-2` anclado a `bottom-5 right-5` con soporte para variantes `success`, `error`, `warning` e `info`.

---

## 10. Reglas de Interacción y Manejo de Componentes Frontend

1. **Separación Estricta entre Vista y Lógica Pesada**:
   - Todo componente React se limita exclusivamente a la presentación visual, animaciones y gestión del estado de la interfaz de usuario.
   - Las consultas a base de datos y procesamiento de archivos se delegan al backend de Rust mediante `invoke`.
2. **Estándar de Botones Basados en Iconos (Icon-First Buttons)**:
   - Salvo indicación explícita en contrario, **todos los botones de acción en la interfaz deben implementarse primordialmente como botones de solo icono** (`Icon-only buttons`), haciendo uso de iconos de `lucide-react` con dimensiones proporcionadas (`size={15}` o `size={16}`), padding equilibrado (`p-1.5` o `p-2`), esquinas redondeadas (`rounded-xl` o `rounded-2xl`) y atributo `title="..."` descriptivo para accesibilidad.
3. **Control de Foco en Atajos de Teclado**:
   - Los listeners de teclado (`keydown`) en componentes de React deben validar si el foco se encuentra en un `<input>` o `<textarea>` para no interceptar la escritura del usuario.
4. **Anti-Redundancia en Interacciones**:
   - Se prohíbe añadir botones secundarios redundantes en tarjetas o listas clickeables en su totalidad.

