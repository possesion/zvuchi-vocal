'use server'

import { auth } from '@/auth'
import { getUserById, updateUser } from '@/lib/db-prisma'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/app/actions/types'
import { createModuleLogger } from '@/lib/logger'
import {
    logActionStart,
    logActionSuccess,
    logActionFailure,
    logActionError,
} from '@/lib/action-logger'

const log = createModuleLogger('profile')

export async function updateUserName(name: string): Promise<ActionResult<void>> {
    const action = 'updateUserName'
    const startedAt = performance.now()
    logActionStart(action, { module: 'profile' })
    try {
        const session = await auth()
        if (!session?.user?.id) {
            logActionFailure(action, 'unauthorized', { module: 'profile' })
            return { success: false, error: 'Не авторизован' }
        }

        const userId = parseInt(session.user.id)
        const user = await getUserById(userId)
        
        if (!user) {
            logActionFailure(action, 'user-not-found', { module: 'profile', userId })
            return { success: false, error: 'Пользователь не найден' }
        }

        await updateUser(userId, { 
            name: name.trim() || null 
        })

        revalidatePath('/profile')

        logActionSuccess(action, {
            module: 'profile',
            userId,
            durationMs: Math.round(performance.now() - startedAt),
        })
        return { success: true, data: undefined }
    } catch (error) {
        log.error('Failed to update user name', { err: error })
        logActionError(action, error, { module: 'profile' })
        return { success: false, error: 'Ошибка при обновлении имени' }
    }
}

export async function updateUserProfile(data: {
    name: string | null;
    phone: string | null;
}): Promise<ActionResult<void>> {
    const action = 'updateUserProfile'
    const startedAt = performance.now()
    logActionStart(action, { module: 'profile' })
    try {
        const session = await auth()
        if (!session?.user?.id) {
            logActionFailure(action, 'unauthorized', { module: 'profile' })
            return { success: false, error: 'Не авторизован' }
        }

        const userId = parseInt(session.user.id)
        const user = await getUserById(userId)
        
        if (!user) {
            logActionFailure(action, 'user-not-found', { module: 'profile', userId })
            return { success: false, error: 'Пользователь не найден' }
        }

        // Валидация телефона
        if (!data.phone) {
            logActionFailure(action, 'phone-missing', { module: 'profile', userId })
            return { success: false, error: 'Номер телефона отсутствует' }
        }

        // Если телефон изменился, сбрасываем верификацию
        const updateData: {
            name: string | null;
            phone: string | null;
            phoneVerified?: false;
            phoneVerifyCode?: null;
            phoneCodeExpires?: null;
        } = {
            name: data.name,
            phone: data.phone,
        };

        if (data.phone !== user.phone) {
            updateData.phoneVerified = false;
            updateData.phoneVerifyCode = null;
            updateData.phoneCodeExpires = null;
        }

        await updateUser(userId, updateData)

        revalidatePath('/profile')

        logActionSuccess(action, {
            module: 'profile',
            userId,
            phoneChanged: data.phone !== user.phone,
            durationMs: Math.round(performance.now() - startedAt),
        })
        return { success: true, data: undefined }
    } catch (error) {
        log.error('Failed to update user profile', { err: error })
        logActionError(action, error, { module: 'profile' })
        return { success: false, error: 'Ошибка при обновлении профиля' }
    }
}
