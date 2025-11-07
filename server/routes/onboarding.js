const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const onboardingController = require('../controllers/onboardingController');

router.post('/complete', authController.verifyToken, onboardingController.completeOnboarding);

module.exports = router;
