const express = require('express')
const axios = require('axios')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
// Note: No cross-account migration; conflicts will be rejected per spec
const qs = require('querystring')

const router = express.Router()

// Helper: frontend base URL for redirects (supports deploy)
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000'
const LINE_OA_ADD_FRIEND_URL = process.env.LINE_OA_ADD_FRIEND_URL || ''
const go = (res, path) => res.redirect(`${FRONTEND_BASE_URL}${path}`)

// Env mapping for LINE Login (separate from Messaging API/OA)
// New names preferred: LINE_LOGIN_CHANNEL_ID / LINE_LOGIN_CHANNEL_SECRET
// Fallback to old names if not set to avoid breaking existing envs.
const LINE_LOGIN_CHANNEL_ID = process.env.LINE_LOGIN_CHANNEL_ID || process.env.LINE_CHANNEL_ID
const LINE_LOGIN_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET || process.env.LINE_CHANNEL_SECRET
const LINE_REDIRECT_URI = process.env.LINE_REDIRECT_URI

// Create a short-lived state token to link a LINE account to the current user
router.post('/line/link-state', auth, async (req, res) => {
  try {
    const linkToken = jwt.sign({ id: req.user._id, action: 'link-line' }, process.env.JWT_SECRET, { expiresIn: '5m' })
    return res.json({ state: `link:${linkToken}` })
  } catch (err) {
    console.error('Create link-state error:', err)
    return res.status(500).json({ error: 'Failed to create link state' })
  }
})

router.get('/line/callback', async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    console.error('LINE Login error from LINE:', error)
    return go(res, `/login?error=${encodeURIComponent(error)}`)
  }
  
  if (!code) {
    return go(res, '/login?error=no_code')
  }

  try {
    const tokenRes = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINE_REDIRECT_URI,
        client_id: LINE_LOGIN_CHANNEL_ID,
        client_secret: LINE_LOGIN_CHANNEL_SECRET
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

  const accessToken = tokenRes.data.access_token

  const profileRes = await axios.get('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  const { userId, displayName, pictureUrl } = profileRes.data

  // If this callback is a linking flow, attach lineUserId to existing user and finish
  if (state && typeof state === 'string' && state.startsWith('link:')) {
    try {
      const linkToken = state.slice(5)
      const payload = jwt.verify(linkToken, process.env.JWT_SECRET)
      if (payload.action !== 'link-line') throw new Error('Invalid link action')

      // prevent binding the same LINE account to multiple users
      const conflict = await User.findOne({ lineUserId: userId, _id: { $ne: payload.id } })
      if (conflict) {
        // Reject linking if this LINE account is already attached to another user (LINE-only or not)
        return go(res, '/login-success?error=lineid_in_use')
      }

      const currentUser = await User.findById(payload.id)
      if (!currentUser) {
        return go(res, '/login-success?error=user_not_found')
      }
      currentUser.lineUserId = userId
      // keep existing username/email; fill avatar if empty
      if (!currentUser.avatar && pictureUrl) currentUser.avatar = pictureUrl
      await currentUser.save()

      // Redirect back to app indicating linking success (no token change required)
      return go(res, '/login-success?linked=true')
    } catch (err) {
      console.error('Link LINE error:', err)
      return go(res, '/login-success?error=link_failed')
    }
  }

  // Otherwise: login/signup via LINE
  // Ensure a User exists and is linked to this LINE account
  let user = await User.findOne({ lineUserId: userId })
  let isFirstLogin = false
  if (!user) {
    // Create a new app User for this LINE profile
    user = new User({
      username: displayName || `line_${userId.slice(-6)}`,
      email: `line_${userId}@line.local`,
      // Set a random password to satisfy schema requirement; user won't use password for LINE login
      password: Math.random().toString(36).slice(2),
      lineUserId: userId,
      avatar: pictureUrl
    })
    await user.save()
    isFirstLogin = true
  }

  // Sign JWT with the core User id so auth middleware can validate
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '6h' })

  const params = new URLSearchParams({ token })
  if (isFirstLogin) {
    params.set('first', 'true')
    if (LINE_OA_ADD_FRIEND_URL) params.set('addfriend', LINE_OA_ADD_FRIEND_URL)
  }
  return go(res, `/login-success?${params.toString()}`)

} catch (err) {
    console.error('LINE Login error:', err.response?.data || err.message)
    console.error('Full error:', err)
    res.status(500).send('LINE Login error')
  }
})

module.exports = router