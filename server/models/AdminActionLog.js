const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    enum: ['ban', 'unban', 'suspend', 'unsuspend', 'delete', 'reinstate', 'reset-password'],
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

adminActionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminActionLog', adminActionLogSchema);
