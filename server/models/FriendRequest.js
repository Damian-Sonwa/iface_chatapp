const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Prevent duplicate friend requests
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

// Ensure users can't send requests to themselves
friendRequestSchema.pre('save', function(next) {
  if (this.from.toString() === this.to.toString()) {
    const error = new Error('Cannot send friend request to yourself');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('FriendRequest', friendRequestSchema);









