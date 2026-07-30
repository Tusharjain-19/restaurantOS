<p align="center">
  <h1 align="center">🍽️ RestaurantOS</h1>
  <p align="center">
    <strong>A Modern, Zero-Setup, Offline-First Restaurant POS & Management System</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#database">Database</a> •
    <a href="#license">License</a>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Dexie_DB-IndexedDB-4A90E2" alt="Dexie" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## Overview

**RestaurantOS** is a production-grade, offline-first Point of Sale (POS) and restaurant management platform. By default, the application runs in a **Zero-Setup / Zero-Auth Guest Mode** that reads and writes all changes directly to your browser's local database (**IndexedDB via Dexie.js**). This lets you test the complete operational flow (taking orders, firing KOTs, and completing payments) instantly without setting up databases or cloud servers.

Built with **React + TypeScript + Tailwind CSS** and restructured to compile directly from the root directory, it is optimized for extremely fast page loading and clean deployments on Vercel.

---

## Key Features

### ⚡ Zero-Setup & Local Sandbox Mode
- **No Login Required:** Auto-generates a local admin guest session on initial launch.
- **Local IndexedDB Storage:** Floors, Tables, Menu Categories, Items, Orders, and Bills are saved directly inside your browser.
- **Minimal Seed Data:** Populates a clean, starter configuration (1 floor, 3 tables, 2 menu categories, and 4 items) for clutter-free testing.
- **Reset App Data:** Use the header/lock screen action to clear local IndexedDB tables, erase LocalStorage, and reload the initial seed layout.

### 🛒 Point of Sale (POS) & Billing
- **Interactive Cart:** Fast, category-based menu browser with search, instructions, and variant selectors.
- **Payment Method Dialog:** Wiring for the **Bill** button to open the settlement panel. Supports Cash, Card, Wallet, and UPI.
- **Dynamic UPI QR Code:** Instantly generates and shows scan-to-pay QR codes based on your restaurant settings.
- **Realistic Thermal Printer Simulation:** Completing an order displays a virtual receipt ticket feeding out of a slot with a realistic **stepper-motor animation** and a **serrated zigzag paper tear** clip-path.

### 👨‍🍳 Redesigned Kitchen Display System (KDS)
- **New Browser Page Tab:** The KDS opens in a new tab (`/kitchen` with `target="_blank"`) so kitchen staff can run it on a separate monitor.
- **Audio Chime Alerts:** Plays a dual-tone synthesizer sound (built with Web Audio API) automatically when new KOTs arrive. Includes a mute toggle button.
- **Clean Dark Dashboard:** High-contrast touch-friendly status columns (New → Preparing → Ready) with vip order flags and warning timers.
- **Print KOT Ticket:** Formats and prints individual kitchen tickets matching standard kitchen printer rolls.
- **Test Order Generator:** Header button to spawn instant mock orders for checking sound notifications and print templates.

### 🪑 Visual Table Layout
- Real-time status tracker (Available, Occupied) mapping floor table states.
- Auto-releases tables to "Available" when orders are paid.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 (SWC compiler) |
| **Routing** | React Router v6 |
| **State Management** | Zustand (global state) |
| **Offline Cache** | Dexie.js (IndexedDB local replica) |
| **Database & Auth** | Supabase (PostgreSQL - optional connection) |
| **Styling** | Tailwind CSS 3 + shadcn/ui components |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Tusharjain-19/restaurantOS.git
cd restaurantOS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:8080`** in your browser. The app runs in zero-setup offline sandbox mode immediately.

> **💡 Vite Cache Troubleshooting:** If you receive a dependency caching warning (e.g. `@radix-ui/react-tooltip` not resolving), restart the dev server using the `--force` flag: `npm run dev -- --force`.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start local Vite server |
| `npm run dev -- --force` | Start Vite clearing dependency caches |
| `npm run build` | Compile optimized production bundle |
| `npm run preview` | Serve build locally |
| `npm run lint` | Run ESLint static check |

---

## License


## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## License

© 2026 RestaurantOS. All rights reserved.
This software is proprietary and intended for professional restaurant management.

Developed by **Tushar Jain** · [GitHub](https://github.com/Tusharjain-19)
