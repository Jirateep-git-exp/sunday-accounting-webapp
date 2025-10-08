const express = require('express')
const axios = require('axios')
const guessPocket = require('./guessPocket')
const Pocket = require('../models/Pocket')
const Income = require('../models/Income')
const Expense = require('../models/Expense')
const User = require('../models/User');
const { buildHelpMessage, buildConfirmFlex, buildSummaryFlex, buildPocketsFlex, buildOnboardingFlex } = require('./lineMessages')
const catalog = require('./pocketCatalog')
const authService = require('../services/authService')
const mongoose = require('mongoose')

const router = express.Router()

const LINE_REPLY_URL = 'https://api.line.me/v2/bot/message/reply'
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
const MONGODB_URI = process.env.MONGODB_URI

async function ensureDb() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI environment variable')
    return
  }
  if (mongoose.connection.readyState === 1) return
  if (mongoose.connection.readyState === 2) {
    // connecting
    return new Promise((resolve) => mongoose.connection.once('connected', resolve))
  }
  await mongoose.connect(MONGODB_URI)
}

// Process a single LINE event (message, follow, etc.)
async function processEvent(event) {
  if (!event) return

  // Welcome/onboarding when user adds OA as a friend
  if (event.type === 'follow') {
    const onboarding = buildOnboardingFlex()
    await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [onboarding] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
    return
  }

  // Handle postback for canceling a transaction
  if (event.type === 'postback' && event.postback && event.postback.data) {
    const params = Object.fromEntries(new URLSearchParams(event.postback.data))
    if (params.action === 'cancel_tx' && params.type && params.tid) {
      await ensureDb()
      const lineUserId = event.source.userId
      const user = await User.findOne({ lineUserId })
      if (!user) return
      const Model = params.type === 'income' ? Income : Expense
      const tx = await Model.findOne({ _id: params.tid, userId: user._id })
      if (!tx) {
        await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [{ type: 'text', text: 'ไม่พบรายการ หรือรายการนี้ถูกลบไปแล้ว' }] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
        return
      }
      await Model.deleteOne({ _id: params.tid, userId: user._id })
      await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [{ type: 'text', text: 'ยกเลิกรายการเรียบร้อย' }] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
      return
    }
    return
  }

  if (event.type !== 'message' || event.message.type !== 'text') return

  const text = event.message.text.trim()

  // simple commands
  if (/^help$/i.test(text) || /^ช่วยเหลือ$/.test(text)) {
    await axios.post(LINE_REPLY_URL, {
      replyToken: event.replyToken,
      messages: [buildHelpMessage()],
    }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
    return
  }

  // ✅ ดึง lineUserId และหา user
  await ensureDb()
  const lineUserId = event.source.userId
  const user = await User.findOne({ lineUserId })
  if (!user) {
    const onboarding = buildOnboardingFlex()
    await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [onboarding] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
    return
  }

  // list pockets
  if (/^(ดูหมวดหมู่|หมวดหมู่ของฉัน)$/.test(text)) {
    const [incomePockets, expensePockets] = await Promise.all([
      Pocket.find({ userId: user._id, type: 'income' }).select('name icon').lean(),
      Pocket.find({ userId: user._id, type: 'expense' }).select('name icon').lean(),
    ])
    const token = authService.generateToken(user)
    const pocketsFlex = buildPocketsFlex({ incomePockets, expensePockets }, { token })
    await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [pocketsFlex] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
    return
  }

  // handle range summary: "สรุป 7 วัน"
  const rangeMatch = text.match(/^สรุป\s*(\d+)\s*วัน$/)
  if (rangeMatch) {
    const days = Math.max(1, parseInt(rangeMatch[1], 10))
    const end = new Date(); end.setHours(23,59,59,999)
    const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - (days - 1))

    const [incomes, expenses] = await Promise.all([
      Income.find({ userId: user._id, date: { $gte: start, $lte: end } }),
      Expense.find({ userId: user._id, date: { $gte: start, $lte: end } }),
    ])
    const totalIncome = incomes.reduce((s, i) => s + (i.amount || 0), 0)
    const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0)

    const fmt = (d) => d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })
    const title = `สรุป ${days} วัน`
    const subtitle = `${fmt(start)} - ${fmt(end)}`
  const token = authService.generateToken(user)
  const summaryFlex = buildSummaryFlex({ totalIncome, totalExpense, title, subtitle }, { token })

    await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [summaryFlex] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
    return
  }

  // summary today
  if (/^สรุปวันนี้$/.test(text) || /^today\s*summary$/i.test(text)) {
    const start = new Date(); start.setHours(0,0,0,0)
    const end = new Date(); end.setHours(23,59,59,999)
    const [incomes, expenses] = await Promise.all([
      Income.find({ userId: user._id, date: { $gte: start, $lte: end } }),
      Expense.find({ userId: user._id, date: { $gte: start, $lte: end } }),
    ])
    const totalIncome = incomes.reduce((s, i) => s + (i.amount || 0), 0)
    const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const token = authService.generateToken(user)
  const summaryFlex = buildSummaryFlex({ totalIncome, totalExpense, title: 'สรุปวันนี้' }, { token })
    await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [summaryFlex] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
    return
  }

  // transaction pattern: description + number (space optional) at end, optional 'บาท'
  // supports: "ข้าวมันไก่ 55", "มาม่า100", "กาแฟ-45", "โบนัส+1000"
  const match = text.match(/^(.+?)(?:\s*|\s*[-+]?)(-?\d+)(?:\s*บาท)?$/i)
  if (match) {
    const description = match[1]
    const amount = Number(match[2])
  const pocketInfo = guessPocket(description)
  const predicted = catalog.find(i => i.id === pocketInfo.id) || null

    // ✅ หา pocket ของ user คนนั้น (รองรับกรณีตั้งชื่อเองด้วยการจับคำแบบยืดหยุ่น)
    const userPockets = await Pocket.find({ userId: user._id }).select('name type icon').lean()

    // Exact match by guessed name/type first
    let pocket = userPockets.find(p => p.name === pocketInfo.name && p.type === pocketInfo.type)

    // Fallback: fuzzy match by substring of pocket name inside description
    if (!pocket) {
      const normalize = (s = '') => s.toLowerCase().replace(/[\s\-_/.,:;!@#$%^&*()\[\]{}"'`~]+/g, '')
      const nDesc = normalize(description)
      const nGuess = normalize(pocketInfo.name || '')
      const syns = predicted?.synonyms?.map(normalize) || []

      // Try within guessed type
      const candidatesByType = userPockets.filter(p => p.type === pocketInfo.type)
      const scoredByType = candidatesByType.map(p => {
        const nName = normalize(p.name)
        let score = 0
        if (nDesc.includes(nName)) score += 3 // description contains pocket name
        if (nGuess && nName.includes(nGuess)) score += 2 // pocket name contains guessed keyword
        if (syns.length && syns.some(s => s && nName.includes(s))) score += 1 // pocket name contains any synonym
        return { p, score, len: nName.length }
      }).filter(x => x.score > 0)
      if (scoredByType.length) {
        scoredByType.sort((a, b) => b.score - a.score || b.len - a.len)
        pocket = scoredByType[0].p
      }

      // If still not found, try across all types
      if (!pocket) {
        const scoredAny = userPockets.map(p => {
          const nName = normalize(p.name)
          let score = 0
          if (nDesc.includes(nName)) score += 3
          if (nGuess && nName.includes(nGuess)) score += 2
          if (syns.length && syns.some(s => s && nName.includes(s))) score += 1
          return { p, score, len: nName.length }
        }).filter(x => x.score > 0)
        if (scoredAny.length) {
          scoredAny.sort((a, b) => b.score - a.score || b.len - a.len)
          pocket = scoredAny[0].p
        }
      }
    }

    if (!pocket) {
      await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [{ type: 'text', text: `ไม่พบหมวด "${pocketInfo.name}" กรุณาสร้างหมวดนี้ก่อนใน Cloud Pocket หรือใส่ชื่อหมวดในข้อความ เช่น "ชื่อหมวด 100"` }] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
      return
    }

    // สร้าง transaction
    const transactionData = { amount, description, date: new Date(), pocketId: pocket._id, userId: user._id, createdByEmail: user.email }
    let created
    if (pocket.type === 'income') created = await Income.create(transactionData)
    else created = await Expense.create(transactionData)

    // ตอบกลับ LINE (Flex)
    const token = authService.generateToken(user)
    const flex = buildConfirmFlex({ description, amount, pocketName: pocket.name, type: pocket.type, transactionId: created?._id }, { token })
    await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [flex] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
    return
  }

  // invalid format -> guide
  await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [{ type: 'text', text: 'พิมพ์บันทึกแบบ: "ข้าวมันไก่ 55" หรือพิมพ์ "help" เพื่อดูวิธีใช้งาน' }] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
}

// Process a batch of events (used by Express and Serverless)
async function processEvents(events = []) {
  for (const ev of events || []) {
    try { await processEvent(ev) } catch (e) { console.error('processEvent error:', e) }
  }
}

router.post('/', async (req, res) => {
  try {
    await processEvents(req.body?.events)
  } catch (e) {
    console.error('processEvents error:', e)
  }
  return res.sendStatus(200)
})

module.exports = router
module.exports.processEvents = processEvents