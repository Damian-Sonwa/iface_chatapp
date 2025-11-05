const UserSkillProfile = require('../models/UserSkillProfile');
const TechSkill = require('../models/TechSkill');
const Room = require('../models/Room');
const User = require('../models/User');

// Get user's skill profile for a specific skill
exports.getUserSkillProfile = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.userId;

    const profile = await UserSkillProfile.findOne({ userId, skillId })
      .populate('skillId', 'name description icon iconUrl')
      .populate('joinedGroupId', 'name description');

    if (!profile) {
      return res.json({ profile: null });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get user skill profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all user's skill profiles
exports.getUserSkillProfiles = async (req, res) => {
  try {
    const userId = req.userId;

    const profiles = await UserSkillProfile.find({ userId })
      .populate('skillId', 'name description icon iconUrl')
      .populate('joinedGroupId', 'name description');

    res.json({ profiles });
  } catch (error) {
    console.error('Get user skill profiles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get questions for a skill and level
exports.getQuestionsForLevel = async (req, res) => {
  try {
    const { skillId, level } = req.params;

    const skill = await TechSkill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }

    // Filter questions for the requested level
    const questions = skill.questions.filter(q => q.level === level);

    // Return questions without correct answers
    const questionsForUser = questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      questionType: q.questionType
    }));

    res.json({ questions: questionsForUser });
  } catch (error) {
    console.error('Get questions for level error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify answers and create/update user skill profile
exports.verifyAnswers = async (req, res) => {
  try {
    const { skillId, level, answers } = req.body;
    const userId = req.userId;

    const skill = await TechSkill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }

    // Get questions for the level
    const questions = skill.questions.filter(q => q.level === level);
    if (questions.length === 0) {
      return res.status(400).json({ error: 'No questions found for this level' });
    }

    // Verify answers
    let correctCount = 0;
    const answerResults = [];

    answers.forEach(userAnswer => {
      const question = questions.find(q => q._id.toString() === userAnswer.questionId);
      if (!question) {
        answerResults.push({
          questionId: userAnswer.questionId,
          answer: userAnswer.answer,
          correct: false
        });
        return;
      }

      const isCorrect = question.questionType === 'multiple-choice'
        ? userAnswer.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
        : userAnswer.answer.trim().toLowerCase().includes(question.correctAnswer.trim().toLowerCase()) ||
          question.correctAnswer.trim().toLowerCase().includes(userAnswer.answer.trim().toLowerCase());

      if (isCorrect) correctCount++;

      answerResults.push({
        questionId: question._id,
        answer: userAnswer.answer,
        correct: isCorrect
      });
    });

    // Calculate score (percentage)
    const score = Math.round((correctCount / questions.length) * 100);
    
    // Verification threshold: 70% for Beginner, 75% for Intermediate, 80% for Professional
    const thresholds = {
      'Beginner': 70,
      'Intermediate': 75,
      'Professional': 80
    };
    const threshold = thresholds[level] || 70;
    const isVerified = score >= threshold;

    // Find or create user skill profile
    let profile = await UserSkillProfile.findOne({ userId, skillId });

    if (profile) {
      // Update existing profile
      profile.levelSelected = level;
      profile.answers = answerResults;
      profile.isVerified = isVerified;
      profile.verificationScore = score;
      profile.attempts += 1;
      profile.lastAttemptAt = Date.now();
      if (isVerified && !profile.verifiedAt) {
        profile.verifiedAt = Date.now();
      }
      await profile.save();
    } else {
      // Create new profile
      profile = await UserSkillProfile.create({
        userId,
        skillId,
        levelSelected: level,
        answers: answerResults,
        isVerified,
        verificationScore: score,
        attempts: 1,
        lastAttemptAt: Date.now(),
        verifiedAt: isVerified ? Date.now() : null
      });
    }

    res.json({
      profile,
      score,
      isVerified,
      correctCount,
      totalQuestions: questions.length,
      threshold,
      message: isVerified 
        ? 'Congratulations! You are verified and can now join the group.' 
        : `Score: ${score}%. You need ${threshold}% to be verified. Please try again.`
    });
  } catch (error) {
    console.error('Verify answers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Join group after verification
exports.joinGroup = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.userId;

    // Check if user has verified profile
    const profile = await UserSkillProfile.findOne({ userId, skillId });
    if (!profile || !profile.isVerified) {
      return res.status(403).json({ 
        error: 'You must verify your skill level before joining the group',
        requiresVerification: true
      });
    }

    // Find room for this skill
    const room = await Room.findOne({ techSkillId: skillId });
    if (!room) {
      return res.status(404).json({ error: 'Group not found for this skill' });
    }

    // Check if user is already a member
    if (room.members.includes(userId)) {
      return res.json({ 
        room, 
        message: 'You are already a member of this group',
        alreadyMember: true
      });
    }

    // Add user to room
    room.members.push(userId);
    await room.save();

    // Update profile with joined group
    profile.joinedGroupId = room._id;
    await profile.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('techSkillId', 'name icon description');

    res.json({ 
      room: populatedRoom, 
      message: 'Successfully joined the group!',
      profile
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's verified skills (for badges)
exports.getVerifiedSkills = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    const profiles = await UserSkillProfile.find({ 
      userId, 
      isVerified: true 
    })
      .populate('skillId', 'name icon iconUrl')
      .select('skillId levelSelected verifiedAt');

    res.json({ verifiedSkills: profiles });
  } catch (error) {
    console.error('Get verified skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

