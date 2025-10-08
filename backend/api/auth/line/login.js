const qs = require('querystring')

module.exports = async (req, res) => {
  try {
    const clientId = process.env.LINE_LOGIN_CHANNEL_ID || process.env.LINE_CHANNEL_ID
    const redirectUri = process.env.LINE_REDIRECT_URI

    if (!clientId || !redirectUri) {
      res.statusCode = 500
      return res.end('LINE Login not configured: missing LINE_LOGIN_CHANNEL_ID/LINE_REDIRECT_URI')
    }

    // support optional redirect target after successful login
    const redirect = typeof req.query.redirect === 'string' ? req.query.redirect : '/dashboard'
    const statePayload = { r: redirect }
    const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url')

    const scope = 'openid profile'
    const authUrl =
      `https://access.line.me/oauth2/v2.1/authorize?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${encodeURIComponent(state)}`

    res.statusCode = 302
    res.setHeader('Location', authUrl)
    res.end()
  } catch (err) {
    console.error('LINE Login init error:', err)
    res.statusCode = 500
    res.end('LINE Login init failed')
  }
}
