const mongoose = require('mongoose');

const groupJoinRequestSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  techSkillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TechSkill',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
groupJoinRequestSchema.index({ roomId: 1, userId: 1 });
groupJoinRequestSchema.index({ techSkillId: 1 });
groupJoinRequestSchema.index({ userId: 1, status: 1 });
groupJoinRequestSchema.index({ status: 1 });

// Prevent duplicate pending requests
groupJoinRequestSchema.index({ roomId: 1, userId: 1, status: 1 }, {
  unique: true,
  partialFilterExpression: { status: 'pending' }
});

module.exports = mongoose.model('GroupJoinRequest', groupJoinRequestSchema);

