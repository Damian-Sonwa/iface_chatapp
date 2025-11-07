const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  // Legacy fields for backward compatibility during migration
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  privateChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrivateChat',
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'emoji', 'audio', 'location', 'link'],
    default: 'text'
  },
  attachments: [{
    url: String,
    filename: String,
    mimetype: String
  }],
  reactions: {
    type: Map,
    of: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: new Map()
  },
  deliveredTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  editedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  replyToMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  linkPreview: {
    url: String,
    title: String,
    description: String,
    image: String,
    siteName: String
  },
  disappearingAfter: {
    type: Number, // hours
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isEncrypted: {
    type: Boolean,
    default: false // Placeholder for future encryption
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, isPinned: 1 });
// Legacy indexes for backward compatibility
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ room: 1, isArchived: 1, createdAt: -1 });
messageSchema.index({ privateChat: 1, createdAt: -1 });
messageSchema.index({ privateChat: 1, isArchived: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

