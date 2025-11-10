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
      type: mongoose.Schema.Types.ObjectId,  // เปลี่ยนจาก String เป็น ObjectId
      ref: 'Pocket',  // เพิ่ม reference ไปยัง Pocket model
      required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lineUserId: {
    type: String, 
    required: false, 
    unique: false
  },
    createdByEmail: {
    type: String,
    required: true
  }
},
{
  timestamps: true  // เพิ่ม timestamps
});

module.exports = mongoose.model('Expense', expenseSchema);
