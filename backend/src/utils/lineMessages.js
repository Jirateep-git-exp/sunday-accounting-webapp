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
const TimeZone = process.env.APP_TIMEZONE || 'UTC'

function formatLocalDate(date) {
  const d = date ? new Date(date) : new Date()
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', timeZone: TimeZone })
}

function formatLocalTime(date) {
  const d = date ? new Date(date) : new Date()
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: TimeZone })
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
    text: 'Type to log like: "coffee 45", "noodles 100", or "salary 25000"\nCommands: help, today, balance',
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
  const title = type === 'income' ? 'Income recorded' : 'Expense recorded'
  const amountText = `${sign}${formatCurrency(amount)}`
  const dateText = formatLocalDate()
  const timeText = formatLocalTime()

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
                  { type: 'text', text: 'Category', size: 'xs', color: THEME.subtext },
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
              { type: 'text', text: 'Description', size: 'xs', color: THEME.subtext },
              { type: 'text', text: description, size: 'md', color: THEME.text, wrap: true, margin: 'xs' },
            ],
          },
        ],
      },
      footer: {
        type: 'box', layout: 'horizontal', spacing: 'md', paddingAll: '12px', contents: [
          { type: 'button', style: 'secondary', height: 'sm', action: { type: 'postback', label: 'Cancel', data: `action=cancel_tx&type=${encodeURIComponent(type)}&tid=${encodeURIComponent(String(transactionId || ''))}` } },
          { type: 'button', style: 'primary', height: 'sm', color: THEME.brand, action: { type: 'uri', label: 'Edit this entry', uri: openUri } },
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
  const dateText = new Date().toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', timeZone: TimeZone })
  const headerTitle = title || 'Today summary'
  const headerSubtitle = subtitle || dateText
  return {
    type: 'flex',
    altText: 'Today summary',
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
                  { type: 'text', text: 'Income', size: 'xs', color: THEME.subtext },
                  { type: 'text', text: `+${formatCurrency(totalIncome)}`, size: 'lg', weight: 'bold', color: THEME.income.accent },
                ]
              },
              {
                type: 'box', layout: 'vertical', flex: 1, backgroundColor: THEME.softBg, cornerRadius: '10px', paddingAll: '12px', contents: [
                  { type: 'text', text: 'Expenses', size: 'xs', color: THEME.subtext },
                  { type: 'text', text: `-${formatCurrency(totalExpense)}`, size: 'lg', weight: 'bold', color: THEME.expense.accent },
                ]
              }
            ]
          },
          {
            type: 'box', layout: 'vertical', backgroundColor: THEME.softBg, cornerRadius: '12px', paddingAll: '12px', contents: [
              { type: 'text', text: 'Balance', size: 'xs', color: THEME.subtext },
              { type: 'text', text: `${balance >= 0 ? '+' : ''}${formatCurrency(balance)}`, size: 'xl', weight: 'bold', color: balance >= 0 ? THEME.income.accent : THEME.expense.accent },
            ]
          },
        ]},
      footer: { type: 'box', layout: 'horizontal', spacing: 'md', paddingAll: '16px', contents: [
        { type: 'button', style: 'secondary', height: 'sm', action: { type: 'message', label: 'Add item', text: 'coffee 45' } },
        { type: 'button', style: 'primary', height: 'sm', color: THEME.brand, action: { type: 'uri', label: 'Open app', uri: openUri } },
      ]},
    },
  }
}

// flex ยกเลิกรายการเรียบร้อย
function buildCancelSuccessFlex({ amount, type, pocketName, description, deletedAt } = {}) {
  const sign = type === 'income' ? '+' : '-'
  const palette = THEME.expense
  const title = 'Transaction cancelled'
  const amountText = amount != null ? `${sign}${formatCurrency(amount)}` : ''
  const dateText = formatLocalDate(deletedAt)
  const timeText = formatLocalTime(deletedAt)

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
                  { type: 'text', text: 'Category', size: 'xs', color: THEME.subtext },
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
              { type: 'text', text: 'Description', size: 'xs', color: THEME.subtext },
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
  return rows.length ? rows : [{ type: 'text', text: '— No categories —', size: 'xs', color: THEME.subtext }]
}

function buildPocketsFlex({ incomePockets = [], expensePockets = [] }, opts = {}) {
  const appBase = opts.appBase || process.env.FRONTEND_BASE_URL || 'http://localhost:3000'
  const openUri = opts.token
    ? `${appBase}/login-success?token=${encodeURIComponent(opts.token)}&redirect=${encodeURIComponent('/cloudpocket')}`
    : `${appBase}`
  return {
    type: 'flex',
    altText: 'Your categories',
    contents: {
      type: 'bubble', size: 'mega', styles: { body: { backgroundColor: THEME.cardBg }, footer: { backgroundColor: THEME.cardBg } },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '16px', spacing: 'md', contents: [
          { type: 'text', text: 'Your categories', weight: 'bold', size: 'lg', color: THEME.text },
          { type: 'separator' },
          { type: 'text', text: 'Income', size: 'xs', color: THEME.income.accent },
          ...mapChips(incomePockets.slice(0, 8), THEME.income.accentSoft),
          { type: 'separator' },
          { type: 'text', text: 'Expenses', size: 'xs', color: THEME.expense.accent },
          ...mapChips(expensePockets.slice(0, 8), THEME.expense.accentSoft),
        ]
      },
      footer: {
        type: 'box', layout: 'horizontal', spacing: 'md', paddingAll: '16px', contents: [
          { type: 'button', style: 'secondary', height: 'sm', action: { type: 'message', label: 'Quick add', text: 'coffee 45' } },
          { type: 'button', style: 'primary', color: THEME.brand, height: 'sm', action: { type: 'uri', label: 'Configure pockets', uri: openUri } },
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
    altText: 'Getting started with Cloud Pocket',
    contents: {
      type: 'bubble', size: 'mega', styles: { body: { backgroundColor: THEME.cardBg }, footer: { backgroundColor: THEME.cardBg } },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '16px', spacing: 'md', contents: [
          { type: 'text', text: 'Welcome 👋', weight: 'bold', size: 'lg', color: THEME.text },
          { type: 'text', text: 'Connect your account and set up categories (Pockets) before tracking income and expenses.', size: 'sm', color: THEME.subtext, wrap: true },
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '16px', contents: [
          { type: 'button', style: 'primary', height: 'sm', color: THEME.brand, action: { type: 'uri', label: 'Open app', uri: openAppUri } },
          { type: 'button', style: 'secondary', height: 'sm', action: { type: 'uri', label: 'Configure pockets', uri: onboardingUri } },
          { type: 'text', text: 'Or type help to see how it works', size: 'xs', color: THEME.subtext, align: 'center' }
        ]
      }
    }
  }
}
