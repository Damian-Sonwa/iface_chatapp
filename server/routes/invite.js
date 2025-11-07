const express = require('express');
const crypto = require('crypto');
const Invite = require('../models/Invite');
const User = require('../models/User');
const authController = require('../controllers/authController');

const router = express.Router();

// Create invite
router.post('/create', authController.verifyToken, async (req, res) => {
  try {
    const token = crypto.randomBytes(16).toString('hex');
    const invite = await Invite.create({ token, inviter: req.userId });
    const inviter = await User.findById(req.userId).select('username');
    const clientUrl = process.env.CLIENT_URL || 'https://chaturway001.netlify.app';
    // Use query param for simplicity in client routing
    const link = `${clientUrl}/login?invite=${token}`;
    res.json({ token, link, inviter: inviter?.username || 'Someone' });
  } catch (err) {
    console.error('Create invite error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get invite info
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await Invite.findOne({ token }).populate('inviter', 'username');
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.expiresAt && invite.expiresAt < new Date()) return res.status(410).json({ error: 'Invite expired' });
    res.json({ token, inviter: invite.inviter?.username || 'Someone' });
  } catch (err) {
    console.error('Get invite error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;











