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
const allowedOrigins = [
  process.env.FRONTEND_BASE_URL,
  process.env.FRONTEND_URL,
  'http://localhost:3000',
]
app.use(cors({
  origin: function (origin, cb) {
    // allow non-browser/SSR or same-origin requests
    if (!origin) return cb(null, true)
    const ok = allowedOrigins.filter(Boolean).some((o) => origin === o)
    cb(ok ? null : new Error('CORS blocked'), ok)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Handle preflight quickly
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.status(204).end()
})
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

// Public auth routes (support both with and without /api prefix)
app.post(['/api/auth/register', '/auth/register'], authController.register)
app.post(['/api/auth/login', '/auth/login'], authController.login)

// Feature routes (protected within the route modules via middleware)
app.use(['/api/pockets', '/pockets'], pocketRoutes)
app.use(['/api/income', '/income'], incomeRoutes)
app.use(['/api/expenses', '/expenses'], expenseRoutes)
app.use(['/api/profile', '/profile'], profileRoutes)
app.use(['/api/lineuser', '/lineuser'], lineUserRoutes)
app.use(['/api/auth', '/auth'], lineAuthRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Export the Express app as a request handler for Vercel
module.exports = (req, res) => app(req, res)
