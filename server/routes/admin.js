const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// All routes require authentication
router.use(authController.verifyToken);

// All routes require admin role
router.use(adminController.isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.listUsers);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/suspend', adminController.suspendUser);
router.post('/users/:userId/reinstate', adminController.reinstateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/users/:userId/reset-password', adminController.resetPassword);

// Rooms
router.get('/rooms', adminController.listRooms);
router.delete('/rooms/:roomId', adminController.deleteRoom);

// Activity logs
router.get('/activity', adminController.getActivity);
router.get('/logs', adminController.listActionLogs);

module.exports = router;

