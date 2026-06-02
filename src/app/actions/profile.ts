'use server'

import { auth } from '@/auth'
import { getUserById, updateUser } from '@/lib/db-prisma'
import { revalidatePath } from 'next/cache'

export async function updateUserName(name: string): Promise<{ success: boolean; error?: string }> {
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
        
        return { success: true }
    } catch (error) {
        console.error('Failed to update user name:', error)
        return { success: false, error: 'Ошибка при обновлении имени' }
    }
}
