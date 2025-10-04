const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all income entries
router.get('/', incomeController.getAllIncome);

// Create new income entry
router.post('/', incomeController.createIncome);

// Create multiple income entries
router.post('/bulk', incomeController.createMultipleIncome);

// Get specific income entry
router.get('/:id', incomeController.getIncomeById);

// Update income entry
router.put('/:id', incomeController.updateIncome);

// Delete income entry
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
