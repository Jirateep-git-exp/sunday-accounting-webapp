const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

// Get current user profile
router.get('/me', auth, async (req, res) => {
  const { _id, username, email, avatar, lineUserId, createdAt } = req.user
  res.json({ id: _id, username, email, avatar, lineUserId, createdAt })
})

// Update profile (username, avatar)
router.put('/me', auth, async (req, res) => {
  try {
    const { username, avatar } = req.body
    if (typeof username === 'string') req.user.username = username
    if (typeof avatar === 'string') req.user.avatar = avatar
    await req.user.save()
    const { _id, email, lineUserId, createdAt } = req.user
    res.json({ id: _id, username: req.user.username, email, avatar: req.user.avatar, lineUserId, createdAt })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Change password
router.put('/me/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!newPassword) return res.status(400).json({ error: 'Missing new password' })
    if (!(await req.user.comparePassword(currentPassword || ''))) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }
    req.user.password = newPassword
    await req.user.save()
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Unlink LINE
router.post('/me/unlink-line', auth, async (req, res) => {
  try {
    req.user.lineUserId = undefined
    await req.user.save()
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
