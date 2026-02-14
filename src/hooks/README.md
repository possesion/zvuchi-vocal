# Yandex.Metrica Hook

## Использование

### Базовое использование

```typescript
import { trackEvent, trackFormSubmit, trackPhoneClick } from '@/hooks/use-yandex-metrica'

// Отслеживание произвольного события
trackEvent('button_click', { button_name: 'subscribe' })

// Отслеживание отправки формы
trackFormSubmit('enrollment_form')

// Отслеживание клика по телефону
trackPhoneClick()
```

### В компонентах

```typescript
'use client'

import { trackEvent } from '@/hooks/use-yandex-metrica'

export function MyComponent() {
  const handleClick = () => {
    trackEvent('custom_event', {
      category: 'user_action',
      label: 'button_clicked'
    })
  }

  return <button onClick={handleClick}>Click me</button>
}
```

### Доступные функции

#### `trackEvent(eventName: string, params?: YandexMetricaGoalParams)`
Отслеживание произвольного события.

```typescript
trackEvent('purchase', {
  product_id: '123',
  price: 1000,
  currency: 'RUB'
})
```

#### `trackPageView(url: string, options?: { title?: string; referer?: string })`
Отслеживание просмотра страницы.

```typescript
trackPageView('/about', {
  title: 'О нас',
  referer: document.referrer
})
```

#### `trackFormSubmit(formName: string)`
Отслеживание отправки формы.

```typescript
trackFormSubmit('contact_form')
```

#### `trackPhoneClick()`
Отслеживание клика по номеру телефона.

```typescript
trackPhoneClick()
```

#### `trackSocialClick(social: string)`
Отслеживание клика по социальной сети.

```typescript
trackSocialClick('telegram')
trackSocialClick('vk')
trackSocialClick('instagram')
```

#### `trackButtonClick(buttonName: string)`
Отслеживание клика по кнопке.

```typescript
trackButtonClick('subscribe_button')
```

#### `trackExternalLink(url: string, linkName?: string)`
Отслеживание клика по внешней ссылке.

```typescript
trackExternalLink('https://example.com', 'partner_link')
```

## Типизация

Все функции полностью типизированы с использованием TypeScript.

### Типы параметров

```typescript
interface YandexMetricaGoalParams {
  [key: string]: unknown;
}
```

### Пример с типами

```typescript
import type { YandexMetricaGoalParams } from '@/types/yandex-metrica'

const params: YandexMetricaGoalParams = {
  product_name: 'Абонемент на 4 занятия',
  price: 12800,
  currency: 'RUB'
}

trackEvent('add_to_cart', params)
```

## Режим разработки

В режиме разработки (`NODE_ENV === 'development'`) Yandex.Metrica отключается автоматически, чтобы не засорять статистику тестовыми данными.

В консоли будет выведено сообщение:
```
Yandex.Metrica disabled in development mode
```

## Production

В production режиме Yandex.Metrica инициализируется автоматически при загрузке страницы.

Все события отправляются в счетчик с ID: `105392489`
