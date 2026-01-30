/**
 * Composable for common formatting functions
 */
export function useFormatters() {
  function formatDate(date: string | Date | null, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '—'
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }
    return new Date(date).toLocaleDateString('vi-VN', defaultOptions)
  }

  function formatDateTime(date: string | Date | null): string {
    return formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatCurrency(amount: number | string | null): string {
    if (amount === null || amount === undefined) return '—'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(num)
  }

  function formatNumber(num: number | null): string {
    if (num === null || num === undefined) return '—'
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  return {
    formatDate,
    formatDateTime,
    formatCurrency,
    formatNumber,
  }
}
