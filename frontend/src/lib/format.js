// Amounts are shown without a currency symbol — always 2 decimals, and the
// minus sign is kept for negative balances.
export function formatMoney(amount) {
  const value = Number(amount ?? 0)
  const sign = value < 0 ? '-' : ''
  const formatted = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${sign}${formatted}`
}

// Same idea but without forcing trailing decimals — used for compact
// "spent / limit" and "saved of target" pairs.
export function formatNumber(amount) {
  return Number(amount ?? 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })
}
