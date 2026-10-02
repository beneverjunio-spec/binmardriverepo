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

Authentication uses Netlify Identity. The Admin Portal accepts the staff account configured in `netlify/functions/api.mts` (email `beneverjunio@gmail.com`; the password is stored only as a salted scrypt hash). On the first successful sign-in, the API creates that Identity account, or restores its password and `admin` role if the account already exists, and the portal then signs in normally.

To rotate the credentials, set the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables in the Netlify dashboard (Functions scope) and redeploy; they override the built-in values. Additional staff can still be invited under Identity and given the `admin` role. Only server-managed Identity roles authorize administrative requests.

## Deployment And Data

`netlify.toml` publishes the React frontend and deploys the API functions together. The deployed API uses Netlify Database with the schema in `db/schema.ts` and migrations in `netlify/database/migrations`. Generate a migration after changing the schema with `npm run db:generate -- --name descriptive_change_name`. Vehicle photos use Netlify Blobs rather than the server filesystem.

The managed database starts empty; dashboard counts reflect actual records, not demo statistics. Historical MySQL or in-memory sample data is not automatically imported. The old `backend/` Express server and the documentation in `readme/` describe the earlier standalone demo, not the deployed authentication or database configuration.

Run `npm run typecheck` to validate the function and database types. Successful staff sign-in requires an enabled Identity service and a confirmed account with the `admin` role.
