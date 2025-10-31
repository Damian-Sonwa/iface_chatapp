const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');
const Moment = require('../models/Moment');
const User = require('../models/User');

const router = express.Router();
router.use(authController.verifyToken);

// Reuse uploads folder
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random()*1e9) + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Create moment (text or media)
router.post('/', upload.single('media'), async (req, res) => {
  try {
    const { type, text, gradient, privacy } = req.body;
    if (!type) return res.status(400).json({ error: 'type required' });
    const doc = {
      user: req.userId,
      type,
      text: text || '',
      gradient: gradient || 'orange',
      privacy: privacy || 'public'
    };
    if (req.file) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      doc.media = {
        url: `${baseUrl}/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        mimetype: req.file.mimetype
      };
    }
    const moment = await Moment.create(doc);
    const populated = await moment.populate('user', 'username avatar');
    res.status(201).json({ moment: populated });
  } catch (e) {
    console.error('Create moment error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create (JSON) with AI metadata and moderation
router.post('/create', async (req, res) => {
  try {
    const { content, type = 'text', privacy = 'public', caption = '', tags = [], aiGenerated = false, aiMetadata = null, media = null } = req.body;
    const doc = {
      user: req.userId,
      type,
      text: type === 'text' ? (content || '') : '',
      gradient: 'orange',
      caption,
      tags,
      privacy,
      aiGenerated: !!aiGenerated,
      aiMetadata: aiMetadata || undefined,
      media: media && media.url ? media : undefined
    };

    // Basic moderation
    const { moderateText } = require('../services/moderationService');
    const moderation = moderateText(doc.text || caption || '');
    if (moderation.flagged) {
      doc.status = 'needs_review';
    }

    const moment = await Moment.create(doc);

    // Audit trail for AI content
    if (aiGenerated && aiMetadata) {
      try {
        const AIAudit = require('../models/AIAudit');
        await AIAudit.create({
          user: req.userId,
          prompt: aiMetadata.prompt || '',
          responseSnippet: (doc.text || '').slice(0, 200),
          model: aiMetadata.model || 'gemini',
          moderationResult: moderation
        });
      } catch {}
    }

    const populated = await moment.populate('user', 'username avatar');
    res.status(201).json({ moment: populated });
  } catch (e) {
    console.error('Create moment (JSON) error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Feed
router.get('/feed', async (req, res) => {
  try {
    // Show: public moments from anyone, friends-only moments from your friends, and your own moments
    const me = await User.findById(req.userId).select('friends');
    const friendIds = (me?.friends || []).map(id => id.toString());
    const orConditions = [
      { privacy: 'public' },
      { user: req.userId },
      { $and: [ { privacy: 'friends' }, { user: { $in: friendIds } } ] },
      { $and: [ { privacy: 'close_friends' }, { user: { $in: me?.closeFriends || [] } } ] }
    ];
    const moments = await Moment.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('user', 'username avatar');
    res.json({ moments });
  } catch (e) {
    console.error('Feed error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// React
router.post('/:id/react', async (req, res) => {
  try {
    const { emoji } = req.body;
    await Moment.findByIdAndUpdate(req.params.id, { $push: { reactions: { emoji, user: req.userId } } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// View mark
router.post('/:id/view', async (req, res) => {
  try {
    await Moment.findByIdAndUpdate(req.params.id, { $push: { viewers: { user: req.userId } } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete own
router.delete('/:id', async (req, res) => {
  try {
    const m = await Moment.findOne({ _id: req.params.id, user: req.userId });
    if (!m) return res.status(404).json({ error: 'Not found' });
    await m.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


