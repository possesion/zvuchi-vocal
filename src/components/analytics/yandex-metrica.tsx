'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useYandexMetrica, trackPageView } from '@/hooks/use-yandex-metrica'

function YandexMetricaInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Инициализируем Yandex.Metrica
  useYandexMetrica()

  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    trackPageView(url)
  }, [pathname, searchParams])

  return null
}

export function YandexMetrica() {
  return (
    <Suspense fallback={null}>
      <YandexMetricaInner />
    </Suspense>
  )
}

// Экспортируем функции отслеживания из хука
export { trackEvent, trackFormSubmit, trackPhoneClick, trackSocialClick } from '@/hooks/use-yandex-metrica'