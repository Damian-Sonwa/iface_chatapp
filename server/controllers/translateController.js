const Translation = require('../models/Translation');
const Message = require('../models/Message');

/**
 * POST /api/translate
 * Translate a message using Google Translate API
 */
const translateMessage = async (req, res) => {
  try {
    const { messageId, targetLang } = req.body;
    const userId = req.userId;

    if (!messageId || !targetLang) {
      return res.status(400).json({ error: 'messageId and targetLang are required' });
    }

    // Check cache first
    const cached = await Translation.findOne({ messageId, targetLang });
    if (cached) {
      return res.json({
        translatedText: cached.translatedText,
        sourceLang: cached.sourceLang,
        cached: true
      });
    }

    // Fetch message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(503).json({ error: 'Translation service not configured. GOOGLE_API_KEY is missing.' });
    }

    // Call Google Translate API
    const textToTranslate = message.content;
    
    // Using Google Translate REST API
    const fetch = require('node-fetch');
    const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: textToTranslate,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Translation API error' }));
      throw new Error(errorData.error?.message || 'Translation failed');
    }

    const data = await response.json();
    const translatedText = data.data.translations[0].translatedText;
    const detectedLang = data.data.translations[0].detectedSourceLanguage;

    // Cache the translation
    await Translation.create({
      messageId,
      targetLang,
      translatedText,
      sourceLang: detectedLang
    });

    console.log(`🌐 Message ${messageId} translated to ${targetLang} by user ${userId}`);

    res.json({
      translatedText,
      sourceLang: detectedLang,
      cached: false
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
};

/**
 * GET /api/translate/batch
 * Get translations for multiple messages at once
 */
const translateBatch = async (req, res) => {
  try {
    const { messageIds, targetLang } = req.body;
    const userId = req.userId;

    if (!Array.isArray(messageIds) || !targetLang) {
      return res.status(400).json({ error: 'messageIds array and targetLang are required' });
    }

    // Fetch cached translations
    const cached = await Translation.find({
      messageId: { $in: messageIds },
      targetLang
    });

    const cachedMap = {};
    cached.forEach(t => {
      cachedMap[t.messageId.toString()] = {
        translatedText: t.translatedText,
        sourceLang: t.sourceLang,
        cached: true
      };
    });

    // Find messages that need translation
    const uncachedIds = messageIds.filter(id => !cachedMap[id]);
    
    // For now, return cached ones and note uncached
    // In production, you might batch translate uncached messages
    const results = {};
    messageIds.forEach(id => {
      if (cachedMap[id]) {
        results[id] = cachedMap[id];
      } else {
        results[id] = { needsTranslation: true };
      }
    });

    res.json({ translations: results });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({ error: 'Batch translation failed', details: error.message });
  }
};

module.exports = {
  translateMessage,
  translateBatch
};







