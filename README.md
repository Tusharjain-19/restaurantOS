<p align="center">
  <h1 align="center">🍽️ RestaurantOS</h1>
  <p align="center">
    <strong>A Modern, Full-Stack Restaurant POS & Management System</strong>
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
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-Proprietary-red" alt="License" />
</p>

---

## Overview

**RestaurantOS** is a production-grade, cloud-connected Point of Sale (POS) and restaurant management platform. It provides a unified dashboard for managing every aspect of restaurant operations — from taking orders and sending KOTs (Kitchen Order Tickets) to generating GST-compliant bills, tracking inventory, managing staff, and analyzing revenue through real-time reports.

Built with **React + TypeScript** on the frontend and **Supabase (PostgreSQL)** on the backend, RestaurantOS is designed to be fast, reliable, and offline-capable for the demanding restaurant environment.

---

## Features

### 📊 Dashboard
- Real-time overview of active orders, occupied tables, and today's revenue
- Live KPI cards that update automatically via Supabase Realtime
- Daily/monthly performance charts powered by Recharts

### 🛒 Point of Sale (POS)
- Fast, category-based menu browsing with search
- Dine-in, Takeaway, and Delivery order types
- Variant support (Half/Full, Small/Large) with per-variant pricing
- Special instructions per item
- Smart KOT system — tracks each item's kitchen status (`pending → sent → preparing → ready → served`)

### 🪑 Table Management
- Visual floor plan with real-time table status indicators
- Multi-floor support (Main Hall, Terrace, AC Room, etc.)
- Status tracking: Available, Occupied, Reserved, Dirty, Blocked
- One-click table assignment to orders

### 👨‍🍳 Kitchen Display (KDS)
- Dedicated kitchen login (`/kitchen/login`) with role-based access
- Real-time KOT feed — new orders appear instantly via Supabase Realtime
- Add-on KOT support — tracks subsequent item additions as separate kitchen batches
- KOT batch tracking with print-ready snapshots

### 🧾 Billing & Invoicing
- GST-compliant bill generation (CGST + SGST breakdown)
- Discount support (percentage and flat amount with reason tracking)
- Service charge, packaging charge, and delivery charge fields
- Multi-payment split (Cash, UPI, Card, Paytm)
- Professional invoice layout ready for thermal printing (80mm paper)

### 📦 Inventory Management
- Ingredient-level stock tracking
- Low-stock alerts and threshold configuration
- Category-wise inventory organization
- Stock-in/stock-out logging

### 📈 Reports & Analytics
- Revenue reports with date-range filtering (Daily / Weekly / Monthly)
- Category-wise and item-wise sales breakdown
- Table turnover analytics
- Staff performance metrics
- Exportable report data

### 👥 Staff Management
- Role-based access control: `Admin`, `Manager`, `Captain`, `Cashier`, `Kitchen`
- PIN-based quick login for shift staff
- Staff activity tracking with last-login timestamps
- Granular permission system — each role sees only their permitted modules

### 👤 Customer Management
- Customer database with order history
- Phone-based customer lookup
- Repeat customer insights and spending analytics
- Customer profile pages

### ⚙️ Settings & Configuration
- Restaurant profile (name, address, GSTIN, FSSAI)
- Tax configuration
- Printer setup (LAN-based thermal printer support)
- Floor and table layout configuration
- Menu category and item management

### 🔐 Security & Auth
- Supabase Auth with email/password login
- Row-Level Security (RLS) — each restaurant only sees its own data
- Auto-lock screen after 5 minutes of inactivity with PIN re-authentication
- Protected routes for all modules

