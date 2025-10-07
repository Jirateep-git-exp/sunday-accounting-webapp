const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User')

// Connect a LINE userId to the authenticated app User without creating a separate collection document
router.post('/connect', auth, async (req, res) => {
  try {
    const { lineUserId } = req.body
    if (!lineUserId) return res.status(400).json({ error: 'Missing lineUserId' })

    // Ensure no other user is already connected with this lineUserId
    const existing = await User.findOne({ lineUserId })
    if (existing && existing._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: 'LINE user already connected' })
    }

    // Update current user
    const user = await User.findById(req.user._id)
    user.lineUserId = lineUserId
    await user.save()

    return res.status(200).json({
      success: true,
      user: { id: user._id, email: user.email, lineUserId: user.lineUserId }
    })
  } catch (err) {
    console.error('Connect LINE error:', err)
    res.status(500).json({ error: 'Failed to connect LINE user' })
  }
})

module.exports = router