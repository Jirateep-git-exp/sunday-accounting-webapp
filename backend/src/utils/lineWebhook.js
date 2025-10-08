const express = require('express')
const axios = require('axios')
const guessPocket = require('./guessPocket')
const Pocket = require('../models/Pocket')
const Income = require('../models/Income')
const Expense = require('../models/Expense')
const User = require('../models/User');
const { buildHelpMessage, buildConfirmFlex, buildSummaryFlex, buildPocketsFlex } = require('./lineMessages')
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

// Process a single LINE message event
async function processEvent(event) {
  if (!event || event.type !== 'message' || event.message.type !== 'text') return

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
    await axios.post(LINE_REPLY_URL, {
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: 'คุณยังไม่ได้เชื่อมบัญชีกับ Cloud Pocket กรุณาเชื่อมบัญชีก่อนใช้งาน' }]
    }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
    return
  }

  // list pockets
  if (/^(ดูหมวดหมู่|หมวดหมู่ของฉัน)$/.test(text)) {
    const [incomePockets, expensePockets] = await Promise.all([
      Pocket.find({ userId: user._id, type: 'income' }).select('name icon').lean(),
      Pocket.find({ userId: user._id, type: 'expense' }).select('name icon').lean(),
    ])
    const pocketsFlex = buildPocketsFlex({ incomePockets, expensePockets })
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
    const summaryFlex = buildSummaryFlex({ totalIncome, totalExpense, title, subtitle })

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
    const summaryFlex = buildSummaryFlex({ totalIncome, totalExpense, title: 'สรุปวันนี้' })
    await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [summaryFlex] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
    return
  }

  // transaction pattern: description + space + number (at end)
  const match = text.match(/^(.+?)\s(-?\d+)(?:\s*บาท)?$/i)
  if (match) {
    const description = match[1]
    const amount = Number(match[2])
    const pocketInfo = guessPocket(description)

    // ✅ หา pocket ของ user คนนั้น
    const pocket = await Pocket.findOne({
      name: pocketInfo.name,
      type: pocketInfo.type,
      userId: user._id
    })
    
    if (!pocket) {
      await axios.post(LINE_REPLY_URL, { replyToken: event.replyToken, messages: [{ type: 'text', text: `ไม่พบหมวด "${pocketInfo.name}" กรุณาสร้างหมวดนี้ก่อนใน Cloud Pocket` }] }, { headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` } })
      return
    }

    // สร้าง transaction
    const transactionData = { amount, description, date: new Date(), pocketId: pocket._id, userId: pocket.userId, createdByEmail: pocket.createdByEmail }
    if (pocketInfo.type === 'income') await Income.create(transactionData)
    else await Expense.create(transactionData)

    // ตอบกลับ LINE (Flex)
    const flex = buildConfirmFlex({ description, amount, pocketName: pocketInfo.name, type: pocketInfo.type })
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