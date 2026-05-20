export function validate(email: string, password: string): string | null {
    if (!email) return 'Введите email'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Некорректный формат email'
    if (!password) return 'Введите пароль'
    if (password.length < 8) return 'Пароль должен содержать не менее 8 символов'
    return null
}