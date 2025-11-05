const express = require('express');
const router = express.Router();
const userSkillProfileController = require('../controllers/userSkillProfileController');
const authController = require('../controllers/authController');

// All routes require authentication
router.use(authController.verifyToken);

// Get user's skill profiles
router.get('/my-profiles', userSkillProfileController.getUserSkillProfiles);
router.get('/skill/:skillId', userSkillProfileController.getUserSkillProfile);
router.get('/verified/:userId?', userSkillProfileController.getVerifiedSkills);

// Get questions for a skill and level
router.get('/skill/:skillId/questions/:level', userSkillProfileController.getQuestionsForLevel);

// Verify answers
router.post('/verify', userSkillProfileController.verifyAnswers);

// Join group after verification
router.post('/skill/:skillId/join-group', userSkillProfileController.joinGroup);

module.exports = router;

