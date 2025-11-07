const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  techSkillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TechSkill',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subscribers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    }
  }],
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    default: 0 // Free by default, can be set for paid courses
  },
  currency: {
    type: String,
    default: 'USD'
  },
  features: {
    liveSessions: {
      type: Boolean,
      default: true
    },
    assignments: {
      type: Boolean,
      default: true
    },
    resources: {
      type: Boolean,
      default: true
    },
    certificates: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
classroomSchema.index({ techSkillId: 1 });
classroomSchema.index({ 'subscribers.user': 1 });

module.exports = mongoose.model('Classroom', classroomSchema);



