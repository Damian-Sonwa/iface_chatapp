const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    
    const conversations = await Conversation.find({
      participants: userId,
      archivedBy: { $ne: userId }
    })
      .populate('participants', 'username avatarUrl status lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get single conversation
exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId
    })
      .populate('participants', 'username avatarUrl status lastSeen')
      .populate('createdBy', 'username avatarUrl');

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// Create new conversation
exports.createConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, participants, title, description } = req.body;

    if (!type || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Ensure current user is in participants
    if (!participants.includes(userId.toString())) {
      participants.push(userId);
    }

    // For DMs, check if conversation already exists
    if (type === 'dm' && participants.length === 2) {
      const existing = await Conversation.findOne({
        type: 'dm',
        participants: { $all: participants, $size: 2 }
      }).populate('participants', 'username avatarUrl');

      if (existing) {
        return res.json(existing);
      }
    }

    // For groups, title is required
    if (type === 'group' && !title) {
      return res.status(400).json({ error: 'Group conversations require a title' });
    }

    const conversation = await Conversation.create({
      type,
      participants,
      title: type === 'group' ? title : null,
      description: description || '',
      createdBy: userId,
      admins: type === 'group' ? [userId] : []
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'username avatarUrl status lastSeen')
      .populate('createdBy', 'username avatarUrl');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Update conversation
exports.updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, description } = req.body;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check permissions
    if (conversation.type === 'group') {
      const isAdmin = conversation.admins.includes(userId) || 
                     conversation.createdBy.toString() === userId;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can update group conversations' });
      }
    } else if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    if (title) conversation.title = title;
    if (description !== undefined) conversation.description = description;

    await conversation.save();

    const updated = await Conversation.findById(id)
      .populate('participants', 'username avatarUrl status lastSeen')
      .populate('createdBy', 'username avatarUrl');

    res.json(updated);
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Only group admins or DM participants can delete
    if (conversation.type === 'group') {
      const isAdmin = conversation.admins.includes(userId) || 
                     conversation.createdBy.toString() === userId;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can delete group conversations' });
      }
    }

    // For DMs, just remove the user from participants
    if (conversation.type === 'dm') {
      conversation.participants = conversation.participants.filter(
        p => p.toString() !== userId
      );
      await conversation.save();
    } else {
      // For groups, delete the conversation
      await Conversation.findByIdAndDelete(id);
      // Optionally delete all messages
      await Message.deleteMany({ conversationId: id });
    }

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

// Archive conversation
exports.archiveConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.archivedBy.includes(userId)) {
      conversation.archivedBy.push(userId);
      await conversation.save();
    }

    res.json({ message: 'Conversation archived' });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({ error: 'Failed to archive conversation' });
  }
};

// Unarchive conversation
exports.unarchiveConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    conversation.archivedBy = conversation.archivedBy.filter(
      id => id.toString() !== userId
    );
    await conversation.save();

    res.json({ message: 'Conversation unarchived' });
  } catch (error) {
    console.error('Error unarchiving conversation:', error);
    res.status(500).json({ error: 'Failed to unarchive conversation' });
  }
};

// Pin conversation
exports.pinConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.pinnedBy.includes(userId)) {
      conversation.pinnedBy.push(userId);
      await conversation.save();
    }

    res.json({ message: 'Conversation pinned' });
  } catch (error) {
    console.error('Error pinning conversation:', error);
    res.status(500).json({ error: 'Failed to pin conversation' });
  }
};

// Unpin conversation
exports.unpinConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    conversation.pinnedBy = conversation.pinnedBy.filter(
      id => id.toString() !== userId
    );
    await conversation.save();

    res.json({ message: 'Conversation unpinned' });
  } catch (error) {
    console.error('Error unpinning conversation:', error);
    res.status(500).json({ error: 'Failed to unpin conversation' });
  }
};

