const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');
const developerAuth = require('../middleware/developerAuth');

// Public routes
router.post('/register', developerController.register);
router.post('/login', developerController.login);

// Protected routes (require developer JWT)
router.get('/me', developerAuth, developerController.getProfile);
router.post('/regenerate-key', developerAuth, developerController.regenerateKey);
router.get('/usage', developerAuth, developerController.getUsage);

module.exports = router;
