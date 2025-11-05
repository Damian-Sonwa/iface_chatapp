const express = require('express');
const router = express.Router();
const privateController = require('../controllers/privateController');
const authController = require('../controllers/authController');

// All routes require authentication
router.use(authController.verifyToken);

router.get('/', privateController.getUserChats);
router.get('/:userId', privateController.getOrCreateChat);
router.get('/messages/:chatId', privateController.getChatMessages);

module.exports = router;









