const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDB, getIsConnected } = require('./db');
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const adminRoutes = require('./routes/admin');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BinmarDrive API Server',
    database: getIsConnected() ? 'MySQL Connected' : 'Local Fallback Store Ready',
    timestamp: new Date().toISOString()
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family:sans-serif;padding:40px;background:#0A2A1F;color:#F5EFE0;">
        <h1 style="color:#E4C374;">BinmarDrive API Server</h1>
        <p>Node.js & Express Backend running on port ${PORT}</p>
        <p>Status: <b style="color:#9FBBA9;">Online</b></p>
        <p><a href="/api/health" style="color:#C6A15B;">View API Health Check</a></p>
      </body>
    </html>
  `);
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 BinmarDrive Backend API running on http://localhost:${PORT}`);
    console.log(`📡 Ready for React frontend connections`);
    console.log(`=======================================================`);
  });
}).catch(err => {
  console.error('Fatal initialization error:', err);
});
