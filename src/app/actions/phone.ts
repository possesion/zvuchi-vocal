'use server'

import { auth } from '@/auth'
import { getUserById, updateUser, canSendSms, logSmsSent } from '@/lib/db-prisma'
import { sendSms, generateVerificationCode } from '@/lib/sms-aero'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { ActionResult } from './types'

/**
 * Get client IP address from request headers
 */
async function getClientIp(): Promise<string | null> {
  const headersList = await headers()
  const realIpHeaders = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || headersList.get('x-real-ip') 
      || null
  console.log('[SMS Aero] header: ', realIpHeaders);

  return realIpHeaders
}

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

        // Получаем IP адрес
        const clientIp = await getClientIp()
        
        // Проверяем rate limiting
        const rateCheck = await canSendSms(phone.replace(/\+/g, ''), clientIp)
        if (!rateCheck.allowed) {
            return { success: false, error: rateCheck.reason }
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

        // Логируем отправку
        await logSmsSent(phone.replace(/\+/g, ''), clientIp, userId)

        // Сохраняем код и телефон в БД
        await updateUser(userId, {
            phone: phone,
            phoneVerified: false, // Сбрасываем верификацию при смене номера
            phoneVerifyCode: code,
            phoneCodeExpires: expiresAt,
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
export async function verifyPhoneCode(code: string): Promise<ActionResult<void>> {
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
        if (!user.phoneVerifyCode) {
            return { success: false, error: 'Код не был отправлен' }
        }

        // Проверяем срок действия
        if (!user.phoneCodeExpires || new Date(user.phoneCodeExpires) < new Date()) {
            return { success: false, error: 'Код истёк. Запросите новый код' }
        }

        // Проверяем правильность кода
        if (user.phoneVerifyCode !== code.trim()) {
            return { success: false, error: 'Неверный код' }
        }

        // Подтверждаем телефон
        await updateUser(userId, {
            phoneVerified: true,
            phoneVerifyCode: null,
            phoneCodeExpires: null,
        })

        revalidatePath('/profile')
        
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Failed to verify phone code:', error)
        return { success: false, error: 'Ошибка при проверке кода' }
    }
}
