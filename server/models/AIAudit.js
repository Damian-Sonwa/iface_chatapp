const mongoose = require('mongoose');

const aiAuditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: String,
  responseSnippet: String,
  model: String,
  moderationResult: {
    flagged: Boolean,
    reasons: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('AIAudit', aiAuditSchema);









