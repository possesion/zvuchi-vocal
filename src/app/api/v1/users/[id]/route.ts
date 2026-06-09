import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUser, deleteUser } from '@/lib/db-prisma'
import { apiOk, apiError } from '@/lib/api-response'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/roles'
import { UserRole } from '@/lib/types'
import type { ApiResponse } from '@/types/api'

const VALID_ROLES: UserRole[] = ['admin', 'manager', 'client']

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const session = await auth()
    if (!session || !isAdmin(session.user.role)) {
        return apiError('Forbidden', 403)
    }

    const { id } = await props.params
    const userId = Number(id)
    const existing = await getUserById(userId)
    if (!existing) return apiError('Not found', 404)

    // Нельзя менять роль самому себе
    if (String(userId) === session.user.id) {
        return apiError('Cannot change own role', 400)
    }

    const body = await req.json()
    const role = body.role as UserRole

    if (!VALID_ROLES.includes(role)) {
        return apiError('Invalid role', 400)
    }

    await updateUser(userId, { role })
    return apiOk({ success: true })
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const session = await auth()
    if (!session || !isAdmin(session.user.role)) {
        return apiError('Forbidden', 403)
    }

    const { id } = await props.params
    const userId = Number(id)

    if (String(userId) === session.user.id) {
        return apiError('Cannot delete own account', 400)
    }

    const existing = await getUserById(userId)
    if (!existing) return apiError('Not found', 404)

    await deleteUser(userId)
    return apiOk({ success: true })
}
