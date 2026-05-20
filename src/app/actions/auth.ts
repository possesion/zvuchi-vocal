'use server'

import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser, updateUser, getUserByVerificationToken } from '@/lib/db'
import { generateVerificationToken } from './utils'


function getTokenExpiresAt(): string {
    const expires = new Date()
    expires.setHours(expires.getHours() + 24)
    return expires.toISOString()
}

export async function dispatchVerificationEmail(email: string, token: string): Promise<void> {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
    })
    if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to send verification email')
    }
}

export async function registerUser(data: {
    email: string
    password: string
}): Promise<{ success: boolean; error?: string }> {
    const { email, password } = data

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
        return { success: false, error: 'Введите корректный email' }
    }

    // Validate password length
    if (!password || password.length < 8) {
        return { success: false, error: 'Пароль должен содержать не менее 8 символов' }
    }

    // Check uniqueness
    const existing = getUserByEmail(email)
    if (existing) {
        return { success: false, error: 'Этот email уже зарегистрирован' }
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const verificationToken = generateVerificationToken()
    const tokenExpiresAt = getTokenExpiresAt()

    createUser({
        email,
        passwordHash,
        role: 'client',
        verificationToken,
        tokenExpiresAt,
    })

    // Отправляем письмо (не блокируем регистрацию при ошибке отправки)
    try {
        await dispatchVerificationEmail(email, verificationToken)
    } catch (err) {
        console.error('Failed to send verification email:', err)
        // Пользователь создан, может запросить повторную отправку через /resend-verification
    }

    return { success: true }
}

export async function verifyEmail(
    token: string
): Promise<{ success: boolean; error?: string }> {
    if (!token) {
        return { success: false, error: 'Ссылка недействительна или устарела' }
    }

    const user = getUserByVerificationToken(token)
    if (!user) {
        return { success: false, error: 'Ссылка недействительна или устарела' }
    }

    // Check expiry
    if (user.token_expires_at) {
        const expires = new Date(user.token_expires_at)
        if (expires < new Date()) {
            return { success: false, error: 'Ссылка недействительна или устарела' }
        }
    }

    updateUser(user.id, {
        email_verified: 1,
        verification_token: null,
        token_expires_at: null,
    })

    return { success: true }
}

export async function resendVerification(
    email: string
): Promise<{ success: boolean; error?: string }> {
    if (!email) {
        return { success: false, error: 'Введите email' }
    }

    const user = getUserByEmail(email)
    if (!user) {
        // Don't reveal whether email exists
        return { success: true }
    }

    if (user.email_verified === 1) {
        return { success: false, error: 'Email уже подтверждён' }
    }

    const verificationToken = generateVerificationToken()
    const tokenExpiresAt = getTokenExpiresAt()

    updateUser(user.id, {
        verification_token: verificationToken,
        token_expires_at: tokenExpiresAt,
    })

    try {
        await dispatchVerificationEmail(email, verificationToken)
    } catch (err) {
        console.error('Failed to send verification email:', err)
        return { success: false, error: 'Ошибка при отправке письма. Попробуйте позже.' }
    }

    return { success: true }
}
