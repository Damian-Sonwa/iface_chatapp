const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined, but unique if present
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  },
  // Legacy field for backward compatibility
  password: {
    type: String,
    default: null
  },
  avatarUrl: {
    type: String,
    default: null
  },
  // Legacy field for backward compatibility
  avatar: {
    type: String,
    default: null
  },
  // Ephemeral user status (like a story). Optional image and/or text
  statusPhoto: {
    type: String,
    default: null
  },
  statusText: {
    type: String,
    default: '',
    maxlength: 200
  },
  statusUpdatedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  socketId: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: '',
    maxlength: 150
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedUntil: {
    type: Date,
    default: null
  },
  suspensionReason: {
    type: String,
    default: null
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  twoFactorMethod: {
    type: String,
    enum: ['email', 'phone'],
    default: null
  },
  sessions: [{
    deviceInfo: String,
    ipAddress: String,
    lastActive: Date,
    token: String
  }],
  vibe: {
    type: String,
    enum: ['Chill', 'Busy', 'Focused', 'Energetic', 'Creative'],
    default: null
  },
  theme: {
    type: String,
    enum: ['default', 'ocean', 'forest', 'sunset', 'purple', 'blue'],
    default: 'default'
  },
  autoVibe: {
    type: Boolean,
    default: false
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  autoTranslate: {
    type: Map,
    of: Boolean, // Map of chatId/roomId -> enable auto-translate
    default: {}
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  closeFriends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    soundEnabled: {
      type: Boolean,
      default: true
    },
    messageAnimations: {
      type: Boolean,
      default: true
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

