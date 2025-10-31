const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authController = require('../controllers/authController');

router.use(authController.verifyToken);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -twoFactorSecret');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile (including vibe and theme)
router.patch('/profile', async (req, res) => {
  try {
    const { username, bio, avatar, vibe, theme, autoVibe, preferredLanguage } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (avatar) updates.avatar = avatar;
    if (vibe !== undefined) updates.vibe = vibe;
    if (theme !== undefined) updates.theme = theme;
    if (autoVibe !== undefined) updates.autoVibe = autoVibe;
    if (preferredLanguage) updates.preferredLanguage = preferredLanguage;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update status text
router.patch('/status-text', async (req, res) => {
  try {
    const { statusText } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { statusText: statusText || '', statusUpdatedAt: new Date() },
      { new: true }
    ).select('-password -twoFactorSecret');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update auto-translate setting for a chat/room
router.post('/auto-translate', async (req, res) => {
  try {
    const { chatId, enabled } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user.autoTranslate) {
      user.autoTranslate = new Map();
    }
    
    if (enabled) {
      user.autoTranslate.set(chatId, true);
    } else {
      user.autoTranslate.delete(chatId);
    }
    
    await user.save();
    
    res.json({ success: true, autoTranslate: Object.fromEntries(user.autoTranslate) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Manage close friends
router.post('/close-friends/add', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const me = await User.findById(req.userId);
    if (!me.closeFriends) me.closeFriends = [];
    if (!me.closeFriends.find(id => id.toString() === userId)) me.closeFriends.push(userId);
    await me.save();
    res.json({ closeFriends: me.closeFriends });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/close-friends/remove', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const me = await User.findById(req.userId);
    me.closeFriends = (me.closeFriends || []).filter(id => id.toString() !== userId);
    await me.save();
    res.json({ closeFriends: me.closeFriends });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Block user
router.post('/:userId/block', async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    const user = await User.findById(currentUserId);
    if (!user.blockedUsers.includes(targetUserId)) {
      user.blockedUsers.push(targetUserId);
      await user.save();
    }

    // Add to blocked by list of target
    const targetUser = await User.findById(targetUserId);
    if (!targetUser.blockedBy.includes(currentUserId)) {
      targetUser.blockedBy.push(currentUserId);
      await targetUser.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Unblock user
router.post('/:userId/unblock', async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.userId;

    const user = await User.findById(currentUserId);
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetUserId);
    await user.save();

    const targetUser = await User.findById(targetUserId);
    targetUser.blockedBy = targetUser.blockedBy.filter(id => id.toString() !== currentUserId);
    await targetUser.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user preferences
router.get('/preferences', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('preferences');
    res.json({ preferences: user.preferences || { soundEnabled: true, messageAnimations: true, notificationsEnabled: true } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user preferences
router.patch('/preferences', async (req, res) => {
  try {
    const { soundEnabled, messageAnimations, notificationsEnabled } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user.preferences) {
      user.preferences = {};
    }
    
    if (soundEnabled !== undefined) user.preferences.soundEnabled = soundEnabled;
    if (messageAnimations !== undefined) user.preferences.messageAnimations = messageAnimations;
    if (notificationsEnabled !== undefined) user.preferences.notificationsEnabled = notificationsEnabled;
    
    await user.save();
    res.json({ preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset preferences to defaults
router.post('/preferences/reset', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.preferences = {
      soundEnabled: true,
      messageAnimations: true,
      notificationsEnabled: true
    };
    await user.save();
    res.json({ preferences: user.preferences, message: 'Preferences reset to defaults' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
