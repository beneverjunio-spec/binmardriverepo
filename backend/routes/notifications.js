const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/notifications - Get system notifications for admin
router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM notifications ORDER BY id DESC');
    const unreadCount = rows.filter(n => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      notifications: rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

module.exports = router;
