const express = require('express')
const axios = require('axios')
const guessPocket = require('./guessPocket')
const Pocket = require('../models/Pocket')
const Income = require('../models/Income')
const Expense = require('../models/Expense')
const User = require('../models/User');

const router = express.Router()

const LINE_REPLY_URL = 'https://api.line.me/v2/bot/message/reply'
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

router.post('/', async (req, res) => {
  const event = req.body.events?.[0]
  if (!event || event.type !== 'message' || event.message.type !== 'text') return res.sendStatus(200)

  const text = event.message.text.trim()
  const match = text.match(/(.+)\s(\d+)/)

  // ✅ ดึง lineUserId ของคนที่ส่งข้อความ
  const lineUserId = event.source.userId

  // ✅ หา user จาก lineUserId
  const user = await User.findOne({ lineUserId })
  if (!user) {
    await axios.post(LINE_REPLY_URL, {
      replyToken: event.replyToken,
      messages: [{
        type: 'text',
        text: 'คุณยังไม่ได้เชื่อมบัญชีกับ Cloud Pocket กรุณาเชื่อมบัญชีก่อนใช้งาน'
      }]
    }, {
      headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
    })
    return res.sendStatus(200)
  }

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
      // ไม่พบ pocket ให้ตอบกลับว่าไม่พบหมวดหมู่
      await axios.post(LINE_REPLY_URL, {
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: `ไม่พบหมวด "${pocketInfo.name}" กรุณาสร้างหมวดนี้ก่อนใน Cloud Pocket` }]
      }, {
        headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
      })
      return res.sendStatus(200)
    }

    // สร้าง transaction
    const transactionData = {
      amount,
      description,
      date: new Date(),
      pocketId: pocket._id,
      userId: pocket.userId, // ใช้ userId จาก pocket
      createdByEmail: pocket.createdByEmail
    }

    if (pocketInfo.type === 'income') {
      await Income.create(transactionData)
    } else {
      await Expense.create(transactionData)
    }

    // ตอบกลับ LINE
    await axios.post(LINE_REPLY_URL, {
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: `บันทึก ${pocketInfo.type === 'income' ? 'รายรับ' : 'รายจ่าย'} หมวด "${pocketInfo.name}" เรียบร้อยแล้ว!` }]
    }, {
      headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
    })
  }
  res.sendStatus(200)
})

module.exports = router