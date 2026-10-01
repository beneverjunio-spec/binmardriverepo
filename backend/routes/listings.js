const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Multer storage for uploaded vehicle images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/listings/upload - Upload vehicle images
router.post('/upload', upload.array('photos', 12), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({
      success: true,
      images: fileUrls
    });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// GET /api/listings - Get approved public listings with filtering
router.get('/', async (req, res) => {
  try {
    const { make, country, type, category, maxPrice, search, sort } = req.query;

    let rows = await db.query("SELECT * FROM listings WHERE status = 'approved' ORDER BY id DESC");

    // Apply filtering
    if (make) {
      rows = rows.filter(l => l.make && l.make.toLowerCase() === make.toLowerCase());
    }
    if (country) {
      rows = rows.filter(l => l.country && l.country.toLowerCase() === country.toLowerCase());
    }
    if (type) {
      rows = rows.filter(l => l.listing_type === type);
    }
    if (category) {
      rows = rows.filter(l => l.category && l.category.toLowerCase() === category.toLowerCase());
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      rows = rows.filter(l => Number(l.price) <= max);
    }
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(l =>
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.make && l.make.toLowerCase().includes(q)) ||
        (l.model && l.model.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.country && l.country.toLowerCase().includes(q))
      );
    }

    // Apply sorting
    if (sort === 'low') {
      rows.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'high') {
      rows.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      // Default: newest first
      rows.sort((a, b) => b.id - a.id);
    }

    res.json({
      success: true,
      count: rows.length,
      listings: rows
    });
  } catch (err) {
    console.error('Fetch listings error:', err);
    res.status(500).json({ error: 'Failed to fetch listings: ' + err.message });
  }
});

// GET /api/listings/:id - Get single listing details
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rows = await db.query('SELECT * FROM listings WHERE id = ?', [id]);
    const listing = rows && rows[0];

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({
      success: true,
      listing
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching listing details' });
  }
});

// POST /api/listings - Create listing (Enters moderation queue as pending)
router.post('/', async (req, res) => {
  try {
    const {
      make, model, year, category, fuel, mileage, transmission,
      condition_type, listing_type, price, currency, country, city,
      seller_name, contact_preference, contact_phone, description, images
    } = req.body;

    if (!make || !model || !price) {
      return res.status(400).json({ error: 'Make, model, and price are required' });
    }

    const title = `${year || new Date().getFullYear()} ${make} ${model}`;
    const curr = currency || 'AED';
    const numPrice = parseFloat(price) || 0;
    const priceLabel = `${curr} ${numPrice.toLocaleString()}${listing_type === 'rent' ? ' / day' : ''}`;

    const sql = `
      INSERT INTO listings (
        title, make, model, year, category, fuel, mileage, transmission,
        condition_type, listing_type, price, currency, price_label, country, city,
        seller_name, contact_preference, contact_phone, description, images, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const params = [
      title,
      make,
      model,
      parseInt(year || 2024, 10),
      category || 'SUV',
      fuel || 'Petrol',
      mileage ? `${mileage} km` : '0 km',
      transmission || 'Automatic',
      condition_type || 'new',
      listing_type || 'sale',
      numPrice,
      curr,
      priceLabel,
      country || 'United Arab Emirates',
      city || 'Abu Dhabi',
      seller_name || 'Guest Seller',
      contact_preference || 'WhatsApp',
      contact_phone || '+971501234567',
      description || 'Clean vehicle, well maintained.',
      JSON.stringify(images || [])
    ];

    const result = await db.query(sql, params);
    const newId = result.insertId || Date.now();

    res.json({
      success: true,
      listingId: newId,
      message: 'Listing submitted successfully! It is now in the admin moderation queue for review.'
    });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Failed to submit listing: ' + err.message });
  }
});

module.exports = router;
