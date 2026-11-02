# 🚗 BinmarDrive — Middle East Vehicle Marketplace

A full-stack automotive marketplace and rental ecosystem built for the GCC region (*United Arab Emirates, Saudi Arabia, Qatar, Oman, Kuwait, and Bahrain*), featuring a **Web App**, **Mobile App (iOS & Android)**, and **REST API Backend**.

🌐 **Live Website & API:** [https://binmardrive.binmargroup.com](https://binmardrive.binmargroup.com)

---

## 📁 Clean Architecture & Folder Layout

```text
binmar-rent-car/
│
├── binmardriverepo/
│   ├── frontend/             # 🌐 Web Application (React 18 + Vite)
│   │   ├── src/              # Pages, Components, Marketplace, Admin UI
│   │   ├── .env              # Frontend environment config (VITE_*)
│   │   ├── .env.example      # Environment template
│   │   └── package.json
│   │
│   ├── backend/              # ⚙️ REST API & Database (Node.js Express + MSSQL)
│   │   ├── config/           # Database & MSSQL pool connection
│   │   ├── routes/           # Auth, Admin, and Listings endpoints
│   │   ├── server.js         # Core Express server (Port 5005)
│   │   ├── .env              # Backend environment config (DB & Ports)
│   │   ├── .env.example      # Environment template
│   │   └── package.json
│   │
│   ├── mobile/               # 📱 Mobile Application (React Native + Expo SDK 58)
│   │   ├── src/              # Screens (Home, Buy/Browse, Sell, Saved, Profile)
│   │   ├── src/services/     # Live API client with unified HTTPS endpoints
│   │   ├── .env              # Mobile environment config (EXPO_PUBLIC_*)
│   │   ├── .env.example      # Environment template
│   │   └── package.json
│   │
│   ├── scripts/              # 🛠️ Build and deployment scripts
│   ├── netlify.toml          # Netlify cloud deployment configuration
│   └── package.json          # Root workspace scripts
│
└── package.json              # Top-level workspace runner
```

---

## 🚀 Quick Start (Running Locally)

### 1. Backend Server (Node.js API)
```bash
cd binmardriverepo
npm run start:backend
# API starts on http://127.0.0.1:5005
```

### 2. Frontend (Web App)
```bash
cd binmardriverepo
npm run dev:frontend
# Web app runs on http://127.0.0.1:5173
```

### 3. Mobile App (Expo / React Native)
```bash
cd binmardriverepo/mobile
npx expo start -c
# Scan the QR code with Expo Go on your physical Android or iPhone
```

---

## 🔗 Shared API Endpoints (Web & Mobile Synchronized)

Both Web and Mobile talk to the same live API: `https://binmardrive.binmargroup.com/api`

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/listings` | `GET` | Fetch all active vehicle listings with filters |
| `/api/listings` | `POST` | Submit a new vehicle listing |
| `/api/auth/register` | `POST` | Register a new user or commercial dealer |
| `/api/auth/login` | `POST` | User & dealer authentication |
| `/api/admin/access` | `POST` | Super Admin portal login |
| `/api/admin/stats` | `GET` | Live marketplace statistics |
| `/api/admin/listings` | `GET` | Manage all listings (approved & pending) |
| `/api/admin/moderation` | `GET` | Vehicle inspection & moderation queue |
| `/api/admin/dealers` | `GET` | Commercial dealer approval queue |
| `/api/admin/moderation/:id/resolve` | `POST` | Approve or reject submitted vehicles |
| `/api/admin/dealers/:id/resolve` | `POST` | Approve or reject dealer applications |
| `/api/admin/listings/:id` | `DELETE` | Remove a listing |
| `/api/notifications` | `GET` | System alert & lead notifications |

---

## 🔐 Environment Variables Summary

Each workspace folder has its own clean `.env` file:
- **`mobile/.env`**: Uses `EXPO_PUBLIC_API_URL` to point to the live API.
- **`frontend/.env`**: Uses `VITE_API_URL` to point to the live API.
- **`backend/.env`**: Configures port, MSSQL connection, and admin credentials.