### 🏢 Super Admin / HQ Panel
- Multi-tenant restaurant management
- Activation key generation and license management
- Restaurant onboarding flow
- Centralized control across all deployed restaurants

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 (SWC plugin) |
| **Routing** | React Router v6 |
| **State Management** | Zustand (global), TanStack React Query (server state) |
| **Offline Cache** | Dexie.js (IndexedDB) |
| **Database & Auth** | Supabase (PostgreSQL + Auth + Realtime + Edge Functions) |
| **Styling** | Tailwind CSS 3 + shadcn/ui components |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | Lucide React |
| **Testing** | Vitest + Testing Library + Playwright (E2E) |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- A **Supabase** project ([create one free](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/Tusharjain-19/restaurantOS.git
cd restaurantOS
```

### 2. Install Dependencies

```bash
cd restaurant-hub-main
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project details:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"
```

> **🔒 Security Note:** The `.env` file is git-ignored and will never be committed. Only `.env.example` (with placeholder values) is tracked.

You can find these values in your Supabase Dashboard under **Settings → API**.

### 4. Set Up the Database

Apply the Supabase migrations to create all required tables:

```bash
# If using Supabase CLI
npx supabase db push
```

Migration files are located in `restaurant-hub-main/supabase/migrations/`.

### 5. Start the Development Server

```bash
npm run dev
```

The app will be available at **`http://localhost:8080`** (or the port shown in your terminal).

### 6. Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## Project Structure

```
restaurantOS/
├── restaurant-hub-main/          # Main application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── auth/             # Auth guards (ProtectedRoute, KitchenProtectedRoute)
│   │   │   ├── onboarding/       # Onboarding step components
│   │   │   ├── sidebar/          # App sidebar & mobile navigation
│   │   │   └── ui/               # shadcn/ui component library
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.ts        # Authentication & role-based access
│   │   │   ├── useRestaurantData.ts      # Core data fetching
│   │   │   ├── useRestaurantRealtime.ts  # Supabase realtime subscriptions
│   │   │   ├── useSendKOT.ts     # KOT dispatch mutation
│   │   │   └── useKeyboardShortcuts.ts   # Keyboard shortcut bindings
│   │   ├── integrations/         # Third-party integrations
│   │   │   └── supabase/         # Supabase client & generated types
│   │   ├── layouts/              # Page layout wrappers
│   │   ├── lib/                  # Utility libraries
│   │   │   ├── supabase.ts       # Supabase client initialization
│   │   │   ├── db.ts             # Dexie offline database
│   │   │   └── utils.ts          # Shared utility functions
│   │   ├── pages/                # Route-level page components
│   │   │   ├── Dashboard.tsx     # Main dashboard with KPIs
│   │   │   ├── POS.tsx           # Point of Sale interface
│   │   │   ├── Tables.tsx        # Floor plan & table management
│   │   │   ├── Kitchen.tsx       # Kitchen display system
│   │   │   ├── Billing.tsx       # Bill generation & settlement
│   │   │   ├── Inventory.tsx     # Stock management
│   │   │   ├── Reports.tsx       # Analytics & reports
│   │   │   ├── Staff.tsx         # Staff management
│   │   │   ├── Customers.tsx     # Customer database
│   │   │   ├── Settings.tsx      # Restaurant configuration
│   │   │   ├── SuperAdmin.tsx    # HQ admin panel
│   │   │   ├── Onboarding.tsx    # New restaurant setup wizard
│   │   │   └── kitchen/Login.tsx # Dedicated kitchen staff login
│   │   ├── stores/               # Zustand global state
│   │   │   └── authStore.ts      # Auth state management
│   │   └── App.tsx               # Root component with routing
│   ├── supabase/
│   │   ├── migrations/           # Database migration SQL files
│   │   └── functions/            # Supabase Edge Functions
│   ├── .env.example              # Environment variable template
│   └── package.json
├── _archive/                     # Archived features (waiter mobile app)
├── docs/                         # Development documentation & reports
├── er_diagram.png                # Database ER diagram
└── README.md                     # ← You are here
```

---

## Database

RestaurantOS uses **Supabase (PostgreSQL)** with the following core tables:

| Table | Purpose |
| :--- | :--- |
| `restaurants` | Restaurant profiles, settings, and configuration |
| `staff` | Staff members with roles, PINs, and access levels |
| `floors` | Restaurant floor areas (Main Hall, Terrace, etc.) |
| `tables` | Individual tables with status tracking |
| `menu_categories` | Menu category organization |
| `menu_items` | Menu items with pricing and availability |
| `menu_variants` | Item size/type variants (Half, Full, etc.) |
| `orders` | Active and historical orders |
| `order_items` | Individual items in each order with KOT batch tracking |
| `kot_batches` | KOT dispatch records with print status |
| `bills` | Generated bills with tax breakdown |
| `bill_payments` | Payment records (supports split payments) |
| `realtime_events` | Real-time notification bus for cross-module events |
| `reservations` | Table reservation management |
| `restaurant_activations` | HQ license key management |
| `hq_admins` | Super admin accounts |

All tables use **Row-Level Security (RLS)** to ensure complete data isolation between restaurants.

### ER Diagram

The database entity-relationship diagram is available at [`er_diagram.png`](./er_diagram.png).

---

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |

> **⚠️ Important:** Never commit your real `.env` file. The `.gitignore` ensures only `.env.example` is tracked.

---

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
