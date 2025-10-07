const pocketMapping = require('./pocketMapping')

function guessPocket(text) {
  text = text.toLowerCase()
  for (const pocket of pocketMapping) {
    for (const keyword of pocket.keywords) {
      if (text.includes(keyword)) {
        return pocket
      }
    }
  }
  // ไม่พบ ให้ default เป็น expense
  return { type: 'expense', name: 'อื่นๆ' }
}

module.exports = guessPocket