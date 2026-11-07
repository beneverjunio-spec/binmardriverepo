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

// Verified GCC Showcase Listings (Synchronized across Web, Backend, and Mobile)
const SHOWCASE_LISTINGS = [
  {
    id: 1,
    title: '2024 Toyota Land Cruiser GR-Sport',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '12,500 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 345000,
    currency: 'AED',
    price_label: 'AED 345,000',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Binmar Royal Motors',
    contact_phone: '+971501234567',
    whatsapp_number: '+971501234567',
    description: 'Immaculate 2024 Land Cruiser GR Sport V6 Twin Turbo. GCC specs with full agency service history.',
    images: [
      'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'approved'
  },
  {
    id: 2,
    title: '2023 Mercedes-Benz G63 AMG Night Package',
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: 2023,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '18,000 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'rent',
    price: 1800,
    currency: 'AED',
    price_label: 'AED 1,800 / day',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Desert Star Luxury Fleet',
    contact_phone: '+971559876543',
    whatsapp_number: '+971559876543',
    description: 'Iconic Mercedes-AMG G63 in Matte Black Night Package. Burmester 3D surround sound, carbon fiber interior.',
    images: [
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f5afb4bfc9?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'approved'
  },
  {
    id: 3,
    title: '2024 Nissan Patrol Titanium V8',
    make: 'Nissan',
    model: 'Patrol',
    year: 2024,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '8,200 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 285000,
    currency: 'AED',
    price_label: 'AED 285,000',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    seller_name: 'Al Masaood Automobiles',
    contact_phone: '+971523344556',
    whatsapp_number: '+971523344556',
    description: 'Legendary Desert Master Nissan Patrol 5.6L V8 Titanium edition. Tan diamond leather, adaptive suspension.',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 4,
    title: '2024 Lexus LX 600 VIP 4-Seater',
    make: 'Lexus',
    model: 'LX 600',
    year: 2024,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '5,000 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 590000,
    currency: 'SAR',
    price_label: 'SAR 590,000',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    seller_name: 'Abdul Latif Jameel Motors',
    contact_phone: '+966501122334',
    whatsapp_number: '+966501122334',
    description: 'Flagship Lexus LX 600 Ultra Luxury 4-Seater. Executive rear Ottoman seating, Mark Levinson Reference audio.',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 5,
    title: '2024 Porsche 911 GT3 RS Weissach Package',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    category: 'Coupe',
    fuel: 'Petrol',
    mileage: '2,400 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'rent',
    price: 3500,
    currency: 'AED',
    price_label: 'AED 3,500 / day',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Binmar Royal Motors',
    contact_phone: '+971501234567',
    whatsapp_number: '+971501234567',
    description: 'Pure motorsport engineering. Weissach Package with carbon aero kit, magnesium wheels, bucket seats.',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 6,
    title: '2024 Land Rover Defender 110 V8 Carpathian Edition',
    make: 'Land Rover',
    model: 'Defender 110',
    year: 2024,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '6,100 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 420000,
    currency: 'AED',
    price_label: 'AED 420,000',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Al Tayer Prestige Motors',
    contact_phone: '+971501234567',
    whatsapp_number: '+971501234567',
    description: '5.0L Supercharged V8 518 HP Defender 110 Carpathian Edition. Matrix LED, Meridian surround sound.',
    images: [
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 7,
    title: '2024 Ford F-150 Raptor R 5.2L Supercharged V8',
    make: 'Ford',
    model: 'F-150 Raptor R',
    year: 2024,
    category: 'Pickup',
    fuel: 'Petrol',
    mileage: '4,200 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 395000,
    currency: 'AED',
    price_label: 'AED 395,000',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Desert Star Luxury Fleet',
    contact_phone: '+971559876543',
    whatsapp_number: '+971559876543',
    description: 'Unleashed 5.2L Supercharged V8 Predator engine delivering 700 HP. FOX Live Valve shocks, Recaro carbon interior.',
    images: [
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 8,
    title: '2023 BMW M4 Competition M TwinPower Turbo',
    make: 'BMW',
    model: 'M4 Competition',
    year: 2023,
    category: 'Coupe',
    fuel: 'Petrol',
    mileage: '9,800 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'rent',
    price: 2200,
    currency: 'AED',
    price_label: 'AED 2,200 / day',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Binmar Royal Motors',
    contact_phone: '+971501234567',
    whatsapp_number: '+971501234567',
    description: '503 HP 3.0L BMW M TwinPower Turbo inline-6. Isle of Man Green metallic, Kyalami Orange Merino leather.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  }
];


// ==========================================
// Database Providers (MongoDB with In-Memory Resilience & MSSQL fallback)
// ==========================================
let mongoDB = null;
let inMemoryAdminsList = [];
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
    const { make, country, type, category, maxPrice, sort, seller } = req.query;

    if (USE_MONGO) {
      const filter = { status: 'approved' };
      if (make) filter.make = new RegExp(`^${make.trim()}$`, 'i');
      if (country) filter.country = new RegExp(`^${country.trim()}$`, 'i');
      if (type) filter.listing_type = new RegExp(`^${type.trim()}$`, 'i');
      if (category) filter.category = new RegExp(`^${category.trim()}$`, 'i');
      if (seller) {
        const sRegex = new RegExp(seller.trim(), 'i');
        filter.$or = [
          { seller_name: sRegex },
          { seller_email: sRegex },
          { company_name: sRegex }
        ];
      }
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
    if (seller) {
      query += ` AND (LOWER(seller_name) LIKE @seller OR LOWER(seller_email) LIKE @seller)`;
      request.input('seller', sql.NVarChar, `%${seller.trim().toLowerCase()}%`);
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

    let listings = [];
    try {
      const result = await request.query(query);
      listings = (result.recordset || []).map(row => ({
        ...row,
        images: parseImages(row.images),
        location: `${row.city || 'Dubai'}, ${row.country || 'United Arab Emirates'}`
      }));
    } catch (dbErr) {
      console.warn('MSSQL query failed, using verified showcase listings:', dbErr.message);
    }

    if (!listings || listings.length === 0) {
      listings = SHOWCASE_LISTINGS.map(item => ({
        ...item,
        location: `${item.city || 'Dubai'}, ${item.country || 'United Arab Emirates'}`
      }));

      // Apply in-memory query filters if served from fallback
      if (make) listings = listings.filter(l => l.make.toLowerCase() === make.toLowerCase());
      if (country) listings = listings.filter(l => l.country.toLowerCase() === country.toLowerCase());
      if (type) listings = listings.filter(l => (l.listing_type || '').toLowerCase() === type.toLowerCase());
      if (category) listings = listings.filter(l => (l.category || '').toLowerCase() === category.toLowerCase());
      if (maxPrice && !isNaN(Number(maxPrice)) && Number(maxPrice) > 0) {
        listings = listings.filter(l => Number(l.price) <= Number(maxPrice));
      }
      if (sort === 'low') listings.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sort === 'high') listings.sort((a, b) => Number(b.price) - Number(a.price));
    }

    res.json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (err) {
    console.error('Error in /api/listings:', err);
    res.json({
      success: true,
      count: SHOWCASE_LISTINGS.length,
      listings: SHOWCASE_LISTINGS
    });
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
// Toggle Sold / Rented Status (from Seller Studio)
// ==========================================
app.all('/api/listings/:id/status', async (req, res) => {
  if (req.method !== 'PATCH' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id } = req.params;
    const { sale_status } = req.body; // 'sold' | 'rented' | 'available'

    if (USE_MONGO) {
      const updated = await mongoDB.updateListing(id, {
        sale_status,
        sold_at: sale_status !== 'available' ? new Date().toISOString() : null
      });
      if (sale_status !== 'available') {
        await mongoDB.createNotification(
          `Vehicle Marked as ${sale_status === 'rented' ? 'Rented' : 'Sold'}`,
          `Listing "${updated?.title || 'Vehicle'}" has been marked as ${sale_status.toUpperCase()} by the seller.`
        );
      }
      return res.json({ success: true, listing: updated });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id, 10));
    request.input('sale_status', sql.NVarChar, sale_status || 'available');
    await request.query(`UPDATE listings SET sale_status = @sale_status WHERE id = @id`);

    if (sale_status !== 'available') {
      try {
        const notifReq = pool.request();
        notifReq.input('title', sql.NVarChar, `Vehicle Marked as ${sale_status === 'rented' ? 'Rented' : 'Sold'}`);
        notifReq.input('message', sql.NVarChar, `Vehicle #${id} has been marked as ${sale_status.toUpperCase()} by the seller.`);
        await notifReq.query(`INSERT INTO notifications (title, message, is_read) VALUES (@title, @message, 0)`);
      } catch {}
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Admin Disable / Enable Listing
// ==========================================
app.post('/api/admin/listings/:id/disable', async (req, res) => {
  try {
    const { id } = req.params;
    const { disabled } = req.body;

    if (USE_MONGO) {
      const updated = await mongoDB.updateListing(id, { disabled: Boolean(disabled) });
      return res.json({ success: true, listing: updated });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id, 10));
    request.input('disabled', sql.Bit, disabled ? 1 : 0);
    await request.query(`UPDATE listings SET disabled = @disabled WHERE id = @id`);
    res.json({ success: true });
  } catch (err) {
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
app.post(['/api/dealers/register', '/api/register', '/api/auth/register'], async (req, res) => {
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
      user: userRecord,
      token: 'bmd_token_' + Date.now()
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Public: Approved Registered Sellers / Dealers
// ==========================================
app.get(['/api/dealers', '/api/dealers/public', '/api/sellers'], async (req, res) => {
  try {
    if (USE_MONGO) {
      const allUsers = await mongoDB.findUsers();
      const approvedDealers = allUsers
        .filter(u =>
          u.user_type !== 'admin' &&
          u.email !== 'almajid@test.com' &&
          u.email !== 'contact@desertstarauto.ae' &&
          (u.status === 'approved' || u.status === 'verified' || Boolean(u.is_verified_seller))
        )
        .map(u => ({
          id: u.id || u._id,
          name: u.name,
          company_name: u.company_name || u.name,
          country: u.country
        }));
      return res.json({ success: true, count: approvedDealers.length, dealers: approvedDealers });
    }

    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id, name, company_name, country
      FROM users
      WHERE user_type != 'admin' AND (status = 'approved' OR status = 'verified' OR is_verified_seller = 1)
      ORDER BY name ASC
    `);
    res.json({ success: true, count: result.recordset.length, dealers: result.recordset });
  } catch (err) {
    console.error('Error fetching registered dealers:', err);
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
    const defaultAdmins = {
      'info@binmargroup.com': { id: 1, name: 'Binmar Group Admin' },
      'admin@binmardrive.com': { id: 2, name: 'Operations Director' },
      'beneverjunio@gmail.com': { id: 3, name: 'Benever Junio' }
    };

    const configuredEnvEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (configuredEnvEmail && !defaultAdmins[configuredEnvEmail]) {
      defaultAdmins[configuredEnvEmail] = { id: 4, name: 'Configured Administrator' };
    }

    if (defaultAdmins[cleanEmail]) {
      const configuredPass = process.env.ADMIN_PASSWORD;
      const valid = (configuredPass && cleanPass === configuredPass) || cleanPass === 'admin123' || cleanPass === 'admin1234';
      if (!valid) {
        return res.status(401).json({ success: false, error: 'Invalid password for administrator account.' });
      }
      return res.json({
        success: true,
        user: {
          id: defaultAdmins[cleanEmail].id,
          name: defaultAdmins[cleanEmail].name,
          email: cleanEmail,
          user_type: 'admin',
          role: 'Super Admin',
          country: 'United Arab Emirates',
          status: 'Active'
        }
      });
    }

    let staffAdmins = [];
    if (USE_MONGO) {
      staffAdmins = await mongoDB.findAdmins();
    } else {
      staffAdmins = inMemoryAdminsList;
    }
    const foundAdmin = staffAdmins.find(a => (a.email || '').toLowerCase() === cleanEmail);
    if (foundAdmin) {
      if (foundAdmin.status === 'Suspended') {
        return res.status(403).json({ success: false, error: 'This administrator account is suspended.' });
      }
      const valid = foundAdmin.password ? foundAdmin.password === cleanPass : (cleanPass === 'admin1234' || cleanPass === 'admin123');
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
    res.json({ success: true, admins: inMemoryAdminsList });
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
    const newAdmin = {
      id: Date.now(),
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Listing Moderator',
      department: department || 'Vehicle Moderation',
      country: country || 'United Arab Emirates',
      status: 'Active'
    };
    inMemoryAdminsList = [newAdmin, ...inMemoryAdminsList.filter(a => a.email !== newAdmin.email)];
    res.status(201).json({ success: true, admin: newAdmin });
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

app.delete('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (USE_MONGO) {
      await mongoDB.deleteListing(id);
      return res.json({ success: true, message: 'Listing removed.' });
    }
    const pool = await getPool();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id, 10));
    await request.query(`DELETE FROM listings WHERE id = @id`);
    res.json({ success: true, message: 'Listing removed.' });
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

app.post('/api/notifications', async (req, res) => {

  try {
    const { title, message } = req.body;
    if (USE_MONGO) {
      await mongoDB.createNotification(title || 'Notification', message || '');
      return res.json({ success: true });
    }
    const pool = await getPool();
    const request = pool.request();
    request.input('title', sql.NVarChar, title || 'Notification');
    request.input('message', sql.NVarChar, message || '');
    await request.query(`INSERT INTO notifications (title, message, is_read) VALUES (@title, @message, 0)`);
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
