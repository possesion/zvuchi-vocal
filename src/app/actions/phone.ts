'use server'

import { auth } from '@/auth'
import { getUserById, updateUser } from '@/lib/db-prisma'
import { sendSms, generateVerificationCode } from '@/lib/sms-aero'
import { revalidatePath } from 'next/cache'
import { VerifyPhoneCodeResult } from './types'

/**
 * Отправка кода верификации на телефон
 */
export async function sendPhoneVerification(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Не авторизован' }
        }

        // Валидация российского номера
        const phoneRegex = /^\+7\d{10}$/
        if (!phoneRegex.test(phone)) {
            return { success: false, error: 'Неверный формат номера. Используйте +79991234567' }
        }

        const userId = parseInt(session.user.id)
        const user = await getUserById(userId)
        
        if (!user) {
            return { success: false, error: 'Пользователь не найден' }
        }

        // Генерируем код
        const code = generateVerificationCode()
        
        // Срок действия кода - 2 минуты
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString()
        // Отправляем SMS
        const smsResult = await sendSms(phone, `Ваш код подтверждения номера телефона на сайте zvuchi-vocal.ru: ${code}`)
        
        if (!smsResult.success) {
            return { success: false, error: smsResult.message || 'Ошибка при отправке SMS' }
        }

        // Сохраняем код и телефон в БД
        await updateUser(userId, {
            phone: phone,
            phone_verified: 0, // Сбрасываем верификацию при смене номера
            phone_verify_code: code,
            phone_code_expires: expiresAt,
        })

        revalidatePath('/profile')
        
        return { success: true }
    } catch (error) {
        console.error('Failed to send phone verification:', error)
        return { success: false, error: 'Ошибка при отправке кода' }
    }
}

/**
 * Проверка кода верификации
 */
export async function verifyPhoneCode(code: string): Promise<VerifyPhoneCodeResult> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Не авторизован' }
        }

        const userId = parseInt(session.user.id)
        const user = await getUserById(userId)
        
        if (!user) {
            return { success: false, error: 'Пользователь не найден' }
        }

        // Проверяем наличие кода
        if (!user.phone_verify_code) {
            return { success: false, error: 'Код не был отправлен' }
        }

        // Проверяем срок действия
        if (!user.phone_code_expires || new Date(user.phone_code_expires) < new Date()) {
            return { success: false, error: 'Код истёк. Запросите новый код' }
        }

        // Проверяем правильность кода
        if (user.phone_verify_code !== code.trim()) {
            return { success: false, error: 'Неверный код' }
        }

        // Подтверждаем телефон
        await updateUser(userId, {
            phone_verified: 1,
            phone_verify_code: null,
            phone_code_expires: null,
        })

        revalidatePath('/profile')
        
        return { success: true }
    } catch (error) {
        console.error('Failed to verify phone code:', error)
        return { success: false, error: 'Ошибка при проверке кода' }
    }
}
