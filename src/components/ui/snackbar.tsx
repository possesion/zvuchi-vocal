'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface SnackbarProps {
    message: string
    type: 'success' | 'error'
    isVisible: boolean
    onClose: () => void
    duration?: number
}

export function Snackbar({
    message,
    type,
    isVisible,
    onClose,
    duration = 4000,
}: SnackbarProps) {
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true)

            // Автоматически скрываем через указанное время
            const timer = setTimeout(() => {
                setIsAnimating(false)
                setTimeout(onClose, 300) // Ждем окончания анимации
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [isVisible, duration, onClose])

    if (!isVisible) return null

    const icon =
        type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
            <XCircle className="h-5 w-5 text-red-500" />
        )

    const bgColor =
        type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'

    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800'

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
            <div
                className={`
          ${bgColor} border rounded-lg shadow-lg p-4 
          transform transition-all duration-300 ease-in-out
          ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
            >
                <div className="flex items-start space-x-3">
                    {icon}
                    <div className="flex-1">
                        <p className={`text-sm font-medium ${textColor}`}>
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAnimating(false)
                            setTimeout(onClose, 300)
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Прогресс-бар */}
                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ease-linear ${
                            type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{
                            width: isAnimating ? '100%' : '0%',
                            transition: `width ${duration}ms linear`,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
