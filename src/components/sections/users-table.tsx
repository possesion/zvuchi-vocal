'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import { UserRole, UserRow } from '@/lib/types'

interface UsersTableProps {
    users: UserRow[]
    currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleRoleChange = async (userId: number, role: UserRole) => {
        setLoadingId(userId)
        try {
            const res = await fetch(`/api/v1/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            })
            if (!res.ok) throw new Error('Ошибка при смене роли')
            router.refresh()
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingId(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/v1/users/${deleteTarget.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Ошибка при удалении')
            setDeleteTarget(null)
            router.refresh()
        } catch (err) {
            console.error(err)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg bg-zinc-900 shadow-xl">
                <table className="w-full text-sm text-white">
                    <thead>
                        <tr className="border-b border-white/10 text-white/50">
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Роль</th>
                            <th className="px-4 py-3 text-left">Статус</th>
                            <th className="px-4 py-3 text-left">Дата регистрации</th>
                            <th className="px-4 py-3 text-left"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const isSelf = String(user.id) === currentUserId
                            const isLoading = loadingId === user.id

                            return (
                                <tr
                                    key={user.id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                        {isSelf ? (
                                            <span className={`rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                                                {ROLE_LABELS[user.role]}
                                            </span>
                                        ) : (
                                            <select
                                                value={user.role}
                                                disabled={isLoading}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-white ring-1 ring-white/10 focus:outline-none focus:ring-purple-500 disabled:opacity-50"
                                            >
                                                <option value="client">Клиент</option>
                                                <option value="manager">Менеджер</option>
                                                <option value="admin">Администратор</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.email_verified === 1 ? (
                                            <span className="text-green-400">✓ Подтверждён</span>
                                        ) : (
                                            <span className="text-yellow-400">⏳ Ожидает</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-white/50">
                                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setDeleteTarget(user)}
                                            disabled={isSelf}
                                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                                            title={isSelf ? 'Нельзя удалить собственный аккаунт' : 'Удалить'}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <p className="px-4 py-8 text-center text-white/40">Пользователей нет</p>
                )}
            </div>

            {/* Диалог подтверждения удаления */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="mx-4 w-full max-w-sm rounded-lg bg-zinc-900 p-6 text-white shadow-xl">
                        <p className="mb-2 text-lg font-semibold">Удалить пользователя?</p>
                        <p className="mb-1 text-sm text-white/60">
                            <span className="font-medium text-white">{deleteTarget.email}</span>
                        </p>
                        <p className="mb-6 text-sm text-white/60">Это действие нельзя отменить.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="rounded-sm px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {deleting ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
