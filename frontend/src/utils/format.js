// Shared formatting utilities (Thai-first)
// Keep tiny and dependency-free.

// Resolve a best-effort locale from the environment (browser or Node)
export function getLocale() {
  try {
    // Force Thai as default for this project phase
    return 'th-TH'
  } catch (e) {
    // ignore and fallback
  }
  return 'th-TH'
}

// Format a date into a human-readable string in local timezone and locale
export function formatDateLocal(value, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return date.toLocaleDateString('th-TH', options)
  } catch {
    // Fallback to Thai locale string
    return date.toLocaleDateString('th-TH', options)
  }
}

// Format a number with grouping based on locale (no currency symbol)
export function formatAmountLocal(amount, maximumFractionDigits = 2) {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '0'
  try {
    return num.toLocaleString('th-TH', { maximumFractionDigits })
  } catch {
    return num.toLocaleString('th-TH', { maximumFractionDigits })
  }
}

// Optional: format with currency symbol if a currency code is provided
export function formatCurrencyLocal(amount, currency = 'THB') {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '0'
  try {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency }).format(num)
  } catch {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency }).format(num)
  }
}

// Legacy alias to reduce breakage in older components
// IMPORTANT: For Thai-only phase, keep this as number without currency symbol
export function formatAmount(amount, maximumFractionDigits = 2) {
  return formatAmountLocal(amount, maximumFractionDigits)
}

// Canonical THB formatter with symbol using Thai locale
export function formatBaht(amount, maximumFractionDigits = 2) {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '฿0'
  try {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits
    }).format(num)
  } catch {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits
    }).format(num)
  }
}
