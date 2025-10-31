const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { summarizeRoom, suggestReplies, assistantChat } = require('../controllers/aiController');
const { getAIResponse } = require('../services/aiService');

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // 60 requests per hour per user
  message: 'Too many AI requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development (optional)
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  }
});

// Per-room rate limit for summaries (1 per 60 seconds)
const summaryRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,
  message: 'Please wait before requesting another summary for this room.',
  keyGenerator: (req) => {
    return `${req.userId}-${req.params.roomId}`;
  }
});

// All routes require authentication
router.use(authController.verifyToken);

// POST /api/ai/summarize/:roomId
router.post('/summarize/:roomId', aiRateLimit, summaryRateLimit, summarizeRoom);

// POST /api/ai/suggest-replies
router.post('/suggest-replies', aiRateLimit, suggestReplies);

// POST /api/ai/assistant
router.post('/assistant', aiRateLimit, assistantChat);

// POST /api/ai  (Gemini generic)
router.post('/', aiRateLimit, async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!process.env.VERTEX_PROJECT || !process.env.VERTEX_API_KEY) {
      // Graceful fallback when not configured
      const text = (prompt && prompt.length > 0)
        ? `AI (fallback): ${prompt.length > 160 ? prompt.slice(0, 160) + '…' : prompt}`
        : 'AI (fallback): Ask me anything.';
      return res.json({ text, choices: [], metadata: { configured: false } });
    }
    const result = await getAIResponse(prompt || '', context || '');
    res.json(result);
  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

module.exports = router;


