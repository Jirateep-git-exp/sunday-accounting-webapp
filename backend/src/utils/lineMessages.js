// Helper builders for LINE Messaging API payloads (styled for an accounting UX)

const THEME = {
  // Softer light theme for better readability
  lightBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  softBg: '#F6F8FC',
  text: '#0F172A', // slate-900
  subtext: '#64748B', // slate-500
  border: '#E2E8F0', // slate-200
  income: {
    accent: '#16A34A', // green-600
    accentSoft: '#E7F6EC',
  },
  expense: {
    accent: '#E11D48', // rose-600
    accentSoft: '#FDE7ED',
  },
  brand: '#6C63FF',
}

// Default application timezone for display (server runs in UTC)
const TimeZone = process.env.APP_TIMEZONE || 'Asia/Bangkok'

function formatThaiDate(date) {
  const d = date ? new Date(date) : new Date()
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TimeZone })
}

function formatThaiTime(date) {
  const d = date ? new Date(date) : new Date()
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: TimeZone })
}

function formatCurrency(amount) {
  try {
    return amount.toLocaleString('th-TH')
  } catch (_) {
    return String(amount)
  }
}

// Format THB with symbol using Thai locale
function formatBaht(amount, maximumFractionDigits = 2) {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '฿0'
  try {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits }).format(num)
  } catch (_) {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits }).format(num)
  }
}

function buildHelpMessage() {
  return {
    type: 'flex',
    altText: 'Help - Commands',
    contents: {
      type: 'bubble',
      size: 'mega',
      styles: { body: { backgroundColor: THEME.cardBg }, footer: { backgroundColor: THEME.cardBg } },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '16px', spacing: 'md', contents: [
          { type: 'text', text: 'คำสั่ง - ช่วยเหลือ', weight: 'bold', size: 'lg', color: THEME.text },
          { type: 'separator' },
          // Log transaction
          { type: 'box', layout: 'horizontal', spacing: 'sm', contents: [
            { type: 'text', text: '📝', size: 'lg' },
            { type: 'text', text: 'การบันทึกรายการ', weight: 'bold', size: 'sm', color: THEME.text },
          ]},
          { type: 'text', text: 'พิมพ์จดบันทึกแบบนี้: "กาแฟ 45", "เงินเดือน 25000"', size: 'xs', color: THEME.subtext, margin: 'md' },
          { type: 'separator' },
          // View summary
          { type: 'box', layout: 'horizontal', spacing: 'sm', contents: [
            { type: 'text', text: '📊', size: 'lg' },
            { type: 'text', text: 'การดูสรุป', weight: 'bold', size: 'sm', color: THEME.text },
          ]},
          { type: 'text', text: 'พิมพ์ "สรุป" หรือ "สรุป 7 วัน"', size: 'xs', color: THEME.subtext, margin: 'md' },
          { type: 'separator' },
          // View categories
          { type: 'box', layout: 'horizontal', spacing: 'sm', contents: [
            { type: 'text', text: '📁', size: 'lg' },
            { type: 'text', text: 'การดูหมวดหมู่', weight: 'bold', size: 'sm', color: THEME.text },
          ]},
          { type: 'text', text: 'พิมพ์ "pocket" หรือ "หมวดหมู่"', size: 'xs', color: THEME.subtext, margin: 'md' },
          { type: 'separator' },
        ]
      }
    }
  }
}

// A lightweight typing indicator using a plain ellipsis text bubble
function buildTypingMessage() {
  return {
    type: 'text',
    text: '…', // single-character ellipsis for a minimal typing look
  }
}

// Optional: image-based typing indicator (e.g., an animated GIF URL)
function buildTypingImageMessage(url) {
  if (!url) return buildTypingMessage()
  return {
    type: 'image',
    originalContentUrl: url,
    previewImageUrl: url,
  }
}

// flex การบันทึกรายการ
function buildConfirmFlex({ description, amount, pocketName, type, transactionId }, opts = {}) {
  const appBase = opts.appBase || process.env.FRONTEND_BASE_URL || 'http://localhost:3000'
  // Deep link directly to the edit page for this transaction
  const editPath = transactionId && type ? `/tx/${encodeURIComponent(type)}/${encodeURIComponent(String(transactionId))}/edit` : '/dashboard'
  const openUri = opts.token
    ? `${appBase}/login-success?token=${encodeURIComponent(opts.token)}&redirect=${encodeURIComponent(editPath)}`
    : `${appBase}${editPath}`
  const sign = type === 'income' ? '+' : '-'
  const palette = type === 'income' ? THEME.income : THEME.expense
  const title = type === 'income' ? 'บันทึกรายรับ' : 'บันทึกรายจ่าย'
  const amountText = `${sign}${formatBaht(amount)}`
  const dateText = formatThaiDate()
  const timeText = formatThaiTime()

  return {
    type: 'flex',
    altText: `${title} ${description} ${amountText}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      styles: {
        header: { backgroundColor: THEME.cardBg },
        body: { backgroundColor: THEME.cardBg },
        footer: { backgroundColor: THEME.cardBg },
      },
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              { type: 'text', text: title, weight: 'bold', size: 'sm', color: palette.accent },
              { type: 'text', text: `• ${dateText} ${timeText}`, size: 'xs', color: THEME.subtext, margin: 'md' },
            ],
          },
          { type: 'text', text: amountText, weight: 'bold', size: '3xl', color: THEME.text, margin: 'sm' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                backgroundColor: palette.accentSoft,
                cornerRadius: '6px',
                paddingAll: '6px',
                contents: [
                  { type: 'text', text: 'หมวด', size: 'xs', color: THEME.subtext },
                  { type: 'text', text: `• ${pocketName}`, size: 'xs', color: THEME.text, margin: 'sm' },
                ],
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: THEME.softBg,
            cornerRadius: '10px',
            paddingAll: '12px',
            contents: [
              { type: 'text', text: 'รายละเอียด', size: 'xs', color: THEME.subtext },
              { type: 'text', text: description, size: 'md', color: THEME.text, wrap: true, margin: 'xs' },
            ],
          },
        ],
      },
      footer: {
        type: 'box', layout: 'horizontal', spacing: 'md', paddingAll: '12px', contents: [
          { type: 'button', style: 'secondary', height: 'sm', action: { type: 'postback', label: 'ยกเลิกรายการ', data: `action=cancel_tx&type=${encodeURIComponent(type)}&tid=${encodeURIComponent(String(transactionId || ''))}` } },
          { type: 'button', style: 'primary', height: 'sm', color: THEME.brand, action: { type: 'uri', label: 'แก้ไขรายการนี้', uri: openUri } },
        ]},
    },
  }
}

// flex สรุปวันนี้
function buildSummaryFlex({ totalIncome, totalExpense, title, subtitle }, opts = {}) {
  const appBase = opts.appBase || process.env.FRONTEND_BASE_URL || 'http://localhost:3000'
  const openUri = opts.token
    ? `${appBase}/login-success?token=${encodeURIComponent(opts.token)}&redirect=${encodeURIComponent('/dashboard')}`
    : `${appBase}`
  const balance = totalIncome - totalExpense
  const dateText = new Date().toLocaleDateString('th-TH', { weekday: 'short', day: '2-digit', month: 'short', timeZone: TimeZone })
  const headerTitle = title || 'สรุปวันนี้'
  const headerSubtitle = subtitle || dateText
  return {
    type: 'flex',
    altText: 'สรุปวันนี้',
    contents: {
      type: 'bubble',
      size: 'mega',
      styles: { header: { backgroundColor: THEME.cardBg }, body: { backgroundColor: THEME.cardBg }, footer: { backgroundColor: THEME.cardBg } },
      header: {
        type: 'box', layout: 'horizontal', paddingAll: '16px', contents: [
          { type: 'text', text: headerTitle, weight: 'bold', size: 'lg', color: THEME.text },
          { type: 'text', text: headerSubtitle, size: 'sm', color: THEME.subtext, align: 'end' },
        ]},
      body: {
        type: 'box', layout: 'vertical', paddingAll: '16px', spacing: 'md', contents: [
          {
            type: 'box', layout: 'horizontal', spacing: 'md', contents: [
              {
                type: 'box', layout: 'vertical', flex: 1, backgroundColor: THEME.softBg, cornerRadius: '10px', paddingAll: '12px', contents: [
                  { type: 'text', text: 'รายรับ', size: 'xs', color: THEME.subtext },
                  { type: 'text', text: `+${formatBaht(totalIncome)}`, size: 'lg', weight: 'bold', color: THEME.income.accent },
                ]
              },
              {
                type: 'box', layout: 'vertical', flex: 1, backgroundColor: THEME.softBg, cornerRadius: '10px', paddingAll: '12px', contents: [
                  { type: 'text', text: 'รายจ่าย', size: 'xs', color: THEME.subtext },
                  { type: 'text', text: `-${formatBaht(totalExpense)}`, size: 'lg', weight: 'bold', color: THEME.expense.accent },
                ]
              }
            ]
          },
          {
            type: 'box', layout: 'vertical', backgroundColor: THEME.softBg, cornerRadius: '12px', paddingAll: '12px', contents: [
              { type: 'text', text: 'คงเหลือ', size: 'xs', color: THEME.subtext },
              { type: 'text', text: `${balance >= 0 ? '+' : ''}${formatBaht(balance)}`, size: 'xl', weight: 'bold', color: balance >= 0 ? THEME.income.accent : THEME.expense.accent },
            ]
          },
        ]},
      footer: { type: 'box', layout: 'horizontal', spacing: 'md', paddingAll: '16px', contents: [
        { type: 'button', style: 'secondary', height: 'sm', action: { type: 'message', label: 'วิธีเพิ่มรายการ', text: 'help' } },
        { type: 'button', style: 'primary', height: 'sm', color: THEME.brand, action: { type: 'uri', label: 'เปิดแอพ', uri: openUri } },
      ]},
    },
  }
}

// flex ยกเลิกรายการเรียบร้อย
function buildCancelSuccessFlex({ amount, type, pocketName, description, deletedAt } = {}) {
  const sign = type === 'income' ? '+' : '-'
  const palette = THEME.expense
  const title = 'ยกเลิกรายการ'
  const amountText = amount != null ? `${sign}${formatBaht(amount)}` : ''
  const dateText = formatThaiDate(deletedAt)
  const timeText = formatThaiTime(deletedAt)

  return {
    type: 'flex',
    altText: `${title} ${description || ''} ${amountText}`.trim(),
    contents: {
      type: 'bubble',
      size: 'mega',
      styles: {
        header: { backgroundColor: THEME.cardBg },
        body: { backgroundColor: THEME.cardBg }
      },
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              { type: 'text', text: title, weight: 'bold', size: 'sm', color: palette.accent },
              { type: 'text', text: `• ${dateText} ${timeText}`.trim(), size: 'xs', color: THEME.subtext, margin: 'md' },
            ],
          },
          amountText ? { type: 'text', text: amountText, weight: 'bold', size: '3xl', color: THEME.text, margin: 'sm' } : { type: 'filler' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        spacing: 'md',
        contents: [
          pocketName ? {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                backgroundColor: palette.accentSoft,
                cornerRadius: '6px',
                paddingAll: '6px',
                contents: [
                  { type: 'text', text: 'หมวด', size: 'xs', color: THEME.subtext },
                  { type: 'text', text: `• ${pocketName}`, size: 'xs', color: THEME.text, margin: 'sm' },
                ],
              },
            ],
          } : { type: 'filler' },
          description ? {
            type: 'box',
            layout: 'vertical',
            backgroundColor: THEME.softBg,
            cornerRadius: '10px',
            paddingAll: '12px',
            contents: [
              { type: 'text', text: 'รายละเอียด', size: 'xs', color: THEME.subtext },
              { type: 'text', text: description, size: 'md', color: THEME.text, wrap: true, margin: 'xs' },
            ],
          } : { type: 'filler' },
        ],
      },
    },
  }
}

module.exports = {
  buildHelpMessage,
  buildConfirmFlex,
  buildSummaryFlex,
  buildCancelSuccessFlex,
  buildOnboardingFlex,
  buildTypingMessage,
  buildTypingImageMessage,
}

// Extra: build a pockets overview Flex (grouped by income/expense)
function chip(text, colorBg) {
  return {
    type: 'box', layout: 'baseline', cornerRadius: '12px', paddingAll: '6px', backgroundColor: colorBg, contents: [
      { type: 'text', text, size: 'xs', color: THEME.text, wrap: true },
    ]
  }
}

function mapChips(pockets, softBg) {
  const items = pockets.map(p => chip(`${p.name}`, softBg))
  const rows = []
  for (let i = 0; i < items.length; i += 2) {
    rows.push({ type: 'box', layout: 'horizontal', spacing: 'sm', contents: items.slice(i, i + 2) })
  }
  return rows.length ? rows : [{ type: 'text', text: '— ไม่มีหมวด —', size: 'xs', color: THEME.subtext }]
}

function buildPocketsFlex({ incomePockets = [], expensePockets = [] }, opts = {}) {
  const appBase = opts.appBase || process.env.FRONTEND_BASE_URL || 'http://localhost:3000'
  const openUri = opts.token
    ? `${appBase}/login-success?token=${encodeURIComponent(opts.token)}&redirect=${encodeURIComponent('/cloudpocket')}`
    : `${appBase}`
  return {
    type: 'flex',
    altText: 'หมวดหมู่ของคุณ',
    contents: {
      type: 'bubble', size: 'mega', styles: { body: { backgroundColor: THEME.cardBg }, footer: { backgroundColor: THEME.cardBg } },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '16px', spacing: 'md', contents: [
          { type: 'text', text: 'หมวดหมู่ของคุณ', weight: 'bold', size: 'lg', color: THEME.text },
          { type: 'separator' },
          { type: 'text', text: 'รายรับ', size: 'xs', color: THEME.income.accent },
          ...mapChips(incomePockets.slice(0, 8), THEME.income.accentSoft),
          { type: 'separator' },
          { type: 'text', text: 'รายจ่าย', size: 'xs', color: THEME.expense.accent },
          ...mapChips(expensePockets.slice(0, 8), THEME.expense.accentSoft),
        ]
      },
      footer: {
        type: 'box', layout: 'horizontal', spacing: 'md', paddingAll: '16px', contents: [
          { type: 'button', style: 'primary', color: THEME.brand, height: 'sm', action: { type: 'uri', label: 'ตั้งค่า Pocket', uri: openUri } },
        ]
      }
    }
  }
}

module.exports.buildPocketsFlex = buildPocketsFlex

function buildOnboardingFlex(opts = {}) {
  const appBase = opts.appBase || process.env.FRONTEND_BASE_URL || 'http://localhost:3000'
  const token = opts.token
  const openAppUri = token ? `${appBase}/login-success?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent('/dashboard')}` : `${appBase}`
  const onboardingUri = token ? `${appBase}/login-success?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent('/onboarding')}` : `${appBase}/onboarding`
  return {
    type: 'flex',
    altText: 'เริ่มต้นใช้งาน Cloud Pocket',
    contents: {
      type: 'bubble', size: 'mega', styles: { body: { backgroundColor: THEME.cardBg }, footer: { backgroundColor: THEME.cardBg } },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '16px', spacing: 'md', contents: [
          { type: 'text', text: 'ยินดีต้อนรับ 👋', weight: 'bold', size: 'lg', color: THEME.text },
          { type: 'text', text: 'เริ่มเชื่อมบัญชีและตั้งค่าหมวดหมู่ (Pocket) ก่อนใช้งานบันทึกรายรับรายจ่าย', size: 'sm', color: THEME.subtext, wrap: true },
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '16px', contents: [
          { type: 'button', style: 'primary', height: 'sm', color: THEME.brand, action: { type: 'uri', label: 'เปิดแอพ', uri: openAppUri } },
          { type: 'button', style: 'secondary', height: 'sm', action: { type: 'uri', label: 'ตั้งค่า Pocket', uri: onboardingUri } },
          { type: 'text', text: 'หรือพิมพ์ help เพื่อดูวิธีใช้งาน', size: 'xs', color: THEME.subtext, align: 'center' }
        ]
      }
    }
  }
}
