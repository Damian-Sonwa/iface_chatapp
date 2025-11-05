const express = require('express');
const router = express.Router();
const techSkillController = require('../controllers/techSkillController');
const authController = require('../controllers/authController');

// All routes require authentication
router.use(authController.verifyToken);

router.get('/', techSkillController.getAllTechSkills);
router.get('/generators', techSkillController.getQuestionGenerators);
router.get('/:id', techSkillController.getTechSkill);
router.get('/:id/question', techSkillController.getQuestion);
router.get('/:id/rooms', techSkillController.getRoomsForTechSkill);
router.post('/', techSkillController.createTechSkill);
router.put('/:id', techSkillController.updateTechSkill);
router.delete('/:id', techSkillController.deleteTechSkill);

module.exports = router;

