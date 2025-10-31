const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  messageRange: {
    from: Date,
    to: Date,
    count: Number
  },
  metadata: {
    model: String, // e.g., 'gpt-3.5-turbo'
    tokensUsed: Number
  }
}, {
  timestamps: true
});

summarySchema.index({ roomId: 1, createdAt: -1 });
summarySchema.index({ requestedBy: 1 });

module.exports = mongoose.model('Summary', summarySchema);






