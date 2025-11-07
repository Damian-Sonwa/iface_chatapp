const Classroom = require('../models/Classroom');
const Room = require('../models/Room');
const TechSkill = require('../models/TechSkill');
const UserSkillProfile = require('../models/UserSkillProfile');

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

    if (!name || !techSkillId) {
      return res.status(400).json({ error: 'Name and tech skill ID are required' });
    }

    // Verify tech skill exists
    const techSkill = await TechSkill.findById(techSkillId);
    if (!techSkill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }

    // Create classroom room
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

    // Create classroom
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

    // Update room with classroomId
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



