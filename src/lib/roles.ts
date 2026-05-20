import { UserRole } from "./types"

/** Может редактировать контент сайта (admin или manager) */
export function canEdit(role: UserRole | undefined | null): boolean {
    return role === 'admin' || role === 'manager'
}

/** Только admin */
export function isAdmin(role: UserRole | undefined | null): boolean {
    return role === 'admin'
}

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Администратор',
    manager: 'Менеджер',
    client: 'Клиент',
}

export const ROLE_COLORS: Record<UserRole, string> = {
    admin: 'bg-purple-600/30 text-purple-300',
    manager: 'bg-blue-600/30 text-blue-300',
    client: 'bg-zinc-700 text-zinc-300',
}
