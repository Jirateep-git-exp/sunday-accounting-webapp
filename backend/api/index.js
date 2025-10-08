const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

// Suppress Mongoose 7 strictQuery deprecation warning explicitly
try { mongoose.set('strictQuery', true) } catch (_) {}

// Controllers and routes (reuse existing app code)
const authController = require('../src/controllers/authController')
const pocketRoutes = require('../src/routes/pockets')
const incomeRoutes = require('../src/routes/income')
const expenseRoutes = require('../src/routes/expenses')
const profileRoutes = require('../src/routes/profile')
const lineUserRoutes = require('../src/routes/lineuser')
const lineAuthRoutes = require('../src/routes/lineauth')

const app = express()
app.use(cors())
app.use(express.json())

// Ensure a single shared DB connection across invocations
let mongoReady = null
async function ensureDb() {
  if (mongoose.connection.readyState === 1) return
  if (!mongoReady) {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('Missing MONGODB_URI')
    mongoReady = mongoose.connect(uri)
  }
  await mongoReady
}

// Lazy DB connect per request (keeps cold starts quicker)
app.use(async (req, res, next) => {
  try { await ensureDb(); next() } catch (e) {
    console.error('DB connect error:', e)
    res.status(500).json({ error: 'Database connection error' })
  }
})

// Public auth routes
app.post('/api/auth/register', authController.register)
app.post('/api/auth/login', authController.login)

// Feature routes (protected within the route modules via middleware)
app.use('/api/pockets', pocketRoutes)
app.use('/api/income', incomeRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/lineuser', lineUserRoutes)
app.use('/api/auth', lineAuthRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Export the Express app as a request handler for Vercel
module.exports = (req, res) => app(req, res)
