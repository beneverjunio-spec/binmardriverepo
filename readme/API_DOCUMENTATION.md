# 📡 BinmarDrive — REST API Documentation

The BinmarDrive backend provides a standard JSON REST API. All endpoints are prefixed with `/api`.

When accessing through the frontend development server (`http://localhost:3000`), requests to `/api/*` are reverse-proxied to the backend (`http://localhost:5001`).

---

## 🟢 System & Health

### Health Check
Check the operational status of the API server and database connection mode.

- **URL**: `GET /api/health`
- **Auth Required**: No
- **Success Response (200)**:
```json
{
  "status": "ok",
  "service": "BinmarDrive API Server",
  "database": "MySQL Connected" // or "Local Fallback Store Ready"
  "timestamp": "2026-10-01T09:30:00.000Z"
}
```

---

## 🔐 Authentication Endpoints (`/api/auth`)

### 1. User Registration
Registers an individual user or a commercial dealer. Individual accounts are auto-approved; company accounts receive a `pending` status pending trade license verification.

- **URL**: `POST /api/auth/register`
- **Auth Required**: No
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "user_type": "company", // "individual" | "company"
  "name": "Al Rasheed Motors",
  "email": "contact@alrasheed.sa",
  "phone": "+966501234567",
  "company_name": "Al Rasheed Motors",
  "trade_license": "CN-2214590",
  "country": "Saudi Arabia",
  "city": "Riyadh"
}
```
- **Success Response (200)**:
```json
{
  "success": true,
  "user": {
    "id": 15,
    "user_type": "company",
    "name": "Al Rasheed Motors",
    "email": "contact@alrasheed.sa",
    "phone": "+966501234567",
    "company_name": "Al Rasheed Motors",
    "trade_license": "CN-2214590",
    "status": "pending",
    "country": "Saudi Arabia"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful! Your trade license is submitted to the admin for verification."
}
```

### 2. User Login
Authenticate as an individual seller, verified dealer, or administrator.

- **URL**: `POST /api/auth/login`
- **Auth Required**: No
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "admin@binmardrive.com",
  "password": "admin123"
}
```
- **Success Response (200)**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "user_type": "admin",
    "name": "Binmar Admin",
    "email": "admin@binmardrive.com",
    "phone": "+971500000000",
    "status": "approved",
    "country": "United Arab Emirates"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Verify Token
Verifies an existing JWT token and returns the current user profile.

- **URL**: `GET /api/auth/verify`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200)**:
```json
{
  "success": true,
  "user": { ... }
}
```

---

## 🚙 Listings Endpoints (`/api/listings`)

### 1. Get Approved Listings
Fetches public vehicle listings with optional query filtering.

- **URL**: `GET /api/listings`
- **Query Parameters**:
  - `country` (optional): e.g. `United Arab Emirates`, `Saudi Arabia`
  - `type` (optional): `sale` or `rent`
  - `category` (optional): `SUV`, `Sedan`, `Luxury`, `Pickup`
  - `condition` (optional): `new` or `used`
  - `search` (optional): search string matching make, model, or title
- **Success Response (200)**:
```json
{
  "success": true,
  "count": 12,
  "listings": [
    {
      "id": 1,
      "title": "2024 Toyota Land Cruiser",
      "make": "Toyota",
      "model": "Land Cruiser",
      "year": 2024,
      "category": "SUV",
      "fuel": "Petrol",
      "mileage": "1,200 km",
      "transmission": "Automatic",
      "condition_type": "new",
      "listing_type": "sale",
      "price": 385000,
      "currency": "AED",
      "price_label": "AED 385,000",
      "country": "United Arab Emirates",
      "city": "Abu Dhabi",
      "seller_name": "Individual",
      "contact_preference": "WhatsApp",
      "contact_phone": "+971501234567",
      "description": "Single owner, GCC specs, full agency service history.",
      "status": "approved",
      "created_at": "2026-10-01T09:00:00.000Z"
    }
  ]
}
```

### 2. Get Listing by ID
- **URL**: `GET /api/listings/:id`
- **Success Response (200)**: Returns single listing object.

### 3. Create Vehicle Listing
Submits a vehicle listing for admin moderation.

- **URL**: `POST /api/listings`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "2023 Mercedes-Benz S500",
  "make": "Mercedes-Benz",
  "model": "S500",
  "year": 2023,
  "category": "Luxury",
  "fuel": "Petrol",
  "mileage": "15,000 km",
  "transmission": "Automatic",
  "condition_type": "used",
  "listing_type": "sale",
  "price": 490000,
  "currency": "AED",
  "country": "United Arab Emirates",
  "city": "Dubai",
  "seller_name": "Sheikh Autos",
  "contact_preference": "WhatsApp",
  "contact_phone": "+971509988776",
  "description": "Mint condition, panoramic roof, GCC specs.",
  "images": []
}
```
- **Success Response (201)**:
```json
{
  "success": true,
  "message": "Listing submitted successfully and is pending admin review.",
  "listing_id": 201
}
```

### 4. Upload Vehicle Images
- **URL**: `POST /api/listings/upload`
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: Form data with key `images` (supports multiple files)
- **Response**: Array of uploaded static file paths (e.g., `/uploads/car-1727771234.jpg`)

---

## 🛡️ Admin Endpoints (`/api/admin`)

*All `/api/admin` routes require an `Authorization: Bearer <token>` header belonging to an admin user.*

### 1. Dashboard Overview Stats
- **URL**: `GET /api/admin/stats`
- **Success Response (200)**:
```json
{
  "success": true,
  "stats": {
    "total_listings": 14,
    "approved_listings": 12,
    "pending_listings": 2,
    "total_dealers": 3,
    "pending_dealers": 2
  }
}
```

### 2. Get Pending Moderation Queue
- **URL**: `GET /api/admin/pending`
- **Success Response (200)**:
```json
{
  "success": true,
  "pending_listings": [ ... ],
  "pending_dealers": [ ... ]
}
```

### 3. Moderate Listing (Approve / Reject)
- **URL**: `PATCH /api/admin/listings/:id/status`
- **Request Body**:
```json
{
  "status": "approved" // or "rejected"
}
```

### 4. Moderate Dealer (Approve / Reject Trade License)
- **URL**: `PATCH /api/admin/dealers/:id/status`
- **Request Body**:
```json
{
  "status": "approved" // or "rejected"
}
```

---

## 🔔 Notifications Endpoints (`/api/notifications`)

### 1. Get Notification Feed
- **URL**: `GET /api/notifications`
- **Success Response (200)**:
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "type": "dealer",
      "title": "New Dealer Registration",
      "message": "Al Rasheed Motors submitted trade license for verification.",
      "is_read": false,
      "created_at": "2026-10-01T09:15:00.000Z"
    }
  ]
}
```

### 2. Mark Notification as Read
- **URL**: `PATCH /api/notifications/:id/read`
- **Success Response (200)**: `{ "success": true }`
