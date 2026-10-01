# 🚗 BinmarDrive — GCC Vehicle Marketplace

**BinmarDrive** is a modern, high-performance vehicle marketplace web application tailored specifically for the GCC (Gulf Cooperation Council) region — covering the United Arab Emirates, Saudi Arabia, Qatar, Oman, Kuwait, and Bahrain.

The platform provides a dual-experience marketplace for both buying/selling and renting vehicles, featuring verified commercial dealer onboarding with trade license checks, individual seller listings, and an administrative moderation control center.

---

## 📑 Documentation Index

This directory contains full documentation for developers, administrators, and DevOps:

1. [**Setup & Installation Guide**](./SETUP_GUIDE.md) — Step-by-step instructions for running BinmarDrive locally or in production.
2. [**API Documentation**](./API_DOCUMENTATION.md) — Comprehensive reference for all REST API endpoints, request bodies, and responses.
3. [**Database Schema & Storage Architecture**](./DATABASE_SCHEMA.md) — MySQL database schema, relational constraints, indices, and the automatic in-memory fallback store.

---

## 🌟 Key Features

### 1. GCC Multi-Country & Multi-Currency Engine
- Seamlessly supports:
  - 🇦🇪 **United Arab Emirates** (`AED`)
  - 🇸🇦 **Saudi Arabia** (`SAR`)
  - 🇶🇦 **Qatar** (`QAR`)
  - 🇴🇲 **Oman** (`OMR`)
  - 🇰🇼 **Kuwait** (`KWD`)
  - 🇧🇭 **Bahrain** (`BHD`)
- Dynamic filtering by country, city, vehicle make, body type (SUV, Sedan, Luxury, Pickup), price range, condition (New vs. Used), and listing type (Sale vs. Rent).

### 2. Dual Listing Engine (Buy / Sell & Rent)
- **Sale Listings**: Full vehicle specs, GCC specifications badge, mileage, transmission, ownership history, and asking price.
- **Rent Listings**: Daily / monthly rental rates, insurance coverage flags, delivery options, and instant rental inquiry.
- **Direct Seller Communication**: Instant 1-click WhatsApp messaging and direct telephone contact links.

### 3. Dealer Onboarding & Trade License Verification
- Two distinct registration pathways:
  - **Individual**: Instant registration for personal vehicle sellers.
  - **Company / Dealership**: Requires company name, trade license number, and documentation upload. Placed in a verification queue until reviewed by the platform administrator.

### 4. Admin Moderation & Operations Dashboard
- **Listing Moderation Queue**: Review, approve, or reject new vehicle listings before they appear in public search.
- **Dealer Approvals**: Review pending company trade licenses and activate commercial dealer privileges.
- **Notifications Hub**: Real-time activity alerts on new dealer submissions and pending vehicle listings.
- **Analytics & Platform Counters**: Live stats on approved listings, pending reviews, verified dealers, and total inventory.

### 5. Resilient Zero-Config Architecture
- Includes an **automatic in-memory fallback store**: If MySQL is not running or credentials are not yet configured, the backend automatically boots with a rich seed dataset so developers and reviewers can test all workflows immediately without external dependencies.
- Automatically connects and syncs to **MySQL** once the database server is online.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 18** | Fast, component-based user interface |
| **Tooling & Bundler** | **Vite 5** | Instant hot module replacement (HMR) and optimized production builds |
| **Styling** | **Custom CSS** | Curated GCC luxury palette (`#0A2A1F` emerald deep green, `#C6A15B` warm gold, `#F5EFE0` sand) |
| **Icons** | **Lucide React** | Modern, lightweight icon suite |
| **Backend API** | **Node.js + Express** | RESTful API server with modular routing |
| **Database** | **MySQL 8.0+** | Persistent relational database with utf8mb4 encoding |
| **Fallback DB** | **In-Memory Store** | Zero-downtime mock dataset built directly into [backend/db.js](../backend/db.js) |
| **Authentication** | **JWT + bcryptjs** | Secure token-based session management and password hashing |
| **File Uploads** | **Multer** | Multipart image and document upload handling |

---

## 📂 Project Directory Structure

```text
Binmar rent project/
├── backend/
│   ├── routes/
│   │   ├── admin.js           # Admin approvals, moderation & stats
│   │   ├── auth.js            # Login, registration, token verification
│   │   ├── listings.js        # Vehicle search, CRUD, uploads & filters
│   │   └── notifications.js   # Notification feed & read status
│   ├── uploads/               # Uploaded vehicle photos and licenses
│   ├── .env                   # Environment variables (port, db credentials)
│   ├── db.js                  # MySQL connection pool + fallback mock store
│   ├── init-db.js             # Automated database creation & schema runner
│   ├── package.json           # Backend dependencies and scripts
│   ├── schema.sql             # SQL table definitions and initial seed rows
│   └── server.js              # Express app entrypoint & API mounting
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main application layout, state & views
│   │   ├── index.css          # Design system, theme variables & animations
│   │   └── main.jsx           # React DOM root render
│   ├── index.html             # HTML5 entrypoint & meta tags
│   ├── package.json           # Frontend dependencies and Vite scripts
│   └── vite.config.js         # Vite configuration with /api & /uploads proxy
└── readme/                    # Complete documentation directory
    ├── README.md              # Project overview (this file)
    ├── SETUP_GUIDE.md         # Installation and running instructions
    ├── API_DOCUMENTATION.md   # Complete REST API reference
    └── DATABASE_SCHEMA.md     # MySQL schema and data dictionary
```

---

## ⚡ Quick Start

### 1. Start the Backend API (Port 5001)
```bash
cd backend
npm install
node server.js
```

### 2. Start the Frontend Application (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

### 3. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** to browse vehicles, test filters, or submit a listing.

---

## 🔐 Default Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@binmardrive.com` | `admin123` | Full Admin Dashboard, Moderation & Dealer Approval |
| **Verified Dealer** | `prestige@dealers.ae` | Any password | Pre-approved commercial dealer |
| **New Individual** | *(Register via UI)* | Any password | Public seller permissions |
