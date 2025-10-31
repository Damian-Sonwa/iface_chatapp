const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const viewerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  viewedAt: { type: Date, default: Date.now }
}, { _id: false });

const momentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'photo', 'video', 'file'], required: true },
  text: { type: String, default: '' },
  gradient: { type: String, default: 'orange' },
  media: {
    url: String,
    filename: String,
    mimetype: String
  },
  caption: { type: String, default: '' },
  tags: [{ type: String }],
  privacy: { type: String, enum: ['public', 'friends', 'close_friends', 'private'], default: 'public' },
  reactions: [reactionSchema],
  viewers: [viewerSchema],
  aiGenerated: { type: Boolean, default: false },
  aiMetadata: {
    prompt: String,
    model: String,
    responseId: String,
    timestamp: Date
  },
  status: { type: String, enum: ['published', 'needs_review'], default: 'published' },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24*60*60*1000) }
}, { timestamps: true });

momentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Moment', momentSchema);


