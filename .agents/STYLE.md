# UI/UX & Design System Standards (`STYLE.md`)

This document defines the visual standards, design tokens, component rules, and CSS architecture for **dndDesktopApp**. All UI components and styles created or modified within this repository must adhere to these guidelines.

---

## 1. Core Stack & Design Philosophy

- **Framework Standard**: **Tailwind CSS** is the core styling framework for all components, utility classes, and layout structures.
- **Layout Architecture**: **Bento Grid Style** (asymmetric, modular card grids with rounded corners, clean padding, inner borders, and high visual hierarchy).
- **Theme & Aesthetics**: Modern dark mode desktop application combining sleek Bento UI card structures with subtle D&D / Tabletop fantasy elements (arcane gold glows, obsidian/slate dark surfaces, parchment stat accents).
- **Desktop First (Tauri & React)**: Optimized for desktop viewports with fluid window scaling, custom draggable titlebars, split-screen Bento panels, and collapsible drawers.

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

### Action Button Snippet
```tsx
<button className="relative inline-flex items-center justify-center rounded-xl bg-amber-500/10 px-4 py-2 font-sans text-sm font-medium text-amber-300 border border-amber-500/30 transition-all duration-200 hover:bg-amber-500/20 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95">
  Roll Action
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
