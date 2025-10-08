// Helper builders for LINE Messaging API payloads (styled for an accounting UX)

const THEME = {
  darkBg: '#0B1220',
  cardBg: '#0E141B',
  text: '#E5E7EB',
  subtext: '#9CA3AF',
  border: '#1F2937',
  income: {
    accent: '#22C55E', // emerald-500
    accentSoft: '#0B2D1A',
  },
  expense: {
    accent: '#F43F5E', // rose-500
    accentSoft: '#30151B',
  },
  brand: '#4F46E5',
}

function formatCurrency(amount) {
  try {
    return amount.toLocaleString('th-TH')
  } catch (_) {
    return String(amount)
  }
}

function buildHelpMessage() {
  return {
    type: 'text',
    text: 'พิมพ์จดบันทึกแบบนี้: "กาแฟ 45", "มาม่า100", หรือ "เงินเดือน25000"\nคำสั่ง: help, สรุปวันนี้, ยอดคงเหลือ',
  }
}

function buildConfirmFlex({ description, amount, pocketName, type }) {
  const sign = type === 'income' ? '+' : '-'
  const palette = type === 'income' ? THEME.income : THEME.expense
  const title = type === 'income' ? 'บันทึกรายรับ' : 'บันทึกรายจ่าย'
  const amountText = `${sign}${formatCurrency(amount)} บาท`
  const today = new Date()
  const dateText = today.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeText = today.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

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
            backgroundColor: THEME.darkBg,
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
        type: 'box',
        layout: 'horizontal',
        spacing: 'md',
        paddingAll: '16px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: palette.accent,
            height: 'sm',
            action: { type: 'message', label: 'เพิ่มอีก', text: 'เพิ่มอีก' },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            color: THEME.brand,
            action: { type: 'message', label: 'สรุปวันนี้', text: 'สรุปวันนี้' },
          },
        ],
      },
    },
  }
}

function buildSummaryFlex({ totalIncome, totalExpense, title, subtitle }) {
  const balance = totalIncome - totalExpense
  const dateText = new Date().toLocaleDateString('th-TH', { weekday: 'short', day: '2-digit', month: 'short' })
  const headerTitle = title || 'สรุปวันนี้'
  const headerSubtitle = subtitle || dateText
  return {
    type: 'flex',
    altText: 'สรุปวันนี้',
    contents: {
      type: 'bubble',
      size: 'mega',
      styles: {
        header: { backgroundColor: THEME.cardBg },
        body: { backgroundColor: THEME.cardBg },
        footer: { backgroundColor: THEME.cardBg },
      },
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
                type: 'box', layout: 'vertical', flex: 1, backgroundColor: THEME.darkBg, cornerRadius: '10px', paddingAll: '12px', contents: [
                  { type: 'text', text: 'รายรับ', size: 'xs', color: THEME.subtext },
                  { type: 'text', text: `+${formatCurrency(totalIncome)} บาท`, size: 'lg', weight: 'bold', color: THEME.income.accent },
                ]
              },
              {
                type: 'box', layout: 'vertical', flex: 1, backgroundColor: THEME.darkBg, cornerRadius: '10px', paddingAll: '12px', contents: [
                  { type: 'text', text: 'รายจ่าย', size: 'xs', color: THEME.subtext },
                  { type: 'text', text: `-${formatCurrency(totalExpense)} บาท`, size: 'lg', weight: 'bold', color: THEME.expense.accent },
                ]
              }
            ]
          },
          {
            type: 'box', layout: 'vertical', backgroundColor: THEME.darkBg, cornerRadius: '12px', paddingAll: '12px', contents: [
              { type: 'text', text: 'คงเหลือ', size: 'xs', color: THEME.subtext },
              { type: 'text', text: `${balance >= 0 ? '+' : ''}${formatCurrency(balance)} บาท`, size: 'xl', weight: 'bold', color: balance >= 0 ? THEME.income.accent : THEME.expense.accent },
            ]
          },
        ]},
      footer: {
        type: 'box', layout: 'horizontal', spacing: 'md', paddingAll: '16px', contents: [
          { type: 'button', style: 'secondary', height: 'sm', action: { type: 'message', label: 'เพิ่มรายการ', text: 'กาแฟ 45' } },
          { type: 'button', style: 'primary', height: 'sm', color: THEME.brand, action: { type: 'message', label: 'บันทึกรายรับ', text: 'เงินเดือน 1000' } },
        ]},
    },
  }
}

module.exports = {
  buildHelpMessage,
  buildConfirmFlex,
  buildSummaryFlex,
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
  const items = pockets.map(p => chip(`${p.icon ? p.icon + ' ' : ''}${p.name}`, softBg))
  // Arrange chips in rows of up to 2 per row (Flex supports horizontal boxes)
  const rows = []
  for (let i = 0; i < items.length; i += 2) {
    rows.push({ type: 'box', layout: 'horizontal', spacing: 'sm', contents: items.slice(i, i + 2) })
  }
  return rows.length ? rows : [{ type: 'text', text: '— ไม่มีหมวด —', size: 'xs', color: THEME.subtext }]
}

function buildPocketsFlex({ incomePockets = [], expensePockets = [] }) {
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
          { type: 'button', style: 'secondary', height: 'sm', action: { type: 'message', label: 'เพิ่มรายการ', text: 'กาแฟ 45' } },
          { type: 'button', style: 'primary', color: THEME.brand, height: 'sm', action: { type: 'uri', label: 'เปิดแอพ', uri: 'https://your-frontend-url/pockets' } },
        ]
      }
    }
  }
}

module.exports.buildPocketsFlex = buildPocketsFlex
