const express = require('express');
const router = express.Router();
const groupJoinRequestController = require('../controllers/groupJoinRequestController');
const authController = require('../controllers/authController');

// All routes require authentication
router.use(authController.verifyToken);

router.post('/', groupJoinRequestController.submitJoinRequest);
router.get('/my-requests', groupJoinRequestController.getUserJoinRequests);
router.get('/room/:roomId', groupJoinRequestController.getRoomJoinRequests);
router.post('/:requestId/approve', groupJoinRequestController.approveJoinRequest);
router.post('/:requestId/reject', groupJoinRequestController.rejectJoinRequest);

module.exports = router;

