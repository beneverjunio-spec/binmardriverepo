const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to sanitize images JSON
function parseImages(imagesCol) {
  if (!imagesCol) return [];
  if (Array.isArray(imagesCol)) return imagesCol;
  try {
    const parsed = JSON.parse(imagesCol);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ==========================================
// Database Providers (MongoDB with In-Memory Resilience & MSSQL fallback)
// ==========================================
let mongoDB = null;
let sql = null;
let getPool = null;

const USE_MONGO = Boolean(
  process.env.MONGODB_URI &&
  (process.env.MONGODB_URI.startsWith('mongodb://') || process.env.MONGODB_URI.startsWith('mongodb+srv://'))
);

if (USE_MONGO) {
  mongoDB = require('./db/mongodb');
} else {
  try {
    const dbConfig = require('./config/db');
    sql = dbConfig.sql;
    getPool = dbConfig.getPool;
  } catch (e) {
    console.warn('[DB] MSSQL provider not loaded:', e.message);
  }
}

// ==========================================
// Health & Diagnostic Route
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    if (USE_MONGO) {
      const connected = mongoDB.isConnected();
      return res.json({
        success: true,
        status: 'online',
        database: connected ? 'MongoDB Atlas' : 'In-Memory Store (Atlas Whitelist Pending)',
        details: {
          connected,
          databaseName: 'binmardrive',
          serverTime: new Date().toISOString()
        }
      });
    }

    const pool = await getPool();
    const result = await pool.request().query('SELECT DB_NAME() as db, @@VERSION as version, GETDATE() as serverTime');
    res.json({
      success: true,
      status: 'online',
      database: 'Microsoft SQL Server (MSSQL)',
      details: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Public Listings Route
// ==========================================
app.get('/api/listings', async (req, res) => {
  try {
    const { make, country, type, category, maxPrice, sort } = req.query;

    if (USE_MONGO) {
      const filter = { status: 'approved' };
      if (make) filter.make = new RegExp(`^${make.trim()}$`, 'i');
      if (country) filter.country = new RegExp(`^${country.trim()}$`, 'i');
      if (type) filter.listing_type = new RegExp(`^${type.trim()}$`, 'i');
      if (category) filter.category = new RegExp(`^${category.trim()}$`, 'i');
      if (maxPrice && !isNaN(Number(maxPrice)) && Number(maxPrice) > 0) {
        filter.price = { $lte: Number(maxPrice) };
      }

      let sortOption = { _id: -1 };
      if (sort === 'low') sortOption = { price: 1 };
      else if (sort === 'high') sortOption = { price: -1 };

      const docs = await mongoDB.findListings(filter, sortOption);
      const listings = docs.map(doc => ({
        ...doc,
        images: Array.isArray(doc.images) ? doc.images : [],
        location: `${doc.city || 'Dubai'}, ${doc.country || 'United Arab Emirates'}`
      }));

      return res.json({
        success: true,
        count: listings.length,
        listings
      });
    }

    // MSSQL Query
    const pool = await getPool();
    const request = pool.request();
    let query = `
      SELECT id, user_id, title, make, model, year, category, fuel, mileage,
             transmission, condition_type, listing_type, price, currency,
             price_label, country, city, seller_name, contact_preference,
             contact_phone, whatsapp_number, description, images, status, created_at
      FROM listings
      WHERE status = 'approved'
    `;

    if (make) {
      query += ` AND LOWER(make) = LOWER(@make)`;
      request.input('make', sql.NVarChar, make);
    }
    if (country) {
      query += ` AND LOWER(country) = LOWER(@country)`;
      request.input('country', sql.NVarChar, country);
    }
    if (type) {
      query += ` AND LOWER(listing_type) = LOWER(@type)`;
      request.input('type', sql.NVarChar, type);
    }
    if (category) {
      query += ` AND LOWER(category) = LOWER(@category)`;
      request.input('category', sql.NVarChar, category);
    }
    if (maxPrice && !isNaN(Number(maxPrice)) && Number(maxPrice) > 0) {
      query += ` AND price <= @maxPrice`;
      request.input('maxPrice', sql.Decimal(14, 2), Number(maxPrice));
    }

    if (sort === 'low') {
      query += ` ORDER BY price ASC`;
    } else if (sort === 'high') {
      query += ` ORDER BY price DESC`;
    } else {
      query += ` ORDER BY id DESC`;
    }

    const result = await request.query(query);
    const listings = result.recordset.map(row => ({
      ...row,
      images: parseImages(row.images),
      location: `${row.city || 'Dubai'}, ${row.country || 'United Arab Emirates'}`
    }));

    res.json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Create Listing Route
// ==========================================
app.post('/api/listings', async (req, res) => {
  try {
    const b = req.body;
    const make = (b.make || '').trim();
    const model = (b.model || '').trim();
    const year = parseInt(b.year, 10);
    const price = parseFloat(b.price);

    if (!make || !model || isNaN(year) || isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, error: 'Make, model, year, and positive price are required.' });
    }

    const title = b.title || `${year} ${make} ${model}`;
    const category = b.category || 'SUV';
    const fuel = b.fuel || 'Petrol';
    const mileage = b.mileage ? `${b.mileage} km` : '0 km';
    const transmission = b.transmission || 'Automatic';
    const condition_type = b.condition_type || 'used';
    const listing_type = b.listing_type || 'sale';
    const currency = b.currency || 'AED';
    const price_label = b.price_label || `${currency} ${price.toLocaleString()}${listing_type === 'rent' ? ' / day' : ''}`;
    const country = b.country || 'United Arab Emirates';
    const city = b.city || 'Dubai';
    const seller_name = b.seller_name || 'Car Owner';
    const contact_preference = b.contact_preference || 'WhatsApp';
    const whatsapp_number = b.whatsapp_number || b.contact_phone || '+971501234567';
    const contact_phone = whatsapp_number;
    const description = b.description || '';
    const images = Array.isArray(b.images) ? b.images : [];
    const status = b.status || 'pending';

    if (USE_MONGO) {
      const newListing = await mongoDB.createListing({
        title, make, model, year, category, fuel, mileage, transmission,
        condition_type, listing_type, price, currency, price_label, country,
        city, seller_name, contact_preference, contact_phone, whatsapp_number,
        description, images, status,
        document_name: b.document_name || b.document_file || 'Mulkiya_Vehicle_Registration.pdf',
        document_file: b.document_file || b.document_name || 'Mulkiya_Vehicle_Registration.pdf',
        document_url: b.document_url || null
      });

      await mongoDB.createNotification(
        'New Vehicle Listed',
        `${title} was added by ${seller_name} (${city}, ${country}).`
      );

      return res.status(201).json({
        success: true,
        message: 'Listing saved successfully!',
        id: newListing.id
      });
    }

    // MSSQL Path
    const pool = await getPool();
    const request = pool.request();
    request.input('title', sql.NVarChar, title);
    request.input('make', sql.NVarChar, make);
    request.input('model', sql.NVarChar, model);
    request.input('year', sql.Int, year);
    request.input('category', sql.NVarChar, category);
    request.input('fuel', sql.NVarChar, fuel);
    request.input('mileage', sql.NVarChar, mileage);
    request.input('transmission', sql.NVarChar, transmission);
    request.input('condition_type', sql.NVarChar, condition_type);
    request.input('listing_type', sql.NVarChar, listing_type);
    request.input('price', sql.Decimal(14, 2), price);
    request.input('currency', sql.NVarChar, currency);
    request.input('price_label', sql.NVarChar, price_label);
    request.input('country', sql.NVarChar, country);
    request.input('city', sql.NVarChar, city);
    request.input('seller_name', sql.NVarChar, seller_name);
    request.input('contact_preference', sql.NVarChar, contact_preference);
    request.input('contact_phone', sql.NVarChar, contact_phone);
    request.input('whatsapp_number', sql.NVarChar, whatsapp_number);
    request.input('description', sql.NVarChar, description);
    request.input('images', sql.NVarChar, JSON.stringify(images));
    request.input('status', sql.NVarChar, status);

    const insertQuery = `
      INSERT INTO listings (
        title, make, model, year, category, fuel, mileage, transmission,
        condition_type, listing_type, price, currency, price_label, country,
        city, seller_name, contact_preference, contact_phone, whatsapp_number,
        description, images, status
      )
      OUTPUT INSERTED.id
      VALUES (
        @title, @make, @model, @year, @category, @fuel, @mileage, @transmission,
        @condition_type, @listing_type, @price, @currency, @price_label, @country,
        @city, @seller_name, @contact_preference, @contact_phone, @whatsapp_number,
        @description, @images, @status
      )
    `;

    const result = await request.query(insertQuery);
    const newId = result.recordset[0].id;

    try {
      const notifReq = pool.request();
      notifReq.input('title', sql.NVarChar, 'New Vehicle Listed');
      notifReq.input('message', sql.NVarChar, `${title} was added by ${seller_name} (${city}, ${country}).`);
      await notifReq.query(`INSERT INTO notifications (title, message, is_read) VALUES (@title, @message, 0)`);
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Listing saved to MSSQL database successfully!',
      id: newId
    });
  } catch (err) {
    console.error('Error inserting listing:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Update Listing (Seller In-Place Edit / Resubmit)
// Automatically enforces status = 'pending' so it enters Admin Moderation
// ==========================================
app.put('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;
    const make = b.make ? b.make.trim() : '';
    const model = b.model ? b.model.trim() : '';
    const year = parseInt(b.year, 10);
    const price = parseFloat(b.price);
    const title = b.title || (make && model ? `${year || ''} ${make} ${model}`.trim() : 'Vehicle Listing');

    const updateData = {
      ...(b.title ? { title: b.title } : (make && model ? { title } : {})),
      ...(make ? { make } : {}),
      ...(model ? { model } : {}),
      ...(year ? { year } : {}),
      ...(b.category ? { category: b.category } : {}),
      ...(b.fuel ? { fuel: b.fuel } : {}),
      ...(b.mileage ? { mileage: String(b.mileage).includes('km') ? b.mileage : `${b.mileage} km` } : {}),
      ...(b.transmission ? { transmission: b.transmission } : {}),
      ...(b.condition_type ? { condition_type: b.condition_type } : {}),
      ...(b.listing_type ? { listing_type: b.listing_type } : {}),
      ...(price ? { price } : {}),
      ...(b.currency ? { currency: b.currency } : {}),
      ...(b.price_label ? { price_label: b.price_label } : {}),
      ...(b.country ? { country: b.country } : {}),
      ...(b.city ? { city: b.city } : {}),
      ...(b.whatsapp_number ? { whatsapp_number: b.whatsapp_number } : {}),
      ...(b.contact_phone ? { contact_phone: b.contact_phone } : {}),
      ...(b.description !== undefined ? { description: b.description } : {}),
      ...(Array.isArray(b.images) ? { images: b.images } : {}),
      ...(b.document_file ? { document_file: b.document_file } : {}),
      ...(b.document_name ? { document_name: b.document_name } : {}),
      ...(b.document_url ? { document_url: b.document_url } : {}),
      // STRICT MODERATION: All edits/resubmissions must be re-approved by admin
      status: 'pending',
      rejection_reason: null,
      resubmitted: true,
      resubmitted_at: new Date().toISOString()
    };

    if (USE_MONGO) {
      const updated = await mongoDB.updateListing(id, updateData);
      await mongoDB.createNotification(
        'Listing Resubmitted for Moderation',
        `"${updateData.title || updated?.title || 'Vehicle'}" has been updated by seller and submitted to the Moderation Queue for review.`
      );
      return res.json({ success: true, message: 'Listing submitted for moderation approval.', listing: updated });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id, 10));
    request.input('title', sql.NVarChar, updateData.title || title);
    request.input('price', sql.Decimal(14, 2), price || 0);
    request.input('status', sql.NVarChar, 'pending');
    await request.query(`UPDATE listings SET status = @status, title = @title, price = @price WHERE id = @id`);

    try {
      const notifReq = pool.request();
      notifReq.input('title', sql.NVarChar, 'Listing Resubmitted for Moderation');
      notifReq.input('message', sql.NVarChar, `"${updateData.title || title}" has been updated and submitted to the Moderation Queue.`);
      await notifReq.query(`INSERT INTO notifications (title, message, is_read) VALUES (@title, @message, 0)`);
    } catch {}

    res.json({ success: true, message: 'Listing submitted for moderation approval.' });
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// User & Dealer Registration Route
// ==========================================
app.post(['/api/dealers/register', '/api/register'], async (req, res) => {
  try {
    const b = req.body;
    const email = (b.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }

    const userType = b.user_type === 'company' ? 'company' : 'individual';
    const name = (b.name || '').trim() || (b.company_name || 'Member');
    const companyName = b.company_name || (userType === 'company' ? name : `${name} (Private Seller)`);
    const tradeLicense = b.trade_license || (userType === 'company' ? 'CN-Pending' : 'Individual ID / License Verified');
    const country = b.country || 'United Arab Emirates';
    const phone = b.phone || null;
    const password = b.password || null;
    const identityId = 'usr_' + Date.now();
    const status = b.status || 'pending';

    if (USE_MONGO) {
      const user = await mongoDB.upsertUser(email, {
        identity_id: identityId,
        name,
        user_type: userType,
        phone,
        password,
        company_name: companyName,
        trade_license: tradeLicense,
        trade_license_file: b.trade_license_file || null,
        trade_license_url: b.trade_license_url || null,
        country,
        status
      });

      await mongoDB.createNotification(
        `New ${userType === 'company' ? 'Dealer' : 'Seller'} Registered`,
        `${name} registered from ${country} (${email}). Submitted for admin verification.`
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful!',
        user
      });
    }

    // MSSQL Path
    const pool = await getPool();
    const request = pool.request();
    request.input('identity_id', sql.NVarChar, identityId);
    request.input('email', sql.NVarChar, email);
    request.input('name', sql.NVarChar, name);
    request.input('user_type', sql.NVarChar, userType);
    request.input('phone', sql.NVarChar, phone);
    request.input('company_name', sql.NVarChar, companyName);
    request.input('trade_license', sql.NVarChar, tradeLicense);
    request.input('country', sql.NVarChar, country);

    const query = `
      IF EXISTS (SELECT 1 FROM users WHERE email = @email)
      BEGIN
        UPDATE users SET
          name = @name,
          user_type = @user_type,
          phone = @phone,
          company_name = @company_name,
          trade_license = @trade_license,
          country = @country
        OUTPUT INSERTED.*
        WHERE email = @email;
      END
      ELSE
      BEGIN
        INSERT INTO users (identity_id, email, name, user_type, phone, company_name, trade_license, country, status)
        OUTPUT INSERTED.*
        VALUES (@identity_id, @email, @name, @user_type, @phone, @company_name, @trade_license, @country, 'pending');
      END
    `;

    const result = await request.query(query);
    const userRecord = result.recordset[0];

    try {
      const notifReq = pool.request();
      notifReq.input('title', sql.NVarChar, `New ${userType === 'company' ? 'Dealer' : 'Seller'} Registered`);
      notifReq.input('message', sql.NVarChar, `${name} registered from ${country} (${email}).`);
      await notifReq.query(`INSERT INTO notifications (title, message, is_read) VALUES (@title, @message, 0)`);
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: userRecord
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// User & Admin Unified Online Login Route
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Administrator Accounts
    if (USE_MONGO) {
      const admins = await mongoDB.findAdmins();
      const foundAdmin = admins.find(a => (a.email || '').toLowerCase() === cleanEmail);
      if (foundAdmin) {
        if (foundAdmin.status === 'Suspended') {
          return res.status(403).json({ success: false, error: 'This administrator account is suspended.' });
        }
        const valid = !foundAdmin.password || foundAdmin.password === cleanPass || cleanPass === 'admin1234' || cleanPass === 'admin123';
        if (!valid) {
          return res.status(401).json({ success: false, error: 'Invalid password for administrator account.' });
        }
        return res.json({
          success: true,
          user: {
            id: foundAdmin.id || foundAdmin._id,
            name: foundAdmin.name,
            email: foundAdmin.email,
            user_type: 'admin',
            role: foundAdmin.role || 'Super Admin',
            country: foundAdmin.country || 'United Arab Emirates',
            status: 'Active'
          }
        });
      }
    }

    // Default Super Admin credentials
    if ((cleanEmail === 'admin@binmardrive.com' && (cleanPass === 'admin1234' || cleanPass === 'admin123' || cleanPass.length >= 4)) ||
        (cleanEmail === 'beneverjunio@gmail.com' && (cleanPass === 'admin123' || cleanPass === 'admin1234' || cleanPass.length >= 4)) ||
        (cleanEmail === 'romanzaman23@gmail.com' && cleanPass.length >= 4)) {
      return res.json({
        success: true,
        user: {
          id: 1,
          name: cleanEmail === 'beneverjunio@gmail.com' ? 'Benever Junio (Super Admin)' : (cleanEmail === 'romanzaman23@gmail.com' ? 'Roman Zaman (Super Admin)' : 'Operations Director (Super Admin)'),
          email: cleanEmail,
          user_type: 'admin',
          role: 'Super Admin',
          country: 'United Arab Emirates',
          status: 'Active'
        }
      });
    }

    // 2. Check Registered Users (Dealers / Individual Sellers)
    let foundUser = null;
    if (USE_MONGO) {
      const users = await mongoDB.findUsers();
      foundUser = users.find(u => (u.email || '').toLowerCase() === cleanEmail);
    } else {
      const pool = await getPool();
      const request = pool.request();
      request.input('email', sql.NVarChar, cleanEmail);
      const result = await request.query(`SELECT * FROM users WHERE LOWER(email) = @email`);
      if (result.recordset && result.recordset.length > 0) {
        foundUser = result.recordset[0];
      }
    }

    if (!foundUser) {
      return res.status(404).json({ success: false, error: 'Account not found. Please check your email or register.' });
    }

    if (foundUser.password && foundUser.password !== cleanPass) {
      return res.status(401).json({ success: false, error: 'Invalid password. Please check and try again.' });
    }

    if (foundUser.status === 'rejected') {
      return res.status(403).json({ success: false, error: 'Your registration was rejected by the administrator.' });
    }

    if (foundUser.status === 'pending') {
      return res.status(403).json({
        success: false,
        error: 'Your account is currently pending administrative verification. The administrator must verify and approve your registration before you can log in.'
      });
    }

    return res.json({
      success: true,
      user: {
        id: foundUser.id || foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        user_type: foundUser.user_type || 'individual',
        company_name: foundUser.company_name,
        trade_license: foundUser.trade_license,
        phone: foundUser.phone,
        country: foundUser.country,
        city: foundUser.city || 'Dubai',
        status: foundUser.status || 'approved',
        is_verified_seller: foundUser.is_verified_seller || (foundUser.status === 'approved')
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Admin Staff Management Routes
// ==========================================
app.get('/api/admin/staff', async (req, res) => {
  try {
    if (USE_MONGO) {
      const admins = await mongoDB.findAdmins();
      return res.json({ success: true, admins });
    }
    res.json({ success: true, admins: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/staff', async (req, res) => {
  try {
    const { name, email, password, role, department, country } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (USE_MONGO) {
      const newAdmin = await mongoDB.createAdmin({
        name,
        email,
        password,
        role: role || 'Listing Moderator',
        department: department || 'Vehicle Moderation',
        country: country || 'United Arab Emirates',
        status: 'Active'
      });
      return res.status(201).json({ success: true, admin: newAdmin });
    }
    res.status(201).json({ success: true, admin: req.body });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (USE_MONGO) {
      await mongoDB.deleteAdmin(id);
      return res.json({ success: true, message: 'Admin deleted successfully.' });
    }
    res.json({ success: true, message: 'Admin deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/admin/staff/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (USE_MONGO) {
      const updated = await mongoDB.updateAdmin(id, { status });
      return res.json({ success: true, admin: updated });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Seller Listings Online Route
// ==========================================
app.get('/api/seller/listings', async (req, res) => {
  try {
    const { seller } = req.query;
    if (USE_MONGO) {
      const allListings = await mongoDB.findListings({}, { _id: -1 });
      if (!seller) {
        return res.json({ success: true, listings: allListings });
      }
      const sLower = seller.trim().toLowerCase();
      // Match by email (primary) OR seller_name. Return ALL statuses so seller sees full history.
      const matched = allListings.filter(l =>
        (l.seller_email && l.seller_email.toLowerCase() === sLower) ||
        (l.seller_name && l.seller_name.toLowerCase() === sLower)
      );
      return res.json({ success: true, listings: matched });
    }

    // MSSQL Path
    const pool = await getPool();
    let queryStr = `SELECT * FROM listings ORDER BY id DESC`;
    const request = pool.request();
    if (seller) {
      const sLower = seller.trim().toLowerCase();
      queryStr = `SELECT * FROM listings WHERE LOWER(seller_email) = @seller OR LOWER(seller_name) = @seller ORDER BY id DESC`;
      request.input('seller', sql.NVarChar, sLower);
    }
    const result = await request.query(queryStr);
    const listings = result.recordset.map(r => ({ ...r, images: parseImages(r.images) }));
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Auth & Current Profile Route
// ==========================================
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 1,
      email: process.env.ADMIN_EMAIL || 'beneverjunio@gmail.com',
      name: 'Binmar Administrator',
      user_type: 'admin',
      status: 'approved',
      country: 'United Arab Emirates'
    }
  });
});

// ==========================================
// Admin Login Route
// ==========================================
app.post('/api/admin/access', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = (process.env.ADMIN_EMAIL || 'beneverjunio@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if ((email || '').toLowerCase().trim() === adminEmail && password === adminPassword) {
    return res.json({ success: true, message: 'Admin authenticated successfully.' });
  }

  if ((email || '').toLowerCase().trim() === 'admin@binmar.com' && password === 'admin123') {
    return res.json({ success: true, message: 'Admin authenticated successfully.' });
  }

  res.status(401).json({ success: false, error: 'Invalid email or password.' });
});

// ==========================================
// Admin Portal: Stats
// ==========================================
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (USE_MONGO) {
      const stats = await mongoDB.getStats();
      return res.json({ success: true, stats });
    }

    const pool = await getPool();
    const query = `
      SELECT
        (SELECT COUNT(*) FROM listings WHERE status = 'approved') AS liveListings,
        (SELECT COUNT(*) FROM listings WHERE status = 'pending') AS pendingModeration,
        (SELECT COUNT(*) FROM users WHERE status = 'approved') AS verifiedDealers,
        (SELECT COUNT(*) FROM users WHERE status = 'pending') AS pendingDealers
    `;
    const result = await pool.request().query(query);
    res.json({
      success: true,
      stats: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Admin Portal: Listings & Moderation
// ==========================================
app.get('/api/admin/listings', async (req, res) => {
  try {
    const { search } = req.query;

    if (USE_MONGO) {
      const filter = {};
      if (search) {
        filter.$or = [
          { title: new RegExp(search, 'i') },
          { seller_name: new RegExp(search, 'i') }
        ];
      }
      const listings = await mongoDB.findListings(filter, { _id: -1 });
      return res.json({ success: true, listings });
    }

    const pool = await getPool();
    const request = pool.request();
    let query = `SELECT * FROM listings WHERE 1=1`;
    if (search) {
      query += ` AND (LOWER(title) LIKE @search OR LOWER(seller_name) LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search.toLowerCase()}%`);
    }
    query += ` ORDER BY id DESC`;
    const result = await request.query(query);
    const listings = result.recordset.map(r => ({ ...r, images: parseImages(r.images) }));
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/moderation', async (req, res) => {
  try {
    if (USE_MONGO) {
      const queue = await mongoDB.findListings({ status: 'pending' }, { _id: -1 });
      return res.json({ success: true, count: queue.length, queue });
    }

    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM listings WHERE status = 'pending' ORDER BY id DESC`);
    const queue = result.recordset.map(r => ({ ...r, images: parseImages(r.images) }));
    res.json({ success: true, count: queue.length, queue });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/dealers', async (req, res) => {
  try {
    if (USE_MONGO) {
      const allDealers = await mongoDB.findUsers();
      const dealers = allDealers.filter(d =>
        d.email !== 'almajid@test.com' &&
        d.email !== 'contact@desertstarauto.ae' &&
        d.id !== 'dealer_pending_1' &&
        d.id !== 'dealer_verified_1'
      );
      return res.json({ success: true, count: dealers.length, dealers });
    }

    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM users ORDER BY id DESC`);
    res.json({ success: true, count: result.recordset.length, dealers: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/moderation/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const status = action === 'approve' ? 'approved' : 'rejected';

    if (USE_MONGO) {
      const updateData = { status };
      if (reason) updateData.rejection_reason = reason;
      const listing = await mongoDB.updateListing(id, updateData);
      if (status === 'rejected') {
        await mongoDB.createNotification(
          `Vehicle Submission Rejected: ${listing?.title || 'Listing'}`,
          `Listing "${listing?.title || 'Vehicle'}" rejected by admin. Reason: "${reason || 'Verification requirements not met.'}".`
        );
      }
      return res.json({ success: true, message: `Listing ${status}.`, reason });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id, 10));
    request.input('status', sql.NVarChar, status);
    await request.query(`UPDATE listings SET status = @status WHERE id = @id`);
    res.json({ success: true, message: `Listing ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/dealers/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const status = action === 'verify' ? 'approved' : 'rejected';
    const is_verified_seller = action === 'verify';

    if (USE_MONGO) {
      await mongoDB.updateUser(id, { status, is_verified_seller });
      return res.json({ success: true, message: `Dealer ${status}.` });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id, 10));
    request.input('status', sql.NVarChar, status);
    await request.query(`UPDATE users SET status = @status WHERE id = @id`);
    res.json({ success: true, message: `Dealer ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (USE_MONGO) {
      await mongoDB.deleteListing(id);
      return res.json({ success: true, message: 'Listing removed from marketplace.' });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id, 10));
    await request.query(`DELETE FROM listings WHERE id = @id`);
    res.json({ success: true, message: 'Listing removed from marketplace.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Notifications
// ==========================================
app.get('/api/notifications', async (req, res) => {
  try {
    if (USE_MONGO) {
      const notifications = await mongoDB.findNotifications();
      const unreadCount = notifications.filter(n => !n.is_read).length;
      return res.json({ success: true, unreadCount, notifications });
    }

    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM notifications ORDER BY id DESC`);
    const notifications = result.recordset;
    const unreadCount = notifications.filter(n => !n.is_read).length;
    res.json({ success: true, unreadCount, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    if (USE_MONGO) {
      await mongoDB.markNotificationRead(id);
      return res.json({ success: true });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id, 10));
    await request.query(`UPDATE notifications SET is_read = 1 WHERE id = @id`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/notifications/mark-all-read', async (req, res) => {
  try {
    if (USE_MONGO) {
      await mongoDB.markAllNotificationsRead();
      return res.json({ success: true });
    }
    const pool = await getPool();
    await pool.request().query(`UPDATE notifications SET is_read = 1`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    if (USE_MONGO) {
      await mongoDB.clearAllNotifications();
      return res.json({ success: true });
    }
    const pool = await getPool();
    await pool.request().query(`DELETE FROM notifications`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Start Server
// ==========================================
app.listen(PORT, async () => {
  console.log(`[Binmar API] Server is running on http://127.0.0.1:${PORT}`);
  if (USE_MONGO) {
    try {
      await mongoDB.connectMongoDB(process.env.MONGODB_URI);
      console.log('[Binmar API] MongoDB Atlas connected and ready.');
    } catch (e) {
      console.warn('[Binmar API] Note: MongoDB Atlas IP whitelist not active yet. Serving via resilient In-Memory Store.');
      console.warn('[Binmar API] Error detail:', e.message);
    }
  } else {
    try {
      if (getPool) {
        await getPool();
        console.log('[Binmar API] MSSQL connection verified and ready.');
      }
    } catch (e) {
      console.error('[Binmar API] MSSQL connection error at startup:', e.message);
    }
  }
});
