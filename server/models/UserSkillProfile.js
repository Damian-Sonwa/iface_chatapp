const mongoose = require('mongoose');

const userSkillProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TechSkill',
    required: true
  },
  levelSelected: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Professional'],
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    correct: {
      type: Boolean,
      default: false
    },
    answeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  joinedGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  verificationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttemptAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Composite unique index: one profile per user per skill
userSkillProfileSchema.index({ userId: 1, skillId: 1 }, { unique: true });

// Indexes for efficient queries
userSkillProfileSchema.index({ userId: 1, isVerified: 1 });
userSkillProfileSchema.index({ skillId: 1, isVerified: 1 });
userSkillProfileSchema.index({ joinedGroupId: 1 });

module.exports = mongoose.model('UserSkillProfile', userSkillProfileSchema);

