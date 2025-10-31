const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { translateMessage, translateBatch } = require('../controllers/translateController');

// Rate limiting for translation endpoints
const translateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 translations per 15 minutes
  message: 'Too many translation requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// All routes require authentication
router.use(authController.verifyToken);

// POST /api/translate
router.post('/', translateRateLimit, translateMessage);

// POST /api/translate/batch
router.post('/batch', translateRateLimit, translateBatch);

module.exports = router;







