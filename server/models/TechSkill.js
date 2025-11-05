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
  questionTemplate: {
    type: String,
    required: true,
    default: 'Why do you want to join this tech skill group?'
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

module.exports = mongoose.model('TechSkill', techSkillSchema);

