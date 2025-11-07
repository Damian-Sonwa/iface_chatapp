const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  reason: {
    type: String,
    enum: ['banned_word', 'flagged_behavior'],
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

violationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Violation', violationSchema);
