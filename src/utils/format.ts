/**
 * Format date to a human-readable format
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format number to currency
 * @param value Number to format
 * @param currency Currency code
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency = 'UZS'): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(value)
}
