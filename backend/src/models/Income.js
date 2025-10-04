const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
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
  createdByEmail: {
    type: String,
    required: true
  }
}, {
  timestamps: true  // เพิ่ม timestamps
});

// เพิ่ม indexes เพื่อเพิ่มประสิทธิภาพการค้นหา
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ pocketId: 1 });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
