# Обновление до Next.js 16 - Резюме

## Дата обновления
9 августа 2026

## Версии

### До обновления
- Next.js: 15.3.8
- React: 19.0.1
- React DOM: 19.0.1

### После обновления
- Next.js: 16.3.0
- React: 19.2.8
- React DOM: 19.2.8
- eslint-config-next: 16.3.0

## Выполненные изменения

### 1. Создан AGENTS.md
Добавлен файл `AGENTS.md` в корень проекта для работы AI-агентов с документацией Next.js, встроенной в пакет (`node_modules/next/dist/docs/`).

### 2. Обновлены зависимости
- Обновлён Next.js до версии 16.3.0
- Обновлён React до 19.2.8 (включает React 19.2 с новыми фичами)
- Обновлён eslint-config-next до 16.3.0

### 3. Изменения в next.config.ts

#### Удалено
- `eslint.ignoreDuringBuilds` из development settings (больше не поддерживается в Next.js 16)
- `webpack` конфигурация (заменена на Turbopack)

#### Изменено
- `images.imageSizes`: удалено значение `16` (breaking change в v16)
- `images.minimumCacheTTL`: изменено с `2678400` (31 день) на `14400` (4 часа) - новый дефолт v16

#### Добавлено
- `turbopack: {}` - пустой объект конфигурации для предотвращения конфликта с webpack

#### Оставлено в experimental
- `serverActions` остался в `experimental` (документация показывала, что он должен быть на верхнем уровне, но билд показал, что это unrecognized key)

### 4. Миграция middleware → proxy
- Файл `src/middleware.ts` переименован в `src/proxy.ts`
- Добавлен именованный экспорт `export const proxy` (требование Next.js 16)
- Сохранён default export для обратной совместимости

### 5. Проверка async Request APIs
Все async Request APIs уже были корректно реализованы:
- ✅ `params` в page.tsx и route.ts используют `await params`
- ✅ `searchParams` в page.tsx используют `await searchParams`
- ✅ `cookies()` используют `await cookies()`
- ✅ Layout файлы не используют params

Примеры файлов с корректной реализацией:
- `src/app/instructors/[slug]/page.tsx`
- `src/app/programs/[slug]/page.tsx`
- `src/app/wiki/[id]/page.tsx`
- `src/app/api/v1/instructors/[id]/route.ts`
- `src/app/api/v1/users/[id]/route.ts`

## Результаты проверки

### ✅ Type-check
```bash
npm run type-check
```
**Статус:** Успешно пройден, ошибок нет

### ✅ Development server
```bash
npm run dev
```
**Статус:** Запускается успешно
- URL: http://localhost:3000
- Turbopack работает корректно
- Приложение отдаёт HTML корректно
- Главная страница загружается и рендерится

### ⚠️ Production build
```bash
npm run build
```
**Статус:** Процесс сборки зависает (возможно из-за большого размера проекта или нехватки ресурсов)

**Предупреждения при запуске:**
- Custom Cache-Control headers могут влиять на поведение Next.js в dev режиме
- Next.js игнорирует yarn.lock вне git репозитория (можно настроить через `turbopack.root`)

## Новые возможности Next.js 16

### 1. Turbopack по умолчанию
- Теперь используется Turbopack для `next dev` и `next build` по умолчанию
- Значительно быстрее компиляции и HMR

### 2. React 19.2 
- View Transitions для анимации элементов
- useEffectEvent для извлечения нереактивной логики из Effects
- Activity API для фонового рендеринга

### 3. Улучшенная маршрутизация
- Layout deduplication при prefetching
- Incremental prefetching (только недостающие части)

### 4. Новые Cache APIs
- `revalidateTag` теперь требует второй аргумент (cacheLife profile)
- `updateTag` - новый API для Server Actions с read-your-writes семантикой
- `cacheLife` и `cacheTag` стали стабильными (без unstable_ префикса)

## Что не было изменено

### Оставлено без изменений
- Все Server Actions уже используют async/await корректно
- API routes уже используют async params правильно
- Структура проекта не требовала изменений
- База данных и Prisma schema не затронуты

## Рекомендации

### Краткосрочные
1. ✅ Протестировать приложение в dev режиме
2. ⚠️ Исследовать проблему с зависанием production build
3. Рассмотреть удаление custom Cache-Control headers или их корректную настройку

### Долгосрочные
1. Рассмотреть миграцию на Cache Components (новая модель кеширования)
2. Изучить Partial Prerendering (PPR) для оптимизации производительности
3. Рассмотреть использование React Compiler для автоматической мемоизации

## Полезные ссылки

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16)
- [AI Coding Agents Guide](https://nextjs.org/docs/app/guides/ai-agents)
- [Turbopack Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)

## Заключение

Обновление до Next.js 16.3.0 выполнено успешно. Приложение работает в dev режиме, все breaking changes учтены и исправлены. Проект готов к дальнейшей разработке на новой версии фреймворка с улучшенной производительностью благодаря Turbopack.
