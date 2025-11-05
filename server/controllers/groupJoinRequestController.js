const GroupJoinRequest = require('../models/GroupJoinRequest');
const Room = require('../models/Room');
const TechSkill = require('../models/TechSkill');
const User = require('../models/User');
const { generateQuestion } = require('../services/questionGenerator');

// Submit join request
exports.submitJoinRequest = async (req, res) => {
  try {
    const { roomId, answer } = req.body;
    const userId = req.userId;
    
    // Get room and check if it requires approval
    const room = await Room.findById(roomId).populate('techSkillId');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Check if user is already a member
    if (room.members.includes(userId)) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }
    
    // Check if there's already a pending request
    const existingRequest = await GroupJoinRequest.findOne({
      roomId,
      userId,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending request for this group' });
    }
    
    // Generate question if tech skill exists
    let question = 'Why do you want to join this group?';
    let techSkillId = null;
    
    if (room.techSkillId) {
      techSkillId = room.techSkillId._id;
      question = generateQuestion(room.techSkillId);
    }
    
    // Validate answer
    if (!answer || answer.trim().length < 10) {
      return res.status(400).json({ error: 'Answer must be at least 10 characters long' });
    }
    
    // Create join request
    const joinRequest = await GroupJoinRequest.create({
      roomId,
      techSkillId,
      userId,
      question,
      answer: answer.trim()
    });
    
    const populatedRequest = await GroupJoinRequest.findById(joinRequest._id)
      .populate('roomId', 'name')
      .populate('techSkillId', 'name icon')
      .populate('userId', 'username email avatar');
    
    res.status(201).json({ request: populatedRequest });
  } catch (error) {
    console.error('Submit join request error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You already have a pending request for this group' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Get join requests for a room (admin only)
exports.getRoomJoinRequests = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;
    
    // Check if user is admin of the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const isAdmin = room.createdBy.toString() === userId.toString() || 
                   room.admins.includes(userId) ||
                   (await User.findById(userId))?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const requests = await GroupJoinRequest.find({ roomId, status: 'pending' })
      .populate('userId', 'username email avatar')
      .populate('techSkillId', 'name icon')
      .sort({ createdAt: -1 });
    
    res.json({ requests });
  } catch (error) {
    console.error('Get room join requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's join requests
exports.getUserJoinRequests = async (req, res) => {
  try {
    const userId = req.userId;
    
    const requests = await GroupJoinRequest.find({ userId })
      .populate('roomId', 'name description')
      .populate('techSkillId', 'name icon')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ requests });
  } catch (error) {
    console.error('Get user join requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve join request (admin only)
exports.approveJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;
    
    const request = await GroupJoinRequest.findById(requestId)
      .populate('roomId');
    
    if (!request) {
      return res.status(404).json({ error: 'Join request not found' });
    }
    
    // Check if user is admin
    const room = request.roomId;
    const isAdmin = room.createdBy.toString() === userId.toString() || 
                   room.admins.includes(userId) ||
                   (await User.findById(userId))?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }
    
    // Add user to room members
    if (!room.members.includes(request.userId)) {
      room.members.push(request.userId);
      await room.save();
    }
    
    // Update request status
    request.status = 'approved';
    request.reviewedBy = userId;
    request.reviewedAt = new Date();
    await request.save();
    
    const populatedRequest = await GroupJoinRequest.findById(requestId)
      .populate('userId', 'username email avatar')
      .populate('roomId', 'name')
      .populate('techSkillId', 'name icon');
    
    res.json({ request: populatedRequest });
  } catch (error) {
    console.error('Approve join request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reject join request (admin only)
exports.rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;
    
    const request = await GroupJoinRequest.findById(requestId)
      .populate('roomId');
    
    if (!request) {
      return res.status(404).json({ error: 'Join request not found' });
    }
    
    // Check if user is admin
    const room = request.roomId;
    const isAdmin = room.createdBy.toString() === userId.toString() || 
                   room.admins.includes(userId) ||
                   (await User.findById(userId))?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }
    
    // Update request status
    request.status = 'rejected';
    request.reviewedBy = userId;
    request.reviewedAt = new Date();
    request.rejectionReason = reason || 'Request rejected';
    await request.save();
    
    const populatedRequest = await GroupJoinRequest.findById(requestId)
      .populate('userId', 'username email avatar')
      .populate('roomId', 'name')
      .populate('techSkillId', 'name icon');
    
    res.json({ request: populatedRequest });
  } catch (error) {
    console.error('Reject join request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

