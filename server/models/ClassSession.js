const mongoose = require('mongoose');

const classSessionSchema = new mongoose.Schema({
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
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
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  meetingLink: {
    type: String,
    default: ''
  },
  meetingPlatform: {
    type: String,
    enum: ['Zoom', 'Google Meet', 'Teams', 'Other', null],
    default: null
  },
  recordingLink: {
    type: String,
    default: ''
  },
  sessionType: {
    type: String,
    enum: ['live', 'recorded'],
    default: 'live'
  },
  tags: [String],
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassMaterial'
  }],
  discussion: [{
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

classSessionSchema.index({ classroom: 1, startTime: 1 });

module.exports = mongoose.model('ClassSession', classSessionSchema);
