# 🚗 BinmarDrive — GCC Vehicle Marketplace

> Premium vehicle marketplace and rental platform for the GCC region (UAE, Saudi Arabia, Qatar, Oman, Kuwait, and Bahrain).

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-blue)](./frontend)
[![Netlify Functions](https://img.shields.io/badge/Backend-Netlify%20Functions-green)](./netlify/functions)
[![Database](https://img.shields.io/badge/Database-Netlify%20Postgres-orange)](./db/schema.ts)

---

## 📚 Complete Documentation Folder

Detailed documentation is available in the [**`readme/`**](./readme/) folder:

- 📖 [**Project Overview & Features**](./readme/README.md)
- 🚀 [**Setup & Installation Guide**](./readme/SETUP_GUIDE.md)
- 📡 [**REST API Documentation**](./readme/API_DOCUMENTATION.md)
- 🗄️ [**Database Schema & Architecture**](./readme/DATABASE_SCHEMA.md)

---

## ⚡ Quick Start

```bash
npm install --include=dev
npm --prefix frontend install --include=dev
netlify dev --port 8889
```

Open **[http://localhost:8889](http://localhost:8889)** in your browser. Use Netlify Dev rather than Vite alone so authentication, API routes, and file storage run together.

---

## Staff Sign-In

Authentication uses Netlify Identity. In the site's Netlify dashboard, invite the staff member under Identity and assign the `admin` role to their account. The staff member follows the invitation link to set a password, then signs in through the Admin Portal. Only server-managed Identity roles authorize administrative requests; an email address containing “admin” does not grant access.

There are no default administrator credentials. The former demo login did not verify passwords and is not used by the deployed application. Existing demo accounts must be replaced with real Identity accounts. New public accounts require email confirmation before signing in, unless auto-confirmation is explicitly enabled in Identity settings.

## Deployment And Data

`netlify.toml` publishes the React frontend and deploys the API functions together. The deployed API uses Netlify Database with the schema in `db/schema.ts` and migrations in `netlify/database/migrations`. Generate a migration after changing the schema with `npm run db:generate -- --name descriptive_change_name`. Vehicle photos use Netlify Blobs rather than the server filesystem.

The managed database starts empty; dashboard counts reflect actual records, not demo statistics. Historical MySQL or in-memory sample data is not automatically imported. The old `backend/` Express server and the documentation in `readme/` describe the earlier standalone demo, not the deployed authentication or database configuration.

Run `npm run typecheck` to validate the function and database types. Successful staff sign-in requires an enabled Identity service and a confirmed account with the `admin` role.
