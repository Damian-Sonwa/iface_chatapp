const PrivateChat = require('../models/PrivateChat');
const Message = require('../models/Message');
const User = require('../models/User');

// Get or create private chat
exports.getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    // Check if chat exists
    let chat = await PrivateChat.findOne({
      participants: { $all: [currentUserId, userId] }
    }).populate('participants', 'username avatar status');

    if (!chat) {
      chat = await PrivateChat.create({
        participants: [currentUserId, userId]
      });
      chat = await PrivateChat.findById(chat._id)
        .populate('participants', 'username avatar status');
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all private chats for user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await PrivateChat.find({
      participants: userId
    })
      .populate('participants', 'username avatar status')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get private chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50, archived } = req.query;
    const showArchived = archived === 'true';

    const cutoffDate = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    await Message.updateMany(
      {
        privateChat: chatId,
        isArchived: false,
        createdAt: { $lte: cutoffDate }
      },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date()
        }
      }
    );

    const filter = {
      privateChat: chatId,
      deletedAt: null,
      isArchived: showArchived
    };

    const messages = await Message.find(filter)
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};











