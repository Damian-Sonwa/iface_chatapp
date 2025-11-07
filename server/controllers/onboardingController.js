const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const { buildUserResponse } = require('../utils/userResponse');

const DEFAULT_WELCOME_GROUP_NAME = process.env.DEFAULT_WELCOME_GROUP_NAME || 'Tech Beginners Lounge';
const DEFAULT_WELCOME_GROUP_DESCRIPTION = process.env.DEFAULT_WELCOME_GROUP_DESCRIPTION || 'Welcome to Tech Beginners Lounge — introduce yourself!';

const sanitizeSkills = (skills = []) => {
  if (!Array.isArray(skills)) return [];
  const unique = new Set();
  skills.forEach(skill => {
    if (typeof skill === 'string') {
      const trimmed = skill.trim();
      if (trimmed) unique.add(trimmed);
    }
  });
  return Array.from(unique);
};

const ensureWelcomeRoom = async (userId) => {
  let room = await Room.findOne({ name: DEFAULT_WELCOME_GROUP_NAME });
  let created = false;

  if (!room) {
    room = await Room.create({
      name: DEFAULT_WELCOME_GROUP_NAME,
      description: DEFAULT_WELCOME_GROUP_DESCRIPTION,
      createdBy: userId,
      members: [userId],
      requiresApproval: false,
      roomType: 'general-info'
    });
    created = true;

    await Message.create({
      room: room._id,
      sender: userId,
      content: 'Welcome to Tech Beginners Lounge — introduce yourself!',
      messageType: 'text'
    });
  }

  return { room, created };
};

const calculateProfileCompletion = (user) => {
  let score = 0;
  let total = 4;

  if (user.avatarUrl || user.avatar) score += 1;
  if (user.bio && user.bio.trim().length > 0) score += 1;
  if (Array.isArray(user.skills) && user.skills.length > 0) score += 1;
  if (user.skillLevel) score += 1;

  return Math.round((score / total) * 100);
};

exports.completeOnboarding = async (req, res) => {
  try {
    const { skills, skillLevel, verificationAnswer } = req.body;
    const normalizedSkills = sanitizeSkills(skills);
    const allowedLevels = ['Beginner', 'Intermediate', 'Professional'];

    if (skillLevel && !allowedLevels.includes(skillLevel)) {
      return res.status(400).json({ error: 'Invalid skill level provided' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.skills = normalizedSkills;
    user.skillLevel = skillLevel || null;
    user.skillVerificationAnswer = verificationAnswer?.trim() || '';
    user.hasOnboarded = true;
    user.onboardingCompletedAt = new Date();
    user.profileCompletion = calculateProfileCompletion(user);

    await user.save();

    const { room } = await ensureWelcomeRoom(req.userId);

    const isMember = room.members.some(memberId => memberId.toString() === req.userId);
    if (!isMember) {
      room.members.push(req.userId);
      await room.save();
    }

    const updatedUser = await User.findById(req.userId).select('-passwordHash -password');

    res.json({
      user: buildUserResponse(updatedUser),
      welcomeRoom: {
        id: room._id,
        name: room.name,
        description: room.description
      }
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
