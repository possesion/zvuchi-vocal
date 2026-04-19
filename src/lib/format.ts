export function formatPhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, '')
    const normalized = digits.startsWith('8') ? '7' + digits.slice(1) : digits

    if (normalized.length === 0) return ''
    if (normalized.length <= 1) return `+${normalized}`
    if (normalized.length <= 4) return `+7 (${normalized.slice(1)}`
    if (normalized.length <= 7) return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4)}`
    if (normalized.length <= 9) return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7)}`
    return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
    }).format(price)
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date)
}
