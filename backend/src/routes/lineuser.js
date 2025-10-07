const express = require('express')
const router = express.Router()
const LineUser = require('../models/LineUser')
const auth = require('../middleware/auth')

router.post('/connect', auth, async (req, res) => {
  const { lineUserId } = req.body
  if (!lineUserId) return res.status(400).json({ error: 'Missing lineUserId' })
  const exists = await LineUser.findOne({ lineUserId })
  if (exists) return res.status(400).json({ error: 'LINE user already connected' })
  const lineUser = new LineUser({
    lineUserId,
    userId: req.user._id,
    email: req.user.email
  })
  await lineUser.save()
  res.status(201).json(lineUser)
})
module.exports = router