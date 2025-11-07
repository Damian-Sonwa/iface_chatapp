const mongoose = require('mongoose');

const groupReportSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    default: ''
  },
  handled: {
    type: Boolean,
    default: false
  },
  handledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

groupReportSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('GroupReport', groupReportSchema);


