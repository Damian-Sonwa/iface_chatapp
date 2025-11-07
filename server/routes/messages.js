const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Room = require('../models/Room');
const authController = require('../controllers/authController');

// All routes require authentication
router.use(authController.verifyToken);

// Search messages within a room or private chat
router.get('/search', async (req, res) => {
  try {
    const { roomId, chatId, q, limit = 50 } = req.query;

    if (!q || !q.trim()) {
      return res.json({ messages: [] });
    }

    if (!roomId && !chatId) {
      return res.status(400).json({ error: 'roomId or chatId is required' });
    }

    const contentRegex = new RegExp(q.trim(), 'i');

    const query = {
      deletedAt: null,
      content: contentRegex
    };

    if (roomId) {
      query.room = roomId;
    }

    if (chatId) {
      query.privateChat = chatId;
    }

    const messages = await Message.find(query)
      .where('content').ne('This message was deleted')
      .where('content').ne('This message has disappeared')
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit, 10) || 50, 100))
      .populate('sender', 'username avatar')
      .populate('replyTo', 'content sender')
      .lean();

    res.json({ messages });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit message
router.patch('/:messageId/edit', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate('sender', 'username avatar')
      .populate('replyTo', 'content sender');

    res.json({ message: populatedMessage });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const isRoom = message.room !== null;
    if (isRoom) {
      const room = await Room.findById(message.room);
      const isAdmin = room?.admins?.includes(userId) || room?.createdBy.toString() === userId;
      
      if (message.sender.toString() !== userId && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (message.sender.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    message.deleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    res.json({ success: true, message });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Pin message
router.post('/:messageId/pin', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId).populate('room');
    if (!message || !message.room) {
      return res.status(404).json({ error: 'Message or room not found' });
    }

    const room = message.room;
    const isAdmin = room.admins?.includes(userId) || room.createdBy.toString() === userId;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can pin messages' });
    }

    message.pinned = true;
    message.pinnedBy = userId;
    message.pinnedAt = new Date();
    await message.save();

    if (!room.pinnedMessages?.includes(messageId)) {
      room.pinnedMessages = room.pinnedMessages || [];
      room.pinnedMessages.push(messageId);
      await room.save();
    }

    const populatedMessage = await Message.findById(messageId)
      .populate('sender', 'username avatar')
      .populate('pinnedBy', 'username');

    res.json({ message: populatedMessage });
  } catch (error) {
    console.error('Pin message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unpin message
router.post('/:messageId/unpin', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId).populate('room');
    if (!message || !message.room) {
      return res.status(404).json({ error: 'Message or room not found' });
    }

    const room = message.room;
    const isAdmin = room.admins?.includes(userId) || room.createdBy.toString() === userId;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can unpin messages' });
    }

    message.pinned = false;
    message.pinnedBy = null;
    message.pinnedAt = null;
    await message.save();

    room.pinnedMessages = room.pinnedMessages?.filter(id => id.toString() !== messageId) || [];
    await room.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Unpin message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pinned messages for a room
router.get('/room/:roomId/pinned', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const pinnedMessages = await Message.find({
      _id: { $in: room.pinnedMessages || [] },
      pinned: true
    })
      .populate('sender', 'username avatar')
      .populate('pinnedBy', 'username')
      .sort({ pinnedAt: -1 });

    res.json({ messages: pinnedMessages });
  } catch (error) {
    console.error('Get pinned messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;











