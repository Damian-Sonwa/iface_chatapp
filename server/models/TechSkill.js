const mongoose = require('mongoose');

const techSkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '💻'
  },
  iconUrl: {
    type: String,
    default: null
  },
  difficultyLevels: {
    type: [String],
    enum: ['Beginner', 'Intermediate', 'Professional'],
    default: ['Beginner', 'Intermediate', 'Professional']
  },
  questions: [{
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Professional'],
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    correctAnswer: {
      type: String,
      required: true
    },
    options: [{
      type: String
    }],
    questionType: {
      type: String,
      enum: ['multiple-choice', 'text', 'code'],
      default: 'multiple-choice'
    }
  }],
  // Legacy fields for backward compatibility
  questionTemplate: {
    type: String,
    default: null
  },
  questionGenerator: {
    type: String,
    enum: ['basic', 'technical', 'experience', 'custom'],
    default: 'basic'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
techSkillSchema.index({ name: 1 });
techSkillSchema.index({ isActive: 1 });
techSkillSchema.index({ 'questions.level': 1 });

module.exports = mongoose.model('TechSkill', techSkillSchema);

