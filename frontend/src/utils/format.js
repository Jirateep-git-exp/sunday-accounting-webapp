// Shared formatting utilities using the device/runtime locale
// Keep tiny and dependency-free.

// Resolve a best-effort locale from the environment (browser or Node)
export function getLocale() {
  try {
    if (typeof Intl !== 'undefined') {
      const opts = Intl.DateTimeFormat().resolvedOptions?.()
      if (opts?.locale) return opts.locale
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language
    }
  } catch (e) {
    // ignore and fallback
  }
  return 'en-US'
}

// Format a date into a human-readable string in local timezone and locale
export function formatDateLocal(value, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return date.toLocaleDateString(undefined, options)
  } catch {
    // Fallback to en-US
    return date.toLocaleDateString('en-US', options)
  }
}

// Format a number with grouping based on locale (no currency symbol)
export function formatAmountLocal(amount, maximumFractionDigits = 2) {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '0'
  try {
    return num.toLocaleString(undefined, { maximumFractionDigits })
  } catch {
    return num.toLocaleString('en-US', { maximumFractionDigits })
  }
}

// Optional: format with currency symbol if a currency code is provided
export function formatCurrencyLocal(amount, currency = 'USD') {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '0'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num)
  } catch {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num)
  }
}

// Legacy alias to reduce breakage in older components
// Use formatCurrencyLocal under the hood, defaulting to USD
export function formatAmount(amount, currency = 'USD') {
  return formatCurrencyLocal(amount, currency)
}
