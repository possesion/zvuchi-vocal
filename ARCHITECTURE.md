# Архитектура приложения "ЗВУЧИ"

## Обзор

Этот документ описывает архитектуру и структуру проекта вокальной студии "ЗВУЧИ", построенного на Next.js 15 с использованием App Router.

## Структура проекта

```
vocal-school/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── v1/            # Версионированные API
│   │   │   │   ├── gallery/   # Галерея изображений
│   │   │   │   ├── instructors/ # Преподаватели
│   │   │   │   ├── programs/  # Программы обучения
│   │   │   │   ├── payments/  # Платежи
│   │   │   │   └── contact/   # Контактные формы
│   │   │   ├── health/        # Health check
│   │   │   └── ...            # Legacy API routes
│   │   ├── actions/           # Server Actions
│   │   ├── constants.tsx      # Константы приложения
│   │   ├── globals.css        # Глобальные стили
│   │   ├── layout.tsx         # Корневой layout
│   │   └── page.tsx           # Главная страница
│   ├── components/            # React компоненты
│   │   ├── layout/            # Компоненты макета
│   │   │   ├── header.tsx
│   │   │   └── nav-menu.tsx
│   │   ├── sections/          # Секции страниц
│   │   │   ├── feature-list.tsx
│   │   │   ├── programs.tsx
│   │   │   ├── vocal-instructor.tsx
│   │   │   ├── gallery.tsx
│   │   │   ├── contacts.tsx
│   │   │   └── enrollment-section.tsx
│   │   ├── forms/             # Формы
│   │   │   ├── payment-form.tsx
│   │   │   └── phone-input.tsx
│   │   ├── modals/            # Модальные окна
│   │   │   ├── enrollment-modal.tsx
│   │   │   ├── platform-dialog.tsx
│   │   │   └── sheet-enhanced.tsx
│   │   ├── common/            # Общие компоненты
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── snackbar.tsx
│   │   │   └── offera.tsx
│   │   ├── mobile-menu.tsx    # Мобильное меню
│   │   ├── index.ts           # Экспорт компонентов
│   │   └── constants.ts       # Константы компонентов
│   ├── lib/                   # Утилиты и хелперы
│   │   ├── utils.ts           # Общие утилиты
│   │   ├── image-utils.ts     # Утилиты для изображений
│   │   └── config.ts          # Конфигурация
│   ├── hooks/                 # Кастомные хуки
│   │   ├── useGallery.ts      # Работа с галереей
│   │   ├── usePayments.ts     # Работа с платежами
│   │   ├── useContact.ts      # Отправка форм
│   │   ├── useLocalStorage.ts # Локальное хранилище
│   │   └── useDebounce.ts     # Дебаунс
│   ├── contexts/              # React контексты
│   │   ├── AppContext.tsx     # Глобальное состояние
│   │   ├── GalleryContext.tsx # Состояние галереи
│   │   └── PaymentContext.tsx # Состояние платежей
│   └── types/                 # TypeScript типы
│       ├── index.ts           # Основные типы
│       ├── gallery.ts         # Типы галереи
│       ├── instructor.ts      # Типы преподавателей
│       ├── program.ts         # Типы программ
│       ├── payment.ts         # Типы платежей
│       └── api.ts             # Типы API
├── public/                    # Статические файлы
│   ├── gallery/               # Изображения галереи
│   ├── maria/                 # Фото преподавателей
│   ├── valeria/
│   ├── socials/               # Иконки соцсетей
│   └── ...
├── .env.example               # Пример переменных окружения
├── next.config.ts             # Конфигурация Next.js
├── tailwind.config.ts         # Конфигурация Tailwind
├── tsconfig.json              # Конфигурация TypeScript
└── package.json               # Зависимости проекта
```

## Компонентная архитектура

### Layout компоненты
- **Header**: Основной заголовок сайта
- **NavMenu**: Навигационное меню

### Section компоненты
- **FeatureList**: Список преимуществ
- **Programs**: Программы обучения
- **VocalInstructor**: Карточка преподавателя
- **Gallery**: Галерея изображений
- **Contacts**: Контактная информация
- **EnrollmentSection**: Секция записи

### Form компоненты
- **PaymentForm**: Форма оплаты
- **PhoneInput**: Поле ввода телефона

### Modal компоненты
- **EnrollmentModal**: Модальное окно записи
- **PlatformDialog**: Универсальное модальное окно
- **SheetEnhanced**: Боковая панель

### Common компоненты
- **Button**: Кнопка
- **Input**: Поле ввода
- **LoadingSpinner**: Индикатор загрузки
- **Snackbar**: Уведомления
- **Offerta**: Документ оферты

## API архитектура

### Версионирование
API использует версионирование через префикс `/api/v1/` для обеспечения обратной совместимости.

### Эндпоинты

#### v1 API
- `GET /api/v1/gallery` - Получить изображения галереи
- `GET /api/v1/instructors` - Получить список преподавателей
- `GET /api/v1/programs` - Получить программы обучения
- `POST /api/v1/contact` - Отправить контактную форму
- `POST /api/v1/payments` - Создать платеж

#### Legacy API
- `GET /api/gallery` - Старый эндпоинт галереи
- `POST /api/send-mail` - Отправка email
- `POST /api/payments` - Платежи (Tochka Bank)

#### Utility API
- `GET /api/health` - Health check

## Управление состоянием

### React Context
- **AppContext**: Глобальное состояние приложения (тема, язык, уведомления)
- **GalleryContext**: Состояние галереи изображений
- **PaymentContext**: Состояние платежей

### Кастомные хуки
- **useGallery**: Работа с галереей
- **usePayments**: Работа с платежами
- **useContact**: Отправка форм
- **useLocalStorage**: Локальное хранилище
- **useDebounce**: Дебаунс для поиска

## Типизация

### Основные типы
- **Instructor**: Преподаватель
- **Program**: Программа обучения
- **GalleryImage**: Изображение галереи
- **PaymentData**: Данные платежа
- **ContactFormData**: Данные контактной формы

### API типы
- **ApiResponse**: Стандартный ответ API
- **PaginatedResponse**: Пагинированный ответ
- **ApiError**: Ошибка API

## Конфигурация

### Переменные окружения
```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api/v1

# Payment Configuration (Tochka Bank)
TOCHKA_CLIENT_ID=your_client_id
TOCHKA_CLIENT_SECRET=your_client_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Organization Information
OGRNIP=325774600433742
INN=770600435102
ORGANIZATION_EMAIL=info@zvuchi-vocal.ru
```

### Next.js конфигурация
- Оптимизация изображений (WebP, AVIF)
- Безопасность (заголовки, CSP)
- Производительность (сжатие, кэширование)
- Webpack оптимизации

## Хранение файлов

### Статические файлы
```
public/
├── gallery/               # Галерея (17 изображений)
├── instructors/           # Фото преподавателей
│   ├── maria/
│   └── valeria/
├── socials/               # Иконки соцсетей
├── assets/                # Общие ресурсы
└── documents/             # Документы
```

### Конфигурация изображений
- Поддерживаемые форматы: JPG, PNG, WebP, SVG
- Максимальный размер: 2MB для галереи, 1MB для преподавателей
- Автоматическая оптимизация через Next.js Image

## Безопасность

### Заголовки безопасности
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

### Валидация
- Валидация форм на клиенте и сервере
- Санитизация пользовательского ввода
- Защита от XSS и CSRF

## Производительность

### Оптимизации
- Lazy loading компонентов
- Оптимизация изображений
- Кэширование API ответов
- Минификация и сжатие
- Tree shaking

### Мониторинг
- Health check эндпоинт
- Логирование ошибок
- Метрики производительности

## Планы развития

### Краткосрочные (1-3 месяца)
1. Интеграция с CMS для управления контентом
2. Система бронирования занятий
3. Уведомления по email/SMS
4. Аналитика и метрики

### Долгосрочные (3-6 месяцев)
1. Админ-панель для управления
2. Интеграция с календарем
3. Система отзывов и рейтингов
4. Мобильное приложение

## Разработка

### Команды
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен сервера
npm run lint         # Проверка кода
npm run type-check   # Проверка типов
```

### Git workflow
- Основная ветка: `main`
- Ветки для фич: `feature/feature-name`
- Ветки для багфиксов: `fix/bug-name`
- Pull requests для code review

## Документация

### Дополнительные документы
- [API Documentation](./API.md)
- [Component Library](./COMPONENTS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)
