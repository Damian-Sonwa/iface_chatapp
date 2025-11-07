const Classroom = require('../models/Classroom');
const Room = require('../models/Room');
const TechSkill = require('../models/TechSkill');
const UserSkillProfile = require('../models/UserSkillProfile');
const ClassSession = require('../models/ClassSession');
const ClassMaterial = require('../models/ClassMaterial');
const User = require('../models/User');

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const isInstructorOrAdmin = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return false;
  return user.role === 'admin' || user.isAdmin || user.role === 'instructor';
};

const findTechSkillByKey = async (key) => {
  const skills = await TechSkill.find({ isActive: true }).select('name');
  return skills.find(skill => {
    const slug = slugify(skill.name);
    return slug === key || skill._id.toString() === key;
  });
};

const formatSession = (session) => ({
  ...session,
  isPast: session.startTime ? new Date(session.startTime) < new Date() : false
});

// Get all classrooms for a tech skill
exports.getClassrooms = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.userId;

    const classrooms = await Classroom.find({ techSkillId: skillId, isActive: true })
      .populate('createdBy', 'username avatar')
      .populate('instructors', 'username avatar')
      .populate('techSkillId', 'name icon description')
      .lean();

    // Add subscription status for each classroom
    const classroomsWithStatus = classrooms.map(classroom => {
      const isSubscribed = classroom.subscribers.some(
        sub => sub.user.toString() === userId && sub.subscriptionStatus === 'active'
      );
      return {
        ...classroom,
        isSubscribed,
        subscriberCount: classroom.subscribers.filter(s => s.subscriptionStatus === 'active').length
      };
    });

    res.json({ classrooms: classroomsWithStatus });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single classroom
