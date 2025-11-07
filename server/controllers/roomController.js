const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { roomType, techSkillId } = req.query;
    const query = {};
    
    // Filter by room type if provided
    if (roomType) {
      query.roomType = roomType;
    }
    
    // Filter by tech skill if provided
    if (techSkillId) {
      query.techSkillId = techSkillId;
    }
    
    const rooms = await Room.find(query)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('techSkillId', 'name icon description')
      .sort({ createdAt: -1 });

    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create room
exports.createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate, techSkillId, requiresApproval } = req.body;
    const userId = req.userId;

    const room = await Room.create({
      name,
      description: description || '',
      createdBy: userId,
      members: [userId],
      isPrivate: isPrivate || false,
      techSkillId: techSkillId || null,
      requiresApproval: requiresApproval || false
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('techSkillId', 'name icon description');

    res.status(201).json({ room: populatedRoom });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Join room
exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    const room = await Room.findById(roomId).populate('techSkillId');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if room requires skill verification
    if (room.techSkillId) {
      const UserSkillProfile = require('../models/UserSkillProfile');
      const profile = await UserSkillProfile.findOne({ 
        userId, 
        skillId: room.techSkillId._id 
      });
      
      if (!profile || !profile.isVerified) {
        return res.status(403).json({ 
          error: 'You must verify your skill level before joining this group.',
          requiresVerification: true,
          techSkillId: room.techSkillId._id
        });
      }
    }

    // Check if room requires approval (non-tech skill groups)
    if (room.requiresApproval && !room.techSkillId) {
      return res.status(400).json({ 
        error: 'This room requires approval. Please submit a join request.',
        requiresApproval: true
      });
    }

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    const populatedRoom = await Room.findById(roomId)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('techSkillId', 'name icon description');

    res.json({ room: populatedRoom });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get room messages
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('username email avatar status lastSeen statusPhoto statusText statusUpdatedAt')
      .sort({ username: 1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single room details
exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('techSkillId', 'name icon description');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Get room by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


