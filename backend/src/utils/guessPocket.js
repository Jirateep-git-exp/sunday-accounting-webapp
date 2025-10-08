const catalog = require('./pocketCatalog')
let externalPatterns
try {
  externalPatterns = require('./patterns.json')
} catch (e) {
  externalPatterns = null
}

function normalize(s) {
  return (s || '').toString().toLowerCase().trim()
}

const incomeKeywords = externalPatterns?.incomeKeywords || [
  'ให้', 'ได้', 'รับ', 'โอนเข้า', 'เข้าบัญชี', 'รายรับ', 'ขายได้', 'ค่าจ้าง', 'โบนัส', 'ปันผล', 'ดอกเบี้ย'
]
const expenseKeywords = externalPatterns?.expenseKeywords || [
  'จ่าย', 'ซื้อ', 'ค่า', 'ใช้', 'โอนออก', 'รายจ่าย', 'เติม', 'ชำระ', 'ผ่อน', 'ค่าบริการ', 'ค่าน้ำ', 'ค่าไฟ', 'ค่าเช่า'
]

// Heuristics for refund-related phrasing
// Examples:
// - "เพื่อนคืนเงิน 300" => income (they returned money to me)
// - "คืนเงินเพื่อน 300" => expense (I returned money to them)
// - "ได้เงินคืน/รับเงินคืน/เงินคืนจากร้าน" => income
// - "คืนเงินให้เพื่อน/โอนคืนให้" => expense
const refundIncomePhrases = (externalPatterns?.refundIncomePhrases && externalPatterns.refundIncomePhrases.length)
  ? externalPatterns.refundIncomePhrases
  : [
  'เงินคืน', // common pattern for refunds received
  'รับเงินคืน',
  'ได้เงินคืน',
  'โอนคืนมา',
  'โอนเงินคืนมา',
  'คืนเงินมา'
]
const refundExpensePhrases = (externalPatterns?.refundExpensePhrases && externalPatterns.refundExpensePhrases.length)
  ? externalPatterns.refundExpensePhrases
  : [
  'คืนเงินให้',
  'โอนคืนให้',
  'โอนคืนไป',
  'จ่ายคืน',
  'ชำระคืน',
  'ส่งคืนเงิน',
  'คืนเพื่อน', // covers "คืนเพื่อน 300"
  'คืนเงินเพื่อน'
]

function detectRefundType(t) {
  for (const p of refundExpensePhrases) {
    if (t.includes(normalize(p))) return 'expense'
  }
  for (const p of refundIncomePhrases) {
    if (t.includes(normalize(p))) return 'income'
  }
  // Positional heuristic around "คืนเงิน" or "โอนคืน" with the word "เพื่อน"
  const keyIdx = (() => {
    const a = t.indexOf('คืนเงิน')
    const b = t.indexOf('โอนคืน')
    if (a === -1) return b
    if (b === -1) return a
    return Math.min(a, b)
  })()
  if (keyIdx !== -1) {
    const friendIdx = t.indexOf('เพื่อน')
    if (friendIdx !== -1) {
      if (friendIdx < keyIdx) return 'income'   // "เพื่อนคืนเงิน"
      if (keyIdx < friendIdx) return 'expense'  // "คืนเงินเพื่อน"
    }
  }
  return undefined
}

function findKeywordPositions(text, keywords) {
  const positions = []
  for (const k of keywords) {
    const idx = text.indexOf(normalize(k))
    if (idx !== -1) positions.push(idx)
  }
  return positions
}

function decideForcedType(t) {
  const incPos = findKeywordPositions(t, incomeKeywords)
  const expPos = findKeywordPositions(t, expenseKeywords)
  if (incPos.length && !expPos.length) return 'income'
  if (!incPos.length && expPos.length) return 'expense'
  if (incPos.length && expPos.length) {
    // choose the type that appears later in text (closer to the number in many messages)
    const lastInc = Math.max(...incPos)
    const lastExp = Math.max(...expPos)
    return lastInc >= lastExp ? 'income' : 'expense'
  }
  return undefined
}

function guessPocket(text) {
  const t = normalize(text)
  // Refund phrasing disambiguation first
  const refundType = detectRefundType(t)
  const forcedType = refundType || decideForcedType(t)

  // 1) Direct pocket mappings from patterns.json (if provided)
  if (externalPatterns?.pocketMappings && Array.isArray(externalPatterns.pocketMappings)) {
    const mappings = forcedType
      ? externalPatterns.pocketMappings.filter(m => !m.type || m.type === forcedType)
      : externalPatterns.pocketMappings
    for (const m of mappings) {
      const contains = Array.isArray(m.contains) ? m.contains : []
      const hit = contains.some(k => k && t.includes(normalize(k)))
      if (hit) {
        const cat = catalog.find(i => i.id === m.id)
        if (cat) return { type: cat.type, name: cat.nameTh, id: cat.id }
      }
    }
  }

  const items = forcedType ? catalog.filter(i => i.type === forcedType) : catalog

  // direct match any synonym (respect type if forced)
  for (const item of items) {
    if (item.synonyms?.some(k => t.includes(normalize(k)))) {
      return { type: item.type, name: item.nameTh, id: item.id }
    }
  }

  // fallback: names (Thai/English)
  for (const item of items) {
    if (t.includes(normalize(item.nameTh)) || t.includes(normalize(item.nameEn))) {
      return { type: item.type, name: item.nameTh, id: item.id }
    }
  }

  // final defaults scoped by type
  if (forcedType === 'income') {
    // Prefer a generic income bucket if no specific match
    const gift = catalog.find(i => i.id === 'gift-income') || catalog.find(i => i.type === 'income')
    return { type: gift.type, name: gift.nameTh, id: gift.id }
  }
  // default to expense others
  const other = catalog.find(i => i.id === 'others') || catalog.find(i => i.type === 'expense')
  return { type: other.type, name: other.nameTh, id: other.id }
}

module.exports = guessPocket