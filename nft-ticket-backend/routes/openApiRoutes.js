const express = require('express');
const router = express.Router();
const openApiController = require('../controllers/openApiController');
const apiKeyAuth = require('../middleware/apiKeyAuth');

// All routes require API Key authentication
router.use(apiKeyAuth);

// Events
router.get('/events', openApiController.getEvents);
router.get('/events/:id', openApiController.getEvent);

// Tickets
router.post('/tickets/mint', openApiController.mintTicket);
router.get('/tickets/:tokenId', openApiController.getTicket);
router.get('/tickets/verify/:tokenId', openApiController.verifyTicket);
router.post('/tickets/transfer', openApiController.transferTicket);

// Blockchain
router.get('/blockchain/tx/:txHash', openApiController.getTransaction);

module.exports = router;
