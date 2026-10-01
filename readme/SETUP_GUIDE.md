# 🚀 BinmarDrive — Setup & Installation Guide

This guide covers complete instructions for installing, configuring, running, and troubleshooting the **BinmarDrive** application on Windows, macOS, or Linux.

---

## 📋 System Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later (bundled with Node.js)
- *(Optional)* **MySQL**: v8.0 or later (if you wish to use a persistent MySQL database instead of the built-in fallback store)

To verify your Node.js and npm versions:
```bash
node -v
npm -v
```

> [!NOTE]
> On Windows PowerShell, if you encounter the error `File npm.ps1 cannot be loaded because running scripts is disabled on this system`, either run `cmd.exe /c "npm ..."` or set PowerShell execution policy via:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

---

## 📦 Step-by-Step Installation

### Step 1: Clone or Navigate to the Workspace
Open a terminal in the project root directory:
```bash
cd "Binmar rent project"
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables
Inside the `backend/` directory, check or edit the `.env` file:
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=binmardrive_db
DB_PORT=3306

# Authentication & Security
JWT_SECRET=binmar_drive_super_secure_secret_key_2026
ADMIN_EMAIL=admin@binmardrive.com
ADMIN_PASSWORD=admin123
```

### Step 4: Install Frontend Dependencies
From the root directory or from `backend/`:
```bash
cd ../frontend
npm install
```

---

## 🏃 Running the Application

Both servers should be running simultaneously for full functionality.

### Terminal 1: Backend API Server
```bash
cd backend
npm start
# or for auto-reloading during development:
npm run dev
```
The backend will launch on **`http://localhost:5001`**.

If MySQL is running, it will automatically connect and create required tables. If MySQL is not running, it will display:
```text
[BinmarDrive DB] MySQL not currently available. Using built-in local store with full seed data.
🚀 BinmarDrive Backend API running on http://localhost:5001
```

### Terminal 2: Frontend Development Server
```bash
cd frontend
npm run dev
```
The Vite development server will start on **`http://localhost:3000`**.

### Accessing the Web Application
Open your web browser and navigate to:
👉 **`http://localhost:3000`**

The Vite frontend automatically proxies API requests (`/api/*`) and static uploads (`/uploads/*`) to the backend server running on port `5001`.

---

## 🗄️ Optional: Setting Up MySQL Database

If you wish to run a dedicated MySQL database:

1. **Start your MySQL server** (e.g., via MySQL Workbench, XAMPP, Homebrew, or Docker).
   
   If using Docker:
   ```bash
   docker run --name binmar-mysql -e MYSQL_ROOT_PASSWORD="" -e MYSQL_DATABASE=binmardrive_db -p 3306:3306 -d mysql:8.0
   ```

2. **Run the Database Initialization Script**:
   ```bash
   cd backend
   npm run db:init
   ```
   This will create the database, all tables (`users`, `listings`, `notifications`), indices, and populate it with seed GCC vehicle listings and admin accounts.

3. **Restart the backend server**:
   ```bash
   node server.js
   ```
   The backend will log:
   ```text
   [BinmarDrive DB] Successfully connected to MySQL database: binmardrive_db on localhost:3306
   [BinmarDrive DB] MySQL tables verified & initialized.
   ```

---

## 🏗️ Building for Production

### Build Frontend Bundle
```bash
cd frontend
npm run build
```
This generates optimized, minified production assets in `frontend/dist/`.

### Preview Production Build
```bash
npm run preview
```

---

## 🔧 Common Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 5001 in use** | Another process is occupying port 5001 | Change `PORT=5002` in `backend/.env` and update the proxy target in `frontend/vite.config.js`. |
| **Port 3000 in use** | Another app is running on port 3000 | Vite will automatically offer port 3001 or you can change `server.port` in `frontend/vite.config.js`. |
| **CORS errors** | Directly requesting backend from an unpermitted origin | Access the app via `http://localhost:3000`. The Vite proxy handles requests seamlessly. |
| **Uploads missing** | Uploads directory hasn't been created | The backend automatically creates `backend/uploads/` on boot. Check folder permissions if it fails. |
