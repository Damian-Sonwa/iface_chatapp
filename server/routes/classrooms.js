const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const authController = require('../controllers/authController');

// All routes require authentication
router.use(authController.verifyToken);

// Skill-wide data
router.get('/skill/:skillId', classroomController.getClassrooms);
router.get('/skill/:skillKey/sessions', classroomController.getSkillSessions);

// Classroom specific
router.get('/:classroomId', classroomController.getClassroom);
router.post('/', classroomController.createClassroom);

// Sessions
router.get('/:classroomId/sessions', classroomController.getClassroomSessions);
router.get('/:classroomId/sessions/:sessionId', classroomController.getClassroomSessionDetail);
router.post('/:classroomId/sessions', classroomController.createClassroomSession);
router.patch('/:classroomId/sessions/:sessionId', classroomController.updateClassroomSession);
router.delete('/:classroomId/sessions/:sessionId', classroomController.deleteClassroomSession);
router.post('/:classroomId/sessions/:sessionId/comments', classroomController.addSessionComment);

// Materials
router.get('/:classroomId/materials', classroomController.getClassroomMaterials);
router.post('/:classroomId/materials', classroomController.createClassroomMaterial);
router.patch('/:classroomId/materials/:materialId', classroomController.updateClassroomMaterial);
router.delete('/:classroomId/materials/:materialId', classroomController.deleteClassroomMaterial);
router.post('/:classroomId/materials/:materialId/comments', classroomController.addMaterialComment);

// Subscription
router.post('/:classroomId/subscribe', classroomController.subscribeToClassroom);
router.delete('/:classroomId/subscribe', classroomController.unsubscribeFromClassroom);

module.exports = router;



