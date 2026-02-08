'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    ym: (id: number, method: string, ...args: unknown[]) => void
    ymInitialized?: boolean
    ymQueue?: Array<() => void>
  }
}

const METRICA_ID = 105392489

export const useYandexMetrica = () => {
  useEffect(() => {
    // Инициализируем только в production или если явно не отключено
    if (process.env.NODE_ENV === 'development') {
      console.log('Yandex.Metrica disabled in development mode')
      return
    }

    if (typeof window === 'undefined') return

    // Проверяем, не инициализирована ли уже Metrica
    if (window.ymInitialized) return

    // Создаем очередь для команд до инициализации
    window.ymQueue = window.ymQueue || []

    // Загружаем скрипт Yandex.Metrica
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://mc.yandex.ru/metrika/tag.js'
    
    script.onload = () => {
      if (window.ym && !window.ymInitialized) {
        window.ym(METRICA_ID, 'init', {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
          trackHash: true,
          ecommerce: 'dataLayer'
        })
        
        window.ymInitialized = true
        
        // Выполняем отложенные команды
        window.ymQueue?.forEach(fn => fn())
        window.ymQueue = []
      }
    }

    document.head.appendChild(script)

    // Функция ym для использования до загрузки скрипта
    window.ym = window.ym || function(...args) {
      window.ymQueue?.push(() => {
        if (window.ym) {
          window.ym(...args)
        }
      })
    }

    return () => {
      // Cleanup при размонтировании (только в dev режиме)
      if (process.env.NODE_ENV === 'development') {
        window.ymInitialized = false
      }
    }
  }, [])
}

// Функции для отслеживания событий
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRICA_ID, 'reachGoal', eventName, params)
  }
}

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRICA_ID, 'hit', url)
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