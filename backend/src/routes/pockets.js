const express = require('express');
const router = express.Router();
const pocketController = require('../controllers/pocketController');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

// CRUD routes
router.post('/', pocketController.createPocket);
router.get('/', pocketController.getPockets);
router.put('/:id', pocketController.updatePocket);
router.delete('/:id', pocketController.deletePocket);

module.exports = router;
