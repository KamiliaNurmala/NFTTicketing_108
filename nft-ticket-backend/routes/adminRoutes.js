const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.post('/register', adminController.register);
router.post('/login', adminController.login);

// Protected routes (require admin JWT)
router.get('/events', adminAuth, adminController.getEvents);
router.post('/events', adminAuth, adminController.createEvent);
router.put('/events/:id', adminAuth, adminController.updateEvent);
router.delete('/events/:id', adminAuth, adminController.deleteEvent);
router.get('/developers', adminAuth, adminController.getDevelopers);
router.get('/usage-logs', adminAuth, adminController.getUsageLogs);

module.exports = router;
