const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  targetLang: {
    type: String,
    required: true
  },
  translatedText: {
    type: String,
    required: true
  },
  sourceLang: {
    type: String,
    default: 'auto'
  }
}, {
  timestamps: true
});

// Composite unique index: one translation per message per target language
translationSchema.index({ messageId: 1, targetLang: 1 }, { unique: true });

module.exports = mongoose.model('Translation', translationSchema);









