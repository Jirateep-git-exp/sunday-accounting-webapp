const axios = require('axios')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
try { mongoose.set('strictQuery', true) } catch (_) {}
const User = require('../../../src/models/User')

async function ensureDb() {
  if (mongoose.connection.readyState === 1) return
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Missing MONGODB_URI')
  if (mongoose.connection.readyState === 2) {
    await new Promise((r) => mongoose.connection.once('connected', r))
    return
  }
  await mongoose.connect(uri)
}

function decodeState(s) {
  try {
    const json = Buffer.from(String(s || ''), 'base64url').toString('utf8')
    const obj = JSON.parse(json)
    return typeof obj?.r === 'string' ? obj.r : '/dashboard'
  } catch {
    return '/dashboard'
  }
}

module.exports = async (req, res) => {
  const code = req.query.code
  const state = req.query.state

  const clientId = process.env.LINE_LOGIN_CHANNEL_ID || process.env.LINE_CHANNEL_ID
  const clientSecret = process.env.LINE_LOGIN_CHANNEL_SECRET || process.env.LINE_CHANNEL_SECRET
  const redirectUri = process.env.LINE_REDIRECT_URI
  const frontend = process.env.FRONTEND_BASE_URL || 'http://localhost:3000'
  const jwtSecret = process.env.JWT_SECRET

  if (!clientId || !clientSecret || !redirectUri) {
    res.statusCode = 500
    return res.end('LINE Login not configured: missing ID/SECRET/REDIRECT_URI')
  }
  if (!code) {
    res.statusCode = 400
    return res.end('Missing code')
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const { access_token } = tokenRes.data

    const profRes = await axios.get('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const { userId: lineUserId, displayName, pictureUrl } = profRes.data || {}

    await ensureDb()
    let user = await User.findOne({ lineUserId })
    if (!user) {
      user = await User.create({
        username: displayName || `line_${String(lineUserId).slice(-6)}`,
        email: `line_${lineUserId}@line.local`,
        password: Math.random().toString(36).slice(2),
        lineUserId,
        avatar: pictureUrl,
      })
    } else {
      // Light refresh for name/avatar
      if (!user.username && displayName) user.username = displayName
      if (pictureUrl) user.avatar = pictureUrl
      await user.save()
    }

    const token = jwt.sign({ id: String(user._id) }, jwtSecret, { expiresIn: '6h' })
    const redirect = decodeState(state)
    const target = `${frontend}/login-success?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(redirect)}`
    res.statusCode = 302
    res.setHeader('Location', target)
    res.end()
  } catch (e) {
    console.error('LINE Login callback error:', e?.response?.data || e.message)
    const target = `${frontend}/login?error=LINE_LOGIN_FAILED`
    res.statusCode = 302
    res.setHeader('Location', target)
    res.end()
  }
}