exports.getClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const userId = req.userId;

    const classroom = await Classroom.findById(classroomId)
      .populate('createdBy', 'username avatar')
      .populate('instructors', 'username avatar')
      .populate('techSkillId', 'name icon description')
      .populate('roomId', 'name description members')
      .lean();

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const isSubscribed = classroom.subscribers.some(
      sub => sub.user.toString() === userId && sub.subscriptionStatus === 'active'
    );

    res.json({
      classroom: {
        ...classroom,
        isSubscribed,
        subscriberCount: classroom.subscribers.filter(s => s.subscriptionStatus === 'active').length
      }
    });
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Subscribe to classroom
exports.subscribeToClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const userId = req.userId;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Check if user is already subscribed
    const existingSubscription = classroom.subscribers.find(
      sub => sub.user.toString() === userId
    );

    if (existingSubscription && existingSubscription.subscriptionStatus === 'active') {
      return res.status(400).json({ error: 'You are already subscribed to this classroom' });
    }

    // Check if user has verified skill profile for this tech skill
    const profile = await UserSkillProfile.findOne({
      userId,
      skillId: classroom.techSkillId,
      isVerified: true
    });

    if (!profile) {
      return res.status(403).json({
        error: 'You must verify your skill level before subscribing to the classroom'
      });
    }

    // Add subscription
    if (existingSubscription) {
      existingSubscription.subscriptionStatus = 'active';
      existingSubscription.subscribedAt = Date.now();
    } else {
      classroom.subscribers.push({
        user: userId,
        subscribedAt: Date.now(),
        subscriptionStatus: 'active'
      });
    }

    await classroom.save();

    // Add user to classroom room if not already a member
    const room = await Room.findById(classroom.roomId);
    if (room && !room.members.map(m => m.toString()).includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    res.json({
      message: 'Successfully subscribed to classroom',
      classroom,
      room
    });
  } catch (error) {
    console.error('Subscribe to classroom error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Unsubscribe from classroom
exports.unsubscribeFromClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const userId = req.userId;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const subscription = classroom.subscribers.find(
      sub => sub.user.toString() === userId
    );

    if (!subscription || subscription.subscriptionStatus !== 'active') {
      return res.status(400).json({ error: 'You are not subscribed to this classroom' });
    }

    subscription.subscriptionStatus = 'cancelled';
    await classroom.save();

    res.json({ message: 'Successfully unsubscribed from classroom' });
  } catch (error) {
    console.error('Unsubscribe from classroom error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create classroom (admin/instructor only)
exports.createClassroom = async (req, res) => {
  try {
    const { name, description, techSkillId, price, features } = req.body;
    const userId = req.userId;

    if (!await isInstructorOrAdmin(userId)) {
      return res.status(403).json({ error: 'Instructor or admin permissions required' });
    }

    if (!name || !techSkillId) {
      return res.status(400).json({ error: 'Name and tech skill ID are required' });
    }

    const techSkill = await TechSkill.findById(techSkillId);
    if (!techSkill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }

    const room = await Room.create({
      name: `${name} Classroom`,
      description: description || `Classroom for ${techSkill.name}`,
      createdBy: userId,
      members: [userId],
      isPrivate: false,
      techSkillId: techSkillId,
      roomType: 'classroom',
      requiresApproval: false
    });

    const classroom = await Classroom.create({
      name,
      description,
      techSkillId,
      createdBy: userId,
      instructors: [userId],
      roomId: room._id,
      price: price || 0,
      features: features || {
        liveSessions: true,
        assignments: true,
        resources: true,
        certificates: false
      }
    });

    room.classroomId = classroom._id;
    await room.save();

    const populatedClassroom = await Classroom.findById(classroom._id)
      .populate('createdBy', 'username avatar')
      .populate('techSkillId', 'name icon description')
      .populate('roomId', 'name description');

    res.status(201).json({
      message: 'Classroom created successfully',
      classroom: populatedClassroom,
      room
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSkillSessions = async (req, res) => {
  try {
    const { skillKey } = req.params;
    const skill = await findTechSkillByKey(skillKey);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const classrooms = await Classroom.find({ techSkillId: skill._id }).select('_id name');
    const classroomIds = classrooms.map(cls => cls._id);
    const classroomNameMap = classrooms.reduce((acc, cls) => {
      acc[cls._id.toString()] = cls.name;
      return acc;
    }, {});

    const sessions = await ClassSession.find({ classroom: { $in: classroomIds } })
      .populate('instructor', 'username avatar role')
      .populate('classroom', 'name')
      .sort({ startTime: 1 })
      .lean();

    res.json({
      skill: { id: skill._id, name: skill.name, slug: slugify(skill.name) },
      sessions: sessions.map(session => ({
        ...formatSession(session),
        classroomName: classroomNameMap[(session.classroom?._id || session.classroom || '').toString()] || session.classroom?.name || 'Classroom'
      }))
    });
  } catch (error) {
    console.error('Get skill sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get sessions for a classroom
exports.getClassroomSessions = async (req, res) => {
  try {
    const { classroomId } = req.params;

    const sessions = await ClassSession.find({ classroom: classroomId })
      .populate('instructor', 'username avatar role')
      .sort({ startTime: 1 })
      .lean();

    res.json({ sessions: sessions.map(formatSession) });
  } catch (error) {
    console.error('Get classroom sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getClassroomSessionDetail = async (req, res) => {
  try {
    const { classroomId, sessionId } = req.params;

    const session = await ClassSession.findOne({ _id: sessionId, classroom: classroomId })
      .populate('instructor', 'username avatar role bio')
      .populate({ path: 'materials', populate: { path: 'uploadedBy', select: 'username avatar role' } })
      .populate({ path: 'discussion.user', select: 'username avatar' })
      .lean();

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session: formatSession(session) });
  } catch (error) {
    console.error('Get classroom session detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Schedule a new session
exports.createClassroomSession = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { title, description, startTime, endTime, meetingLink, meetingPlatform, sessionType, recordingLink, tags } = req.body;
    const userId = req.userId;

    if (!await isInstructorOrAdmin(userId)) {
      return res.status(403).json({ error: 'Instructor or admin permissions required' });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const session = await ClassSession.create({
      classroom: classroomId,
      title,
      description,
      instructor: userId,
      startTime,
      endTime,
      meetingLink,
      meetingPlatform: meetingPlatform || null,
      sessionType: sessionType || 'live',
      recordingLink,
      tags: tags || []
    });

    const populated = await ClassSession.findById(session._id)
      .populate('instructor', 'username avatar role')
      .lean();

    res.status(201).json({ session: formatSession(populated) });
  } catch (error) {
    console.error('Create classroom session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update session
exports.updateClassroomSession = async (req, res) => {
  try {
    const { classroomId, sessionId } = req.params;
    const updates = req.body;
    const userId = req.userId;

    if (!await isInstructorOrAdmin(userId)) {
      return res.status(403).json({ error: 'Instructor or admin permissions required' });
    }

    const session = await ClassSession.findOne({ _id: sessionId, classroom: classroomId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    Object.assign(session, updates);
    await session.save();

    const populated = await ClassSession.findById(session._id)
      .populate('instructor', 'username avatar role')
      .lean();

    res.json({ session: formatSession(populated) });
  } catch (error) {
    console.error('Update classroom session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete session
exports.deleteClassroomSession = async (req, res) => {
  try {
    const { classroomId, sessionId } = req.params;
    const userId = req.userId;

    if (!await isInstructorOrAdmin(userId)) {
      return res.status(403).json({ error: 'Instructor or admin permissions required' });
    }

    const session = await ClassSession.findOneAndDelete({ _id: sessionId, classroom: classroomId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await ClassMaterial.updateMany({ session: sessionId }, { $set: { session: null } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete classroom session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Materials
exports.getClassroomMaterials = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const materials = await ClassMaterial.find({ classroom: classroomId })
      .populate('uploadedBy', 'username avatar role')
      .populate('session', 'title startTime')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ materials });
  } catch (error) {
    console.error('Get classroom materials error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createClassroomMaterial = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { title, description, type, link, sessionId } = req.body;
    const userId = req.userId;

    if (!await isInstructorOrAdmin(userId)) {
      return res.status(403).json({ error: 'Instructor or admin permissions required' });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const material = await ClassMaterial.create({
      classroom: classroomId,
      session: sessionId || null,
      title,
      description,
      type,
      link,
      uploadedBy: userId
    });

    if (sessionId) {
      await ClassSession.findByIdAndUpdate(sessionId, { $addToSet: { materials: material._id } });
    }

    const populated = await ClassMaterial.findById(material._id)
      .populate('uploadedBy', 'username avatar role')
      .populate('session', 'title startTime')
      .lean();

    res.status(201).json({ material: populated });
  } catch (error) {
    console.error('Create classroom material error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateClassroomMaterial = async (req, res) => {
  try {
    const { classroomId, materialId } = req.params;
    const updates = req.body;
    const userId = req.userId;

    if (!await isInstructorOrAdmin(userId)) {
      return res.status(403).json({ error: 'Instructor or admin permissions required' });
    }

    const material = await ClassMaterial.findOne({ _id: materialId, classroom: classroomId });
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    Object.assign(material, updates);
    await material.save();

    const populated = await ClassMaterial.findById(material._id)
      .populate('uploadedBy', 'username avatar role')
      .populate('session', 'title startTime')
      .lean();

    res.json({ material: populated });
  } catch (error) {
    console.error('Update classroom material error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteClassroomMaterial = async (req, res) => {
  try {
    const { classroomId, materialId } = req.params;
    const userId = req.userId;

    if (!await isInstructorOrAdmin(userId)) {
      return res.status(403).json({ error: 'Instructor or admin permissions required' });
    }

    const material = await ClassMaterial.findOneAndDelete({ _id: materialId, classroom: classroomId });
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    await ClassSession.updateMany({ materials: materialId }, { $pull: { materials: materialId } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete classroom material error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addMaterialComment = async (req, res) => {
  try {
    const { classroomId, materialId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const material = await ClassMaterial.findOne({ _id: materialId, classroom: classroomId });
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    material.comments.push({ user: userId, content });
    await material.save();

    const populated = await ClassMaterial.findById(material._id)
      .populate('uploadedBy', 'username avatar role')
      .populate('comments.user', 'username avatar')
      .populate('session', 'title startTime')
      .lean();

    res.json({ material: populated });
  } catch (error) {
    console.error('Add material comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addSessionComment = async (req, res) => {
  try {
    const { classroomId, sessionId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content required' });
    }

    const session = await ClassSession.findOne({ _id: sessionId, classroom: classroomId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.discussion.push({ user: userId, content: content.trim() });
    await session.save();

    const populated = await ClassSession.findById(sessionId)
      .populate('instructor', 'username avatar role bio')
      .populate({ path: 'materials', populate: { path: 'uploadedBy', select: 'username avatar role' } })
      .populate({ path: 'discussion.user', select: 'username avatar' })
      .lean();

    res.json({ session: formatSession(populated) });
  } catch (error) {
    console.error('Add session comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



