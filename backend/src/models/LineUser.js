const mongoose = require('mongoose')
const lineUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: false
  },
  lineUserId: {
    type: String, 
    required: true, 
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  email: {
    type: String, 
    required: false,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})
module.exports = mongoose.model('LineUser', lineUserSchema)