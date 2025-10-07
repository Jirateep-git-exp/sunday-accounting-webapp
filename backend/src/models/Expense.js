const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  pocketId: {
    type: String,
    required: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lineUserId: {
    type: String, 
    required: false, 
    unique: true
  },
    createdByEmail: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
