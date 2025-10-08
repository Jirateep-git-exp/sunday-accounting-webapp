const crypto = require('crypto')
const axios = require('axios')
require('dotenv').config()

// Reuse existing logic by importing the express router handler file and exported processor if available
let processEvents
try {
  // This requires that backend/src/utils/lineWebhook.js export processEvents
  ({ processEvents } = require('../backend/src/utils/lineWebhook'))
} catch (e) {
  console.warn('processEvents not exported from backend/src/utils/lineWebhook.js; falling back to minimal 200 OK handler')
}

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

  const channelSecret = process.env.LINE_CHANNEL_SECRET
  if (!channelSecret) {
    res.statusCode = 500
    return res.end('Missing LINE_CHANNEL_SECRET')
  }

  const rawBody = await getRawBody(req)
  const signature = crypto
    .createHmac('sha256', channelSecret)
    .update(rawBody)
    .digest('base64')

  const got = req.headers['x-line-signature']
  if (signature !== got) {
    res.statusCode = 401
    return res.end('Invalid signature')
  }

  let body
  try {
    body = JSON.parse(rawBody.toString('utf8'))
  } catch {
    res.statusCode = 400
    return res.end('Invalid JSON')
  }

  try {
    if (processEvents) {
      await processEvents(body.events)
    } else {
      console.log('Received events but no processor wired')
    }
    res.statusCode = 200
    res.end('OK')
  } catch (e) {
    console.error('Webhook error:', e)
    // respond 200 to avoid LINE retries storm
    res.statusCode = 200
    res.end('OK')
  }
}
