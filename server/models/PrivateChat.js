const mongoose = require('mongoose');

const privateChatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique pairs of participants
privateChatSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.model('PrivateChat', privateChatSchema);


