const TechSkill = require('../models/TechSkill');
const Room = require('../models/Room');
const { generateQuestion, getQuestionGenerators } = require('../services/questionGenerator');

// Get all tech skills
exports.getAllTechSkills = async (req, res) => {
  try {
    const skills = await TechSkill.find({ isActive: true })
      .populate('createdBy', 'username')
      .sort({ name: 1 });
    
    res.json({ skills });
  } catch (error) {
    console.error('Get tech skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single tech skill
exports.getTechSkill = async (req, res) => {
  try {
    const skill = await TechSkill.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!skill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }
    
    res.json({ skill });
  } catch (error) {
    console.error('Get tech skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get questions for a specific skill and level
exports.getQuestionsForLevel = async (req, res) => {
  try {
    const { id, level } = req.params;
    
    const skill = await TechSkill.findById(id);
    if (!skill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }
    
    // Filter questions for the requested level
    const questions = skill.questions.filter(q => q.level === level);
    
    // Return questions without correct answers for security
    const questionsForUser = questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      questionType: q.questionType
    }));
    
    res.json({ questions: questionsForUser, skillName: skill.name });
  } catch (error) {
    console.error('Get questions for level error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create tech skill (admin only)
exports.createTechSkill = async (req, res) => {
  try {
    const { name, description, icon, questionTemplate, questionGenerator } = req.body;
    const userId = req.userId;
    
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const skill = await TechSkill.create({
      name,
      description: description || '',
      icon: icon || '💻',
      questionTemplate: questionTemplate || `Why do you want to join ${name}?`,
      questionGenerator: questionGenerator || 'basic',
      createdBy: userId
    });
    
    res.status(201).json({ skill });
  } catch (error) {
    console.error('Create tech skill error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Tech skill with this name already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Update tech skill (admin only)
exports.updateTechSkill = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const skill = await TechSkill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!skill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }
    
    res.json({ skill });
  } catch (error) {
    console.error('Update tech skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete tech skill (admin only)
exports.deleteTechSkill = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const skill = await TechSkill.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!skill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }
    
    res.json({ message: 'Tech skill deactivated successfully' });
  } catch (error) {
    console.error('Delete tech skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get question for a tech skill
exports.getQuestion = async (req, res) => {
  try {
    const skill = await TechSkill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }
    
    const question = generateQuestion(skill);
    
    res.json({ question, skillName: skill.name });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get question generators
exports.getQuestionGenerators = async (req, res) => {
  try {
    const generators = getQuestionGenerators();
    res.json({ generators });
  } catch (error) {
    console.error('Get question generators error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get rooms for a tech skill
exports.getRoomsForTechSkill = async (req, res) => {
  try {
    const rooms = await Room.find({ techSkillId: req.params.id })
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('techSkillId', 'name icon')
      .sort({ createdAt: -1 });
    
    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms for tech skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

