const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authenticateToken = require('../middleware/auth');

router.post('/purchase', authenticateToken, (req, res) => ticketController.purchase(req, res));
router.get('/my-tickets', authenticateToken, (req, res) => ticketController.getMyTickets(req, res));
router.get('/verify/:tokenId', (req, res) => ticketController.verify(req, res));
router.post('/transfer', authenticateToken, (req, res) => ticketController.transfer(req, res));
router.post('/sync-transfer', authenticateToken, (req, res) => ticketController.syncTransfer(req, res));

module.exports = router;