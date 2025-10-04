const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all expenses
router.get('/', expenseController.getAllExpenses);

// Create new expense
router.post('/', expenseController.createExpense);

// Create multiple expenses
router.post('/bulk', expenseController.createMultipleExpenses);

// Get specific expense
router.get('/:id', expenseController.getExpenseById);

// Update expense
router.put('/:id', expenseController.updateExpense);

// Delete expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
