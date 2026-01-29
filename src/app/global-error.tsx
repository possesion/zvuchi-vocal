'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Global error:', error)
  
  return (
    <html lang="ru">
      <body className="font-exo2">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
          <div className="text-center text-white p-8">
            <h1 className="text-6xl font-bold mb-4">Ошибка</h1>
            <h2 className="text-2xl mb-6">Что-то пошло не так</h2>
            <p className="text-gray-300 mb-8">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу.
            </p>
            <button
              onClick={reset}
              className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-sm transition-colors duration-200 mr-4"
            >
              Попробовать снова
            </button>
            <Link
              href="/"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-sm transition-colors duration-200"
            >
              На главную
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}