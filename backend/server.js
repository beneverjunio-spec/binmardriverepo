require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sql, getPool } = require('./config/db');

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
// Health & Diagnostic Route
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
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

    const { make, country, type, category, maxPrice, sort } = req.query;

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
    const pool = await getPool();
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
    const imagesJson = JSON.stringify(Array.isArray(b.images) ? b.images : []);
    const status = 'approved'; // Instant display or 'pending' for moderation

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
    request.input('images', sql.NVarChar, imagesJson);
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

    // Insert admin notification
    try {
      const notifReq = pool.request();
      notifReq.input('title', sql.NVarChar, 'New Vehicle Listed');
      notifReq.input('message', sql.NVarChar, `${title} was added by ${seller_name} (${city}, ${country}).`);
      await notifReq.query(`INSERT INTO notifications (title, message, is_read) VALUES (@title, @message, 0)`);
    } catch (e) {
      console.warn('Failed to insert notification:', e.message);
    }

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
// User & Dealer Registration Route
// ==========================================
app.post(['/api/dealers/register', '/api/register'], async (req, res) => {
  try {
    const pool = await getPool();
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
    const identityId = 'usr_' + Date.now();

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
        VALUES (@identity_id, @email, @name, @user_type, @phone, @company_name, @trade_license, @country, 'approved');
      END
    `;

    const result = await request.query(query);
    const userRecord = result.recordset[0];

    // Create notification
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

  // Also accept fallback credentials
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
    const pool = await getPool();
    const { search } = req.query;
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
    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM users ORDER BY id DESC`);
    res.json({ success: true, count: result.recordset.length, dealers: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/moderation/:id/resolve', async (req, res) => {
  try {
    const pool = await getPool();
    const { id } = req.params;
    const { action } = req.body;
    const status = action === 'approve' ? 'approved' : 'rejected';
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
    const pool = await getPool();
    const { id } = req.params;
    const { action } = req.body;
    const status = action === 'verify' ? 'approved' : 'rejected';
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
    const pool = await getPool();
    const { id } = req.params;
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
    const pool = await getPool();
    const { id } = req.params;
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id, 10));
    await request.query(`UPDATE notifications SET is_read = 1 WHERE id = @id`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`[Binmar API] Server is running on http://127.0.0.1:${PORT}`);
  try {
    await getPool();
    console.log('[Binmar API] MSSQL connection verified and ready.');
  } catch (e) {
    console.error('[Binmar API] MSSQL connection error at startup:', e.message);
  }
});
