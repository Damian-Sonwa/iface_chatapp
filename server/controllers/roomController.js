const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');
const GroupReport = require('../models/GroupReport');

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
    const { page = 1, limit = 50, archived } = req.query;
    const showArchived = archived === 'true';

    const cutoffDate = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    await Message.updateMany(
      {
        room: roomId,
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
      room: roomId,
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

// Leave room
exports.leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isMember = room.members.some(member => member.toString() === userId);
    if (!isMember) {
      return res.status(400).json({ error: 'You are not a member of this room' });
    }

    if (room.createdBy.toString() === userId) {
      return res.status(400).json({ error: 'Room owners must delete the room instead of leaving it' });
    }

    room.members = room.members.filter(member => member.toString() !== userId);
    room.admins = (room.admins || []).filter(admin => admin.toString() !== userId);
    await room.save();

    // If there are no members left, delete the room automatically
    if (room.members.length === 0) {
      await Message.deleteMany({ room: roomId });
      await Room.findByIdAndDelete(roomId);
      return res.json({ message: 'You left the room. The room was removed because it no longer had members.' });
    }

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete room (owner/admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isOwner = room.createdBy.toString() === userId;
    const isRoomAdmin = (room.admins || []).some(admin => admin.toString() === userId);

    if (!isOwner && !isRoomAdmin) {
      return res.status(403).json({ error: 'Only room owners or admins can delete this room' });
    }

    await Message.deleteMany({ room: roomId });
    await Room.findByIdAndDelete(roomId);

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Report room
exports.reportRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;
    const { reason, details } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await GroupReport.create({
      room: roomId,
      reportedBy: userId,
      reason: reason.trim(),
      details: details?.trim() || ''
    });

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Report room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


