'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function UserAvatar() {
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Закрываем меню при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!session?.user) return null

    const initials = session.user.email?.[0]?.toUpperCase() ?? '?'

    return (
        <div ref={ref} className="relative hidden lg:flex items-center">
            <button
                onClick={() => setOpen((value) => !value)}
                aria-label="Меню пользователя"
                aria-expanded={open}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-white/20 transition-opacity hover:opacity-80"
            >
                {initials}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-sm bg-zinc-900 py-1 shadow-xl ring-1 ring-white/10">
                    <div className="border-b border-white/10 px-3 py-2">
                        <p className="truncate text-xs text-white/50">{session.user.email}</p>
                    </div>
                    <Link
                        href="/logout"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <LogOut className="h-4 w-4" />
                        Выйти
                    </Link>
                </div>
            )}
        </div>
    )
}
