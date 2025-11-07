const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const authController = require('../controllers/authController');

// All routes require authentication
router.use(authController.verifyToken);

// Get all classrooms for a tech skill
router.get('/skill/:skillId', classroomController.getClassrooms);

// Get single classroom
router.get('/:classroomId', classroomController.getClassroom);

// Subscribe to classroom
router.post('/:classroomId/subscribe', classroomController.subscribeToClassroom);

// Unsubscribe from classroom
router.delete('/:classroomId/subscribe', classroomController.unsubscribeFromClassroom);

// Create classroom (admin/instructor)
router.post('/', classroomController.createClassroom);

module.exports = router;



