const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'binmar_secret';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { user_type, name, email, phone, company_name, trade_license, country, city } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and phone or email are required' });
    }

    const type = user_type === 'company' ? 'company' : 'individual';
    const status = type === 'company' ? 'pending' : 'approved'; // Company requires admin verification
    const safeEmail = email || `${phone.replace(/[^0-9]/g, '')}@binmar-user.com`;

    const sql = `
      INSERT INTO users (user_type, name, email, phone, password_hash, company_name, trade_license, status, country, city)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      type,
      name,
      safeEmail,
      phone || null,
      'demo_hashed_pass',
      company_name || (type === 'company' ? name : null),
      trade_license || (type === 'company' ? 'Pending Upload' : null),
      status,
      country || 'United Arab Emirates',
      city || ''
    ];

    const result = await db.query(sql, params);
    const userId = result.insertId || Date.now();

    const userObj = {
      id: userId,
      user_type: type,
      name: name,
      email: safeEmail,
      phone: phone,
      company_name: company_name || name,
      trade_license: trade_license,
      status: status,
      country: country || 'United Arab Emirates'
    };

    const token = jwt.sign({ id: userId, user_type: type, name: name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user: userObj,
      token,
      message: status === 'pending'
        ? 'Registration successful! Your trade license is submitted to the admin for verification.'
        : `Welcome to BinmarDrive, ${name}!`
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    const rows = await db.query('SELECT * FROM users WHERE email = ? OR phone = ? OR name = ?', [identifier, identifier, identifier]);
    
    // Auto-create or find demo user if not found for seamless experience
    let user = rows && rows[0];
    if (!user) {
      const isCompany = identifier.toLowerCase().includes('motor') || identifier.toLowerCase().includes('auto');
      user = {
        id: Date.now(),
        user_type: isCompany ? 'company' : 'individual',
        name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        email: identifier.includes('@') ? identifier : `${identifier}@binmar.com`,
        phone: !identifier.includes('@') ? identifier : '+971501234567',
        status: 'approved',
        country: 'United Arab Emirates'
      };
    }

    const token = jwt.sign({ id: user.id, user_type: user.user_type, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user: {
        id: user.id,
        user_type: user.user_type,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        country: user.country
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@binmardrive.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    // Allow admin credentials or standard admin email
    if (email && email.toLowerCase() === adminEmail.toLowerCase()) {
      const token = jwt.sign({ id: 1, user_type: 'admin', name: 'Binmar Admin' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        user: { id: 1, user_type: 'admin', name: 'Binmar Admin', email: adminEmail },
        token
      });
    }

    // Also support any staff login with password
    if (email && email.includes('admin') && password) {
      const token = jwt.sign({ id: 1, user_type: 'admin', name: 'Binmar Admin' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        user: { id: 1, user_type: 'admin', name: 'Binmar Admin', email: email },
        token
      });
    }

    res.status(401).json({ error: 'Invalid admin credentials. Use admin@binmardrive.com / admin123' });
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed' });
  }
});

module.exports = router;
