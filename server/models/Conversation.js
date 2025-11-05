const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['dm', 'group'],
    required: true
  },
  title: {
    type: String,
    trim: true,
    default: null // For DMs, title is optional (can be auto-generated)
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  pinnedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  archivedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Additional fields for group conversations
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
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

// Index for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1, lastMessageAt: -1 });
conversationSchema.index({ participants: 1, type: 1 }); // For finding DMs between two users

// Ensure unique DM conversations between two participants
conversationSchema.pre('save', async function(next) {
  if (this.isNew && this.type === 'dm' && this.participants.length === 2) {
    const participants = this.participants.map(p => p.toString()).sort();
    const existing = await mongoose.model('Conversation').findOne({
      type: 'dm',
      participants: { $all: participants, $size: 2 }
    });
    if (existing && existing._id.toString() !== this._id.toString()) {
      return next(new Error('DM conversation already exists between these users'));
    }
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);

