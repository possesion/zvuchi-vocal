'use client'

import { useEffect } from 'react'
import type { YandexMetricaInitOptions, YandexMetricaGoalParams } from '@/types/yandex-metrica'

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
        const options: YandexMetricaInitOptions = {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
          trackHash: true,
          ecommerce: 'dataLayer'
        }
        
        window.ym(METRICA_ID, 'init', options)
        window.ymInitialized = true
        
        // Выполняем отложенные команды
        window.ymQueue?.forEach(fn => fn())
        window.ymQueue = []
      }
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup при размонтировании (только в dev режиме)
      if (process.env.NODE_ENV === 'development') {
        window.ymInitialized = false
      }
    }
  }, [])
}

// Функции для отслеживания событий
export const trackEvent = (eventName: string, params?: YandexMetricaGoalParams) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRICA_ID, 'reachGoal', eventName, params)
  }
}

export const trackPageView = (url: string, options?: { title?: string; referer?: string }) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRICA_ID, 'hit', url, options)
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

export const trackButtonClick = (buttonName: string) => {
  trackEvent('button_click', { button_name: buttonName })
}

export const trackExternalLink = (url: string, linkName?: string) => {
  trackEvent('external_link', { url, link_name: linkName })
}