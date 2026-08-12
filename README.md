# ⚔️ dndDesktopApp — Dungeon Master Companion App

<div align="center">

![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?style=for-the-badge&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-Exclusive-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-Bento_Grid-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Una aplicación de escritorio moderna, elegante y de alto rendimiento para Dungeon Masters y jugadores de D&D.**  
Diseñada con estética **Bento Grid**, efectos de **glassmorphism**, temas oscuros de fantasía y separación estricta de arquitecturas.

---

</div>

## 📌 Visión del Proyecto

**dndDesktopApp** combina la velocidad de ejecutables nativos impulsados por **Rust (Tauri v2)** con una interfaz reactiva e hiper-fluida construida en **React 19, TypeScript y Tailwind CSS**.

### 🌟 Características Clave & Diseño
- **🏛️ Arquitectura Bento Grid**: Paneles modulares estilo Bento Grid con bordes translúcidos, esquinas `rounded-2xl` y efectos hover interactivos.
- **🎨 Estética Fantasía Oscura**: Paleta inspirada en Obsidian & Arcane Gold (`#d4af37`), acentos de vida, maná y estados mágicos.
- **⚡ Rendimiento Nativo**: Procesamiento pesado, sistema de archivos local y almacenamiento seguro gestionado directamente por Rust en `src-tauri`.
- **🛡️ Tipado Estricto**: Garantía de cero tipos `any` en TypeScript y comunicación segura frontend-backend mediante comandos invocados de Tauri.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Función |
| :--- | :--- | :--- |
| **Escritorio Nativo** | [Tauri v2](https://tauri.app/) (Rust) | Lógica de negocio, base de datos local y acceso al SO |
| **Frontend UI** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Presentación visual y estado del cliente |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com/) | Diseño Bento Grid, glassmorphism y animaciones |
| **Gestor de Paquetes** | [pnpm](https://pnpm.io/) | Gestor exclusivo de dependencias |

---

## ⚙️ Configuración del IDE Recomendada

- [VS Code](https://code.visualstudio.com/)
- Extensión [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- Extensión [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

---

## 🚀 Comandos Principales para Desarrollar

> ⚠️ **Importante**: La aplicación se ejecuta desde la raíz del proyecto. Todos los comandos deben ejecutarse utilizando `pnpm`.

### 1️⃣ Instalar dependencias
```bash
pnpm install
```

### 2️⃣ Iniciar en modo desarrollo (Frontend + Tauri Desktop)
```bash
pnpm tauri dev
```

### 3️⃣ Probar solo la interfaz en el navegador
```bash
pnpm dev
```

### 4️⃣ Construir el ejecutable de producción
```bash
pnpm tauri build
```

---

## 📂 Estructura del Proyecto

```text
dndDesktopApp/
├── .agents/                # 🤖 Configuración y reglas para el Agente AI
│   ├── AGENTS.md           # Reglas y estándares del Agente de IA
│   └── STYLE.md            # Sistema de diseño, tokens Tailwind y componentes Bento
├── src/                    # 🎨 UI de React + TypeScript (Interfaz de usuario)
├── src-tauri/              # 🦀 Rust Backend (Tauri, sistema de archivos y lógica)
├── index.html              # Punto de entrada HTML
├── package.json            # Configuración del paquete y scripts pnpm
├── tsconfig.json           # Configuración de TypeScript
└── vite.config.ts          # Configuración del empaquetador Vite
```

---

<div align="center">

Desarrollado para la mejor experiencia en mesa de rol. ⚔️🎲

</div>
