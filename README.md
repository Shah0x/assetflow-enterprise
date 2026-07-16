# AssetFlow — Enterprise IT & Software Asset Management

[![MIT License](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-blue.svg?style=flat-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Node.js / Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com)

**AssetFlow** is a modern, high-fidelity, production-ready Full-Stack IT & Software Asset Management (SAM) platform designed for modern enterprises. Created with an elegant Swiss-modern aesthetic, AssetFlow simplifies tracking hardware lifecycles, global licensing compliance, real-time employee allocation, and maintenance incidents in a single, unified command center.

Designed and developed by **[Shahmeer Akram](https://github.com/Shahmeer-Akram)**.

---

## 📸 Application Preview

> **Pro-Tip**: Add your high-resolution screenshots below to make your GitHub repository stand out.

| 🖥️ Unified Control Dashboard | 📦 Assets Inventory & Advanced Filtering |
| :---: | :---: |
| <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop" width="100%" alt="Dashboard Screenshot Placeholder" /> | <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop" width="100%" alt="Assets Screen Screenshot Placeholder" /> |
| *Visualized metrics, active tickets, and upcoming expirations.* | *Advanced search, multi-factor filtering, and status badge allocations.* |

---

## ✨ Key Features

### 🌟 1. Dynamic Dashboard Widget System
*   **KPI Overview**: Displays critical live telemetry such as **Total Fleet Valuation**, **Assets in Maintenance**, and **Upcoming Warranty Expirations** via elegant, modern cards.
*   **Fluid Motion Feedback**: Leverages state-of-the-art layout animations (`motion/react`) for smooth scale-shifts and hover elevations.
*   **Intuitive Navigation Anchors**: Interactive widget cards scroll the viewport smoothly directly to warning or detail elements (such as Warranty Expirations).

### 🏷️ 2. Advanced Global Asset Registry & Smart Status Badges
*   **Polished Table Layout**: Interactive, high-density matrix displaying asset details, assignments, category symbols, and purchase valuations.
*   **State-driven `StatusBadge` Component**: Reusable component rendering visually clean, color-coded, animated dot-pings for lifecycle conditions (`Available`, `Deployed`, `In Maintenance`, `Retired`, `Defective`).
*   **Complex Table Query Pipeline**: Instantly filter hundreds of items dynamically using the fuzzy Search Bar and Status Dropdown without triggering page reloads.

### 🏢 3. Global Operations Modules
*   **Staff Allocation System**: Easily match company hardware with employees across multiple departments (Engineering, Design, Operations, etc.).
*   **Software & License Compliance**: Mitigate subscription loss with robust warranty trackers and renewal notifications.
*   **Active Maintenance & Ticketing**: Live status checkups, resolution progress timelines, and tech repair details.

---

## 🛠️ Architecture & Tech Stack

```
                     ┌─────────────────────────────┐
                     │     React 19 / Tailwind     │
                     └──────────────┬──────────────┘
                                    │  REST APIs (JSON / JWT)
                     ┌──────────────▼─────────────┐
                     │     Express API Server     │
                     └──────────────┬──────────────┘
                                    │  Mongoose (ODM)
                     ┌──────────────▼─────────────┐
                     │       MongoDB Atlas        │
                     └────────────────────────────┘
```

*   **Frontend UI Engine**: React 19, Vite (optimized production bundling)
*   **Styling & Motion**: Tailwind CSS (Swiss-Modern theme variables), Lucide Icons, `motion/react`
*   **Backend Server**: Node.js, Express, `tsx` (Type-safe live execution)
*   **Asset Compiler**: `esbuild` (bundling custom backend script directly to safe `.cjs` for lightning-fast container startups)
*   **Database Engine**: MongoDB Atlas, Mongoose ODM

---

## 🚀 Step-by-Step Local Setup Instructions

Follow these exact steps to set up, install, and run AssetFlow smoothly inside VS Code:

### 1. Prerequisites
Ensure you have the following installed on your operating system:
*   **Node.js** (v18.x or v20.x recommended)
*   **npm** (comes packaged with Node.js)
*   **MongoDB Atlas Cluster** (or a local running instance of MongoDB)

---

### 2. Configure Environment Secrets
Create a `.env` file in the root directory of your cloned project:

```bash
# In the root folder of the project
touch .env
```

Open the `.env` file and configure your real connection keys. Use the following blueprint:

```env
# MongoDB Atlas Database URI Connection String
MONGODB_URI="mongodb+srv://<db_username>:<db_password>@your-cluster.mongodb.net/assetflow?retryWrites=true&w=majority"

# Generate a high-entropy secret string to secure user JWT sessions
JWT_SECRET="7f892b3c4e5a6f7d8c9b0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u"

# Base application hosting URL (for callback protocols)
APP_URL="http://localhost:3000"
```

> ⚠️ **Important Security Note**: In your **MongoDB Atlas Portal**, verify that your current local IP Address is added to the network access list (**Security > Network Access > Allow Access From Anywhere / whitelist `0.0.0.0/0`**).

---

### 3. CLI Command Guide

Execute these commands inside your VS Code terminal to run, test, and build the system:

#### A. Install Dependencies
Installs all compiled packages, typescript support libraries, and utility components:
```bash
npm install
```

#### B. Start local Development Server
Fires up the backend server and hot-reloading development pipeline concurrently on port 3000:
```bash
npm run dev
```
*   **Application URL**: Open `http://localhost:3000` in your web browser.

#### C. Run Code Linter (Verify Syntax and Types)
Run static analysis checks to ensure code is pristine, standard, and typed correctly:
```bash
npm run lint
```

#### D. Production Compiling & Building
Assembles highly optimized web pages and bundles the typescript server into a single file under the `/dist` directory:
```bash
npm run build
```

#### E. Run Compiled Production Server
Launches the hyper-fast production-ready node service using the built distribution files:
```bash
npm start
```

---

### 4. Injecting Demo Seed Data
If you are running the app for the first time with an empty MongoDB database:
1.  Navigate to the web interface (`http://localhost:3000`).
2.  On the Login Screen, click **"Seed Demo Data"**.
3.  The database will automatically populate with active assets, employee profiles, department templates, and sample maintenance logs.
4.  **Default Administrator Credentials**:
    *   **Email**: `admin@example.com`
    *   **Password**: `password123`

---

## 📁 Key File Structure Highlights

*   `server.ts` — High-efficiency Express Entry Point, setting up development Vite middlewares.
*   `src/components/` — Shared structural UI assets:
    *   `StatusBadge.tsx` — Modular reactive state color indicator tags.
    *   `MetricCard.tsx` — Elevating fluid action metric cards.
*   `src/pages/` — Main application panels:
    *   `Dashboard.tsx` — Multi-tiered visual stats, alert triggers, and compliance modules.
    *   `Assets.tsx` — Advanced inventory database with real-time filters.
*   `src/server/models/` — Strictly enforced Mongoose MongoDB database schemas.
*   `src/server/routes/` — Secure JWT-guarded RESTful controller routes.

---

## 📝 License & Contributions

Distributed under the **MIT License**. See `LICENSE` for more details. Contributions to advance AssetFlow are highly encouraged!

Created with 🤍 by **[Shahmeer Akram](https://github.com/Shahmeer-Akram)**.
