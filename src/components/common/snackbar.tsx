'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, X } from 'lucide-react'
import cn from 'classnames'

interface SnackbarProps {
    message: string
    type: 'success' | 'error'
    isVisible: boolean
    onClose: () => void
    duration?: number
}

export function Snackbar({ message, type, isVisible, onClose, duration = 4000 }: SnackbarProps) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!isVisible) return
        timerRef.current = setTimeout(onClose, duration)
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [isVisible, duration, onClose])

    if (!isVisible) return null

    const isSuccess = type === 'success'

    const content = (
        <div
            className="fixed left-1/2 top-4 z-[9999] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2"
            role="alert"
            aria-live="polite"
        >
            <div className={cn(
                'rounded-sm border p-4 shadow-lg',
                isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
            )}>
                <div className="flex items-start gap-3">
                    {isSuccess
                        ? <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                        : <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                    }
                    <p className={cn('flex-1 text-sm font-medium', isSuccess ? 'text-green-800' : 'text-red-800')}>
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600"
                        aria-label="Закрыть уведомление"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
                    <div
                        className={cn('h-full rounded-full', isSuccess ? 'bg-green-500' : 'bg-red-500')}
                        style={{ animation: `shrink ${duration}ms linear forwards` }}
                    />
                </div>
            </div>
        </div>
    )

    if (typeof document === 'undefined') return null
    return createPortal(content, document.body)
}
