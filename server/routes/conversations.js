const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { verifyToken } = require('../controllers/authController');

// All routes require authentication
router.use(verifyToken);

router.get('/', conversationController.getConversations);
router.get('/:id', conversationController.getConversation);
router.post('/', conversationController.createConversation);
router.put('/:id', conversationController.updateConversation);
router.delete('/:id', conversationController.deleteConversation);
router.post('/:id/archive', conversationController.archiveConversation);
router.post('/:id/unarchive', conversationController.unarchiveConversation);
router.post('/:id/pin', conversationController.pinConversation);
router.post('/:id/unpin', conversationController.unpinConversation);

module.exports = router;

