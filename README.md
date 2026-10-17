# 🚗 BinmarDrive — GCC Vehicle Marketplace

A full-stack, serverless automotive marketplace and rental platform built for the GCC region (*United Arab Emirates, Saudi Arabia, Qatar, Oman, Kuwait, and Bahrain*).

---

## 🌟 Key Features

- **Public Vehicle Marketplace**: Filter vehicles by Make, Country, Category (SUV, Sedan, Pickup, Luxury), Listing Type (Buy/Rent), and Price.
- **Listing Creation Wizard**: Multi-step vehicle submission workflow with image upload support.
- **Commercial Dealer Verification**: Business verification system with trade license review.
- **Administrative Portal**: Complete management portal with real-time statistics, listing moderation queue, dealer approval workflow, and live inventory management.
- **Regional Support**: Built-in support for GCC currencies (AED, SAR, QAR, KWD, BHD, OMR) and phone formatting.

---

## 🏗️ Architecture & Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Lucide Icons | Modular Single Page Application (SPA) with clean component hierarchy |
| **Backend / API** | Netlify Functions (TypeScript) | Serverless REST API endpoints for listings, moderation, and notifications |
| **Database** | PostgreSQL + Drizzle ORM | Type-safe schema definition and query builder |
| **Authentication** | Netlify Identity | Role-based authorization (`individual`, `company`, `admin`) |
| **Storage** | Netlify Blobs | Cloud blob storage for vehicle imagery |

---

## 📁 Project Structure

```text
binmardriverepo/
├── frontend/                   # 🌐 Dedicated Frontend Application
│   ├── src/
│   │   ├── api/                # API client & domain service modules
│   │   │   ├── admin.js        # Moderation and admin operations API
│   │   │   ├── auth.js         # Authentication profile & error handlers
│   │   │   ├── client.js       # Base HTTP client
│   │   │   └── listings.js     # Public listings and photo uploads
│   │   ├── components/         # Reusable UI components
│   │   │   ├── admin/          # Admin portal components & tabs
│   │   │   ├── common/         # Navbar, Footer, Toast
│   │   │   └── marketplace/    # Cards, detail modals, category chips
│   │   ├── constants/          # GCC regional data & application constants
│   │   ├── pages/              # Clean routed page views
│   │   ├── App.jsx             # Main application orchestrator
│   │   ├── index.css           # Design system and stylesheets
│   │   └── main.jsx            # Application entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    # ⚙️ Dedicated Backend Application
│   ├── db/                     # Database schema & ORM client
│   │   ├── index.ts            # Database connection helper
│   │   └── schema.ts           # Drizzle ORM PostgreSQL schema
│   ├── functions/              # Serverless API functions
│   │   ├── api.mts             # Primary REST API handler
│   │   └── photos.mts          # Photo upload and blob storage handler
│   ├── drizzle.config.ts       # Database migration configuration
│   ├── package.json            # Backend dependencies & scripts
│   └── tsconfig.json           # Backend TypeScript configuration
│
├── netlify.toml                # Netlify deployment and routing configuration
├── package.json                # Root workspace configuration and scripts
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install --include=dev
npm --prefix frontend install --include=dev
npm --prefix backend install --include=dev
```

### 2. Run Local Development Server
Use Netlify Dev so that frontend, backend serverless functions, identity, and database run together:
```bash
npx netlify dev --port 8889
```

Open [http://localhost:8889](http://localhost:8889) in your browser.

---

## 🛡️ Authentication & Administration

1. **User Accounts**: Users can register as an *Individual Owner* or *Commercial Dealer*.
2. **Staff / Admin Access**:
   - Invite staff members through the **Netlify Identity** dashboard.
   - Assign the `admin` role to the account.
   - Staff members accept the invite, set a password, and log in via the **Admin Portal**.
   - Role-based authorization is enforced at both the API layer and the UI layer.

---

## 📜 Available Scripts

- `npm run dev`: Starts the unified local dev environment on port 8889.
- `npm run dev:frontend`: Runs the Vite frontend development server independently.
- `npm run build`: Compiles the frontend for production distribution.
- `npm run typecheck`: Runs TypeScript checks across backend functions and database schemas.
- `npm run db:generate`: Generates new Drizzle schema migrations.

---

*Last build trigger: 2026-10-17 14:23 UTC*
