const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authController = require('../controllers/authController');

// All routes require authentication
router.use(authController.verifyToken);

router.get('/', roomController.getAllRooms);
router.post('/', roomController.createRoom);
router.post('/:roomId/join', roomController.joinRoom);
router.get('/:roomId/messages', roomController.getRoomMessages);
router.get('/users/all', roomController.getAllUsers);

module.exports = router;


