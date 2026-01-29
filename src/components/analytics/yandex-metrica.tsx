'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

declare global {
  interface Window {
    ym: (id: number, method: string, ...args: unknown[]) => void
  }
}

function YandexMetricaInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(105392489, 'hit', url)
    }
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

// Функции для отслеживания событий
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(105392489, 'reachGoal', eventName, params)
  }
}

export const trackFormSubmit = (formName: string) => {
  trackEvent('form_submit', { form_name: formName })
}

export const trackPhoneClick = () => {
  trackEvent('phone_click')
}

export const trackSocialClick = (social: string) => {
  trackEvent('social_network_click', { social_network: social })
}