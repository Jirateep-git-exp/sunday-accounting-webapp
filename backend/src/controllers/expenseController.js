const Expense = require('../models/Expense');

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { amount, description, date, pocketId } = req.body;
    const newExpense = new Expense({
      amount,
      description,
      date,
      pocketId,
      userId: req.user._id,
      createdByEmail: req.user.email
    });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Error creating expense' });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expense' });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { amount, description, date, pocketId } = req.body;
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        amount,
        description,
        date,
        pocketId
      },
      { new: true }
    );
    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Error updating expense' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting expense' });
  }
};

// Create multiple expenses at once
exports.createMultipleExpenses = async (req, res) => {
  try {
    const { expenses } = req.body;
    
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ error: 'Invalid expenses array' });
    }

    // Validate each expense
    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      if (!expense.amount || !expense.description || !expense.date || !expense.pocketId) {
        return res.status(400).json({ 
          error: `Missing required fields in expense item ${i + 1}`,
          received: expense
        });
      }
    }

    // Prepare expenses for bulk insertion
    const expensesToInsert = expenses.map(expense => ({
      amount: parseFloat(expense.amount),
      description: expense.description,
      date: new Date(expense.date),
      pocketId: expense.pocketId,
      userId: req.user._id,
      createdByEmail: req.user.email
    }));

    // Insert all expenses
    const savedExpenses = await Expense.insertMany(expensesToInsert);
    
    res.status(201).json({
      message: `Successfully created ${savedExpenses.length} expenses`,
      expenses: savedExpenses
    });
  } catch (error) {
    console.error('Error creating multiple expenses:', error);
    res.status(500).json({ 
      error: 'Error creating multiple expenses',
      message: error.message
    });
  }
};