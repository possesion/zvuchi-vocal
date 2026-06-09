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

export function formatDate(dateString: string | null): string {
    if (!dateString) return 'Не указано';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
}

export function formatDateTime(dateString: string | null): string {
    if (!dateString) return 'Не указано';
    try {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const timeStr = date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        return `${dateStr} в ${timeStr}`;
    } catch {
        return dateString;
    }
}

export function formatBalance(balance: number | null): string {
    if (balance === null || balance === undefined) return 'Не указано';
    return `${balance.toLocaleString('ru-RU')} ₽`;
}

export function formatLessonCount(count: number | null): string {
    if (count === null || count === undefined) return 'Не указано';
    if (count === 0) return 'Нет доступных уроков';

    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${count} уроков`;
    }
    if (lastDigit === 1) return `${count} урок`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${count} урока`;

    return `${count} уроков`;
}
