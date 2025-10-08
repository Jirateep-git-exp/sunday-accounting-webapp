const crypto = require('crypto')
require('dotenv').config()

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end('Method Not Allowed')
  }

  const secret = process.env.LINE_CHANNEL_SECRET
  if (!secret) {
    res.statusCode = 500
    return res.end('Missing LINE_CHANNEL_SECRET')
  }

  const raw = await getRawBody(req)
  const got = req.headers['x-line-signature']
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('base64')
  if (got !== expected) {
    res.statusCode = 401
    return res.end('Invalid signature')
  }

  let body
  try { body = JSON.parse(raw.toString('utf8')) } catch {
    res.statusCode = 400
    return res.end('Invalid JSON')
  }

  try {
    const { processEvents } = require('../src/utils/lineWebhook')
    await processEvents(body.events || [])
  } catch (e) {
    console.error('processEvents error:', e)
  }

  res.statusCode = 200
  res.end('OK')
}
