const express = require('express')
const axios = require('axios')
const User = require('../models/User')
const LineUser = require('../models/LineUser')
const jwt = require('jsonwebtoken')
const qs = require('querystring')

const router = express.Router()

router.get('/line/callback', async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    console.error('LINE Login error from LINE:', error)
    return res.redirect(`http://localhost:3000/login?error=${error}`)
  }
  
  if (!code) {
    console.log('No code received')
    return res.redirect('http://localhost:3000/login?error=no_code')
  }

  console.log('1. Received code:', code)

  try {
    console.log('2. Requesting access token...')
    const tokenRes = await axios.post(
  'https://api.line.me/oauth2/v2.1/token',
  qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.LINE_REDIRECT_URI,
    client_id: process.env.LINE_CHANNEL_ID,
    client_secret: process.env.LINE_CHANNEL_SECRET
  }),
  {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }
);

  const accessToken = tokenRes.data.access_token
  console.log('3. Got access token')
  const profileRes = await axios.get('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  const { userId, displayName, pictureUrl } = profileRes.data
  console.log('4. Got profile:', userId, displayName)
  let user = await User.findOne({ lineUserId: userId })
  if (!user) {
    user = new User({
      username: displayName,
      lineUserId: userId,
      avatar: pictureUrl
    })
    await user.save()
    console.log('5. New user created')
  }
  let lineUser = await LineUser.findOne({ lineUserId: userId })
  if (!lineUser) {
    lineUser = new LineUser({
      username: displayName,
      lineUserId: userId,
      userId: user._id,
      email: user.email
    })
    await lineUser.save()
    console.log('6. New LineUser created')
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '6h' })

  console.log('7. Token generated:', token)

  res.redirect(`http://localhost:3000/login-success?token=${token}`)

} catch (err) {
    console.error('LINE Login error:', err.response?.data || err.message)
    console.error('Full error:', err)
    res.status(500).send('LINE Login error')
  }
})

module.exports = router