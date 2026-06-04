'use server'

import { auth } from '@/auth'
import { getUserById } from '@/lib/db-prisma'
import { getClientData } from '@/lib/alfa-crm'

export interface ClientBalanceData {
    balance: number | null; // Баланс счёта
    lessonCount: number | null; // Остаток уроков
    nextLessonDate: string | null; // Дата следующего урока
    lastAttendDate: string | null; // Дата последнего посещения
    paidCount: string | null; // Количество оплаченных занятий
}

export async function getClientBalance(): Promise<{
    success: boolean;
    data?: ClientBalanceData;
    error?: string;
}> {
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

        // Проверяем, что телефон подтверждён
        if (!user.phone || user.phone_verified !== 1) {
            return {
                success: false,
                error: 'Для получения данных об абонементе необходимо подтвердить номер телефона',
            }
        }

        // Получаем данные из CRM
        const clientData = await getClientData(user.phone)

        if (!clientData) {
            return {
                success: false,
                error: 'Клиент не найден в CRM. Обратитесь к администратору.',
            }
        }
        // Формируем данные для отображения
        const balanceData: ClientBalanceData = {
            balance: clientData.balance ?? null,
            lessonCount: clientData.lesson_count ?? null,
            paidCount: clientData.paid_count ?? null,
            nextLessonDate: clientData.next_lesson_date ?? null,
            lastAttendDate: clientData.last_attend_date ?? null,
        }

        return { success: true, data: balanceData }
    } catch (error) {
        console.error('Failed to get client balance:', error)
        return {
            success: false,
            error: 'Ошибка при получении данных из CRM. Попробуйте позже.',
        }
    }
}
