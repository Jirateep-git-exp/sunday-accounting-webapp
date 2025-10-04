const mongoose = require('mongoose');

const pocketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  icon: {
    type: String,
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
  timestamps: true
});

module.exports = mongoose.model('Pocket', pocketSchema);
