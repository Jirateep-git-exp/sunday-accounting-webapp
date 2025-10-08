const express = require('express');
const router = express.Router();
const pocketController = require('../controllers/pocketController');
const auth = require('../middleware/auth');
const catalog = require('../utils/pocketCatalog');

// Protect all routes
router.use(auth);

// Fixed catalog for dropdowns / migration helpers (place before other routes)
router.get('/catalog/all', (req, res) => {
	res.json(catalog);
});

// CRUD routes
router.post('/', pocketController.createPocket);
router.get('/', pocketController.getPockets);
router.put('/:id', pocketController.updatePocket);
router.delete('/:id', pocketController.deletePocket);

// Onboarding helpers
router.get('/presets/default', pocketController.getDefaultPresets);
router.post('/bulk', pocketController.bulkCreate);

module.exports = router;
