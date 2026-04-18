# Предложения по рефакторингу

## 1. Дублирование типов

**Проблема.** Интерфейсы `Instructor`, `Program`, `GalleryImage`, `ApiResponse` объявлены одновременно в `src/types/index.ts` и в доменных файлах (`instructor.ts`, `program.ts`, `gallery.ts`, `api.ts`).

**Решение.** Удалить `src/types/index.ts` полностью. Каждый тип живёт ровно в одном доменном файле, импорты обновляются по месту.

---

## 2. Обработка ошибок в API-роутах

**Проблема.** Один и тот же блок try-catch с `console.error` и `NextResponse.json({ error, timestamp })` повторяется в 8+ роутах.

**Решение.** Создать `src/lib/api-response.ts`:

```ts
import { NextResponse } from 'next/server'

export function apiError(message: string, status = 500) {
    console.error(message)
    return NextResponse.json({ error: message }, { status })
}

export function apiOk<T>(data: T) {
    return NextResponse.json(data)
}
```

Использование в роуте:
```ts
// было
} catch (error) {
    console.error('Gallery API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch', timestamp: new Date() }, { status: 500 })
}

// стало
} catch {
    return apiError('Failed to fetch gallery images')
}
```

---

## 3. Дублирование логики форм

**Проблема.** `EnrollmentForm`, `QuizContext` и `EnrollmentModal` содержат одинаковые:
- `handleChange` с форматированием телефона
- `handleValidate` для кастомных сообщений валидации
- стейт `{ name, phone, isAgreed, offeraIsOpen }`

**Решение.** Создать хук `src/hooks/useContactForm.ts`:

```ts
export function useContactForm() {
    const [formData, setFormData] = useState({ name: '', phone: '' })
    const [isAgreed, setIsAgreed] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'phone' ? formatPhoneNumber(value) : value,
        }))
    }

    const handleValidate = (text: string) => (e: InvalidEvent<HTMLInputElement>) => {
        e.target.setCustomValidity(text)
    }

    const reset = () => {
        setFormData({ name: '', phone: '' })
        setIsAgreed(false)
    }

    return { formData, isAgreed, setIsAgreed, isSubmitting, setIsSubmitting, handleChange, handleValidate, reset }
}
```

---

## 4. Упрощение QuizContext

**Проблема.** `QuizContext` содержит 15+ переменных состояния, 10+ функций и 3 `useEffect`. Это нарушает принцип единственной ответственности и делает контекст сложным для тестирования.

**Решение.** Разделить на два слоя:

- `useQuizNavigation` — управляет шагами (`step`, `handleNext`, `handleBack`, `canProceed`)
- `useQuizAnswers` — управляет ответами (`quizAnswers`, `handleQuizAnswer`)
- `QuizContext` остаётся, но делегирует логику этим хукам

Дополнительно: заменить множество `useState` на `useReducer`:

```ts
type QuizState = {
    step: number
    answers: QuizAnswers
    formData: { name: string; phone: string }
    isAgreed: boolean
}

type QuizAction =
    | { type: 'SET_STEP'; payload: number }
    | { type: 'SET_ANSWER'; field: keyof QuizAnswers; value: string }
    | { type: 'SET_FORM'; field: string; value: string }
    | { type: 'SET_AGREED'; payload: boolean }
    | { type: 'RESET' }
```

---

## 5. Лишняя вложенность в Quiz-компонентах

**Проблема.** `QuizButton` → `QuizProvider` → `QuizButtonInner` → `QuizModal` → `QuizProvider` (второй раз). `QuizProvider` оборачивается дважды.

**Решение.** `QuizModal` не должен создавать собственный `QuizProvider` — он должен получать контекст от родителя. Убрать `QuizProvider` из `QuizModal`, оставить только в `QuizButton`.

```tsx
// QuizModal — просто UI, без провайдера
export function QuizModal({ isOpen, onClose, className }: QuizModalProps) {
    if (!isOpen) return null
    return (
        <div className={className}>
            <QuizModalContent ... />
        </div>
    )
}
```

---

## 6. Шаги опросника — data-driven подход

**Проблема.** `QuizModalContent` содержит 4 отдельных условных рендера (`step === 1`, `step === 2`, ...) с одинаковой структурой кнопок-вариантов.

**Решение.** Описать шаги как массив конфигов:

```ts
const QUIZ_STEPS = [
    { field: 'experience', question: 'Занимались ли вы вокалом ранее?', options: EXPERIENCE_OPTIONS },
    { field: 'genre',      question: 'В каком жанре хотите петь?',       options: GENRE_OPTIONS, hasOther: true },
    { field: 'motivation', question: 'Что вас побудило заняться вокалом?', options: MOTIVATION_OPTIONS, hasOther: true },
]
```

Рендер становится одним компонентом `<QuizStep config={QUIZ_STEPS[step - 1]} />`.

---

## 7. Неиспользуемые контексты

**Проблема.** `src/contexts/AppContext.tsx` (тема, язык, уведомления) и `src/contexts/PaymentContext.tsx` нигде не подключены к `layout.tsx` и не используются в компонентах.

**Решение.** Удалить оба файла. Если функциональность понадобится — добавить в `UIProvider` или создать отдельный провайдер по месту использования.

---

## 8. API-роуты, которые дублируют статические данные

**Проблема.** `/api/v1/instructors` и `/api/v1/programs` просто трансформируют данные из `constants.tsx` в JSON. Это лишний слой без реальной пользы — данные не хранятся в БД и не меняются динамически.

**Решение.** Удалить эти роуты. Серверные компоненты импортируют `instructors` и `programs` напрямую из `constants.tsx`. Если в будущем данные переедут в БД — роуты создаются тогда.

---

## 9. Нейминг

| Текущее | Предлагаемое | Причина |
|---|---|---|
| `QuizButtonInner` | `QuizButtonContent` | `Inner` — деталь реализации, не описывает роль |
| `handleOpen` / `handleClose` в QuizContext | `openQuiz` / `closeQuiz` | Глагол без `handle` — короче и яснее |
| `showSnackbar` в UIContext | `notify` | Короче, не привязан к конкретному UI-компоненту |
| `checkApiAuth` | `requireAuth` | Отражает намерение (требует авторизацию, иначе 401) |
| `getTrackedSteps` / `addTrackedStep` | `quiz.analytics.*` | Группировка по домену |

---

## 10. `formatPhoneNumber` — место хранения

**Проблема.** Функция живёт в `src/components/common/utils.ts` — это папка компонентов, а не утилит.

**Решение.** Переместить в `src/lib/format.ts` вместе с другими форматтерами (`formatPrice`, `formatDate` из `src/lib/utils.ts`). `src/lib/utils.ts` после этого можно удалить.

---

## Приоритеты

| Приоритет | Задача |
|---|---|
| 🔴 Высокий | Удалить дублирующие типы из `index.ts` |
| 🔴 Высокий | Вынести логику форм в `useContactForm` |
| 🔴 Высокий | Удалить `AppContext` и `PaymentContext` |
| 🟡 Средний | Утилита `apiError` / `apiOk` для роутов |
| 🟡 Средний | Убрать двойной `QuizProvider` |
| 🟡 Средний | Data-driven шаги опросника |
| 🟢 Низкий | Переименования по таблице выше |
| 🟢 Низкий | Переместить `formatPhoneNumber` в `src/lib/format.ts` |
| 🟢 Низкий | Удалить роуты `/api/v1/instructors` и `/api/v1/programs` |
