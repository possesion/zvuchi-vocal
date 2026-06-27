'use server'

/**
 * Server Actions для верификации телефона
 * 
 * ВАЖНО: Верификация теперь использует MobileID SDK.
 * Эти actions оставлены для совместимости, но основные функции
 * переехали в API routes:
 * - /api/mobileid/token - получение токена сессии
 * - /api/mobileid/siteverify - server-to-server верификация
 */

// import { auth } from '@/auth'
// import { getUserById } from '@/lib/db-prisma'
// import { revalidatePath } from 'next/cache'
import { ActionResult } from './types'

/**
 * Получение IP клиента из заголовков запроса
 */
// async function getClientIp(): Promise<string | null> {
//   const headersList = await headers()
//   const realIpHeaders = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() 
//       || headersList.get('x-real-ip') 
//       || null
//   console.log('[MobileID] Client IP: ', realIpHeaders);

//   return realIpHeaders
// }

/**
 * Отправка кода верификации на телефон (DEPRECATED)
 * 
 * @deprecated Используйте MobileID SDK через useMobileID хук
 * Этот метод оставлен для обратной совместимости, но не рекомендуется к использованию
 */
export async function sendPhoneVerification(): Promise<{ success: boolean; error?: string }> {
    // Возвращаем ошибку - нужно использовать MobileID SDK
    return { 
        success: false, 
        error: 'Используйте новый метод верификации через MobileID SDK' 
    }
}

/**
 * Проверка кода верификации (DEPRECATED)
 * 
 * @deprecated Верификация теперь происходит через /api/mobileid/siteverify
 */
export async function verifyPhoneCode(): Promise<ActionResult<void>> {
    // Возвращаем ошибку - нужно использовать MobileID SDK
    return { 
        success: false, 
        error: 'Используйте новый метод верификации через MobileID SDK' 
    }
}
