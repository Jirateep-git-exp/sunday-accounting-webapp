const mongoose = require('mongoose')
const lineUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  lineUserId: {
    type: String, 
    required: true, 
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  avatar: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})
module.exports = mongoose.model('LineUser', lineUserSchema)