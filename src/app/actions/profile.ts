'use server'

import { auth } from '@/auth'
import { getUserById, updateUser } from '@/lib/db-prisma'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/app/actions/types'

export async function updateUserName(name: string): Promise<ActionResult<void>> {
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

        await updateUser(userId, { 
            name: name.trim() || null 
        })

        revalidatePath('/profile')
        
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Failed to update user name:', error)
        return { success: false, error: 'Ошибка при обновлении имени' }
    }
}

export async function updateUserProfile(data: {
    name: string | null;
    phone: string | null;
}): Promise<ActionResult<void>> {
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

        // Валидация телефона
        if (data.phone) {
            const phoneRegex = /^\+7\d{10}$/
            if (!phoneRegex.test(data.phone)) {
                return { success: false, error: 'Неверный формат номера телефона' }
            }
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
        
        return { success: true, data: undefined }
    } catch (error) {
        console.error('Failed to update user profile:', error)
        return { success: false, error: 'Ошибка при обновлении профиля' }
    }
}
