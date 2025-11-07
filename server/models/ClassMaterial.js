const mongoose = require('mongoose');

const classMaterialSchema = new mongoose.Schema({
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSession',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['pdf', 'slides', 'video', 'github', 'link', 'other'],
    default: 'link'
  },
  link: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

classMaterialSchema.index({ classroom: 1, session: 1 });

module.exports = mongoose.model('ClassMaterial', classMaterialSchema);
