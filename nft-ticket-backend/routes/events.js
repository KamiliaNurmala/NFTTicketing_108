const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);

module.exports = router;