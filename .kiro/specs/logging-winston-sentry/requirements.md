# Requirements — Логирование: Winston (сервер) + Sentry (клиент)

## Введение

Логирование в проекте выполняется разрозненными вызовами `console.*` без единого
формата, уровней и таймстампов. Цель фичи — разделить наблюдаемость по среде
выполнения:

- **Серверный код** (API routes, Server Actions, серверные `lib`, `auth`) переводится
  на структурированный логгер **Winston** с выводом JSON в stdout, готовым к
  агрегации через Promtail → Loki → Grafana.
- **Клиентский код** (компоненты и хуки с `'use client'`, `global-error`) переводится
  на **Sentry** для сбора ошибок фронтенда — вызовы `@sentry/nextjs` напрямую, без
  промежуточного фасада над `console`.

Дополнительно: завершается незаконченная конфигурация Sentry (обёртка
`withSentryConfig`, DSN через env, разумные sample rate), CI настраивается на выгрузку
source maps при сборке Docker-образа, и добавляется MCP-конфигурация Sentry для Kiro.

### Контекст проекта

- Next.js 16 (App Router, Turbopack, `output: 'standalone'`), TypeScript strict, Vitest.
- Соглашения: kebab-case файлы, PascalCase компоненты, camelCase функции,
  singleton-паттерн (как `src/lib/db-prisma.ts`), `import type`, без `any`,
  `ActionResult<T>` в Server Actions без выброса исключений.
- `@sentry/nextjs ^10.74.0` установлен; визард создал `src/instrumentation-client.ts`,
  `src/instrumentation.ts` (`onRequestError`), `sentry.server.config.ts`,
  `sentry.edge.config.ts`. DSN захардкожен, `tracesSampleRate: 1`.
  `next.config.ts` **не** обёрнут в `withSentryConfig` — ключевой пробел.
- `SENTRY_AUTH_TOKEN` лежит в `.env.sentry-build-plugin` (не коммитить).
- CI (`.github/workflows/deploy.yml`) собирает Docker-образ → GHCR → деплой на VPS по
  SSH; токен Sentry в сборку не пробрасывается.
- `.kiro/settings/mcp.json` отсутствует. `src/middleware.ts` отсутствует.

---

## Требования

### Требование 1 — Серверный логгер Winston

**User Story:** Как разработчик, я хочу единый серверный логгер с уровнями и
структурированным выводом, чтобы централизованно собирать и анализировать логи.

#### Acceptance Criteria

1. WHEN серверный код импортирует логгер THEN система SHALL предоставить единственный
   экземпляр логгера (singleton), переиспользуемый между вызовами.
2. WHEN логгер инициализируется в production (`NODE_ENV === 'production'`) THEN система
   SHALL выводить каждую запись в stdout в формате JSON с полями `timestamp`, `level`,
   `message`.
3. WHEN логгер инициализируется в development THEN система SHALL выводить записи в
   читаемом цветном формате с таймстампом.
4. THE логгер SHALL поддерживать уровни `debug`, `info`, `warn`, `error`.
5. WHEN задана переменная окружения `LOG_LEVEL` THEN система SHALL использовать её как
   активный уровень; ELSE система SHALL использовать `info` в production и `debug` в
   остальных окружениях.
6. THE каждая запись лога SHALL содержать поля `service` со значением `vocal-school` и
   `env` со значением текущего `NODE_ENV`.
7. THE логгер SHALL использовать только Console-транспорт (вывод в stdout); файловые
   транспорты не добавляются.

### Требование 2 — Модульный (child) логгер

**User Story:** Как разработчик, я хочу помечать логи именем модуля, чтобы заменить
строковые префиксы (`[Alfa CRM]`, `[Contest]`) машиночитаемым полем.

#### Acceptance Criteria

1. WHEN вызывается `createModuleLogger(module)` THEN система SHALL вернуть child-логгер,
   добавляющий поле `module` с переданным значением в каждую запись.
2. THE child-логгер SHALL наследовать активный уровень и формат от родительского логгера.
3. WHEN серверный модуль ранее использовал строковый префикс THEN система SHALL заменить
   префикс полем `module` без потери исходного смысла сообщения.

### Требование 3 — Миграция серверных lib

**User Story:** Как разработчик, я хочу перевести серверные утилиты на Winston, чтобы
устранить неструктурированные `console.*`.

#### Acceptance Criteria

1. THE файлы `src/lib/api-response.ts`, `alfa-crm.ts`, `mobileid.ts`, `google-people.ts`,
   `oauth-sync.ts`, `submit-mail-form.tsx` SHALL использовать logger/module-логгер вместо
   `console.*`.
2. WHEN логируется ошибка THEN система SHALL вызывать `logger.error(message, { err })`,
   передавая объект ошибки в метаданных.
3. WHEN миграция завершена THEN grep по этим файлам SHALL не находить вызовов `console.*`.
4. THE существующие тесты `google-people.test.ts` и `oauth-sync.test.ts` SHALL проходить
   после миграции.

### Требование 4 — Миграция Server Actions

**User Story:** Как разработчик, я хочу перевести Server Actions на Winston, сохранив их
контракт.

#### Acceptance Criteria

1. THE файлы `src/app/actions/crm.ts`, `profile.ts`, `sendEmail.ts`, `auth.ts`,
   `programs.ts`, `instructors.ts` SHALL использовать logger вместо `console.*`.
2. THE Server Actions SHALL сохранять контракт `ActionResult<T>` и NOT выбрасывать
   исключения при ошибках.
3. WHEN в Server Action возникает ошибка THEN система SHALL залогировать её через
   `logger.error` и вернуть `{ success: false, error }`.

### Требование 5 — Миграция API routes

**User Story:** Как разработчик, я хочу перевести API-роуты на Winston без изменения их
внешнего поведения.

#### Acceptance Criteria

1. THE все роуты в `src/app/api/**` SHALL использовать logger вместо `console.*`.
2. WHEN логируется бизнес-операция (создание/обновление/удаление) THEN система SHALL
   использовать уровень `info` с полями (например `id`, `userId`) вместо интерполяции
   строк.
3. WHEN логируется ошибка THEN система SHALL использовать `logger.error(message, { err })`.
4. THE HTTP-статусы и тела ответов роутов SHALL остаться без изменений после миграции.
5. THE строковый префикс `[Contest]` SHALL быть заменён полем `module: 'contest'`.

### Требование 6 — Интеграция логгера next-auth

**User Story:** Как разработчик, я хочу, чтобы события next-auth шли через Winston.

#### Acceptance Criteria

1. WHEN next-auth генерирует событие `error` или `warn` THEN система SHALL направить его в
   Winston с полем `module: 'auth'`.
2. WHEN код ошибки равен `CredentialsSignin` THEN система SHALL подавить логирование
   (сохранить текущее поведение).
3. THE прочие события `error`/`warn` next-auth SHALL логироваться через Winston.

### Требование 7 — Завершение конфигурации Sentry

**User Story:** Как разработчик, я хочу корректно подключить Sentry-плагин и вынести
секреты в окружение.

#### Acceptance Criteria

1. THE `next.config.ts` SHALL быть обёрнут в `withSentryConfig` с указанием org/project и
   опциями `widenClientFileUpload` и подавления служебного вывода (`silent`/`disableLogger`).
2. THE обёртка Sentry SHALL быть совместима с Turbopack и `output: 'standalone'`, и сборка
   (`next build`) SHALL проходить успешно.
3. THE DSN SHALL считываться из `NEXT_PUBLIC_SENTRY_DSN` с fallback на текущее значение в
   `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.
4. THE `tracesSampleRate` SHALL равняться `1.0` в development и `0.1` в production.
5. THE `.env.sentry-build-plugin` SHALL быть указан в `.gitignore`, а `SENTRY_AUTH_TOKEN`
   NOT SHALL быть закоммичен в репозиторий.

### Требование 8 — Переход клиентского кода на Sentry

**User Story:** Как разработчик, я хочу, чтобы клиентские ошибки уходили в Sentry
напрямую, без промежуточного фасада над `console`.

#### Acceptance Criteria

1. THE клиентский код SHALL использовать `@sentry/nextjs` напрямую; отдельный
   фасад-логгер (`src/lib/client-logger.ts`) NOT SHALL создаваться.
2. WHEN клиентский компонент или хук перехватывает ошибку THEN система SHALL вызывать
   `Sentry.captureException(error, { extra })` вместо `console.error`.
3. WHEN требуется зафиксировать информационное/предупреждающее событие без объекта
   ошибки THEN система SHALL использовать `Sentry.captureMessage` или
   `Sentry.addBreadcrumb`.
4. WHEN в `src/app/global-error.tsx` перехватывается ошибка THEN система SHALL вызвать
   `Sentry.captureException(error)` и сохранить существующий UI.
5. THE клиентские компоненты и хуки с `console.error` (quiz-context, contestant-admin-form,
   payment-form, gallery, useMobileID, usePayments, text-preview, instructor-edit-form,
   users-table, news-article и др.) SHALL быть переведены на прямые вызовы Sentry.

### Требование 9 — CI: выгрузка source maps

**User Story:** Как разработчик, я хочу, чтобы CI выгружал source maps в Sentry без
раскрытия секретов.

#### Acceptance Criteria

1. THE `Dockerfile` SHALL объявлять `ARG SENTRY_AUTH_TOKEN` и пробрасывать его в окружение
   перед шагом `next build`.
2. THE `.github/workflows/deploy.yml` SHALL передавать `SENTRY_AUTH_TOKEN` из GitHub
   Secrets в `docker/build-push-action` (через `secrets`/`build-args`).
3. THE `SENTRY_AUTH_TOKEN` SHALL присутствовать только как секрет CI и NOT SHALL быть
   зафиксирован в коде или логах.
4. THE существующий флоу деплоя (GHCR → VPS по SSH) SHALL остаться работоспособным.
5. WHERE применимо THE CI MAY включать предварительный job `verify` (lint/type-check/test)
   до сборки.

### Требование 10 — MCP-конфигурация Sentry для Kiro

**User Story:** Как разработчик, я хочу обращаться к Sentry из Kiro через MCP.

#### Acceptance Criteria

1. THE система SHALL создать `.kiro/settings/mcp.json` с записью Sentry MCP-сервера.
2. THE конфигурация SHALL быть валидным JSON и соответствовать актуальному синтаксису
   MCP Sentry (hosted `https://mcp.sentry.dev/mcp` через remote либо stdio-вариант).
3. THE секреты в конфигурации SHALL передаваться через переменные окружения, NOT
   хардкодиться.

### Требование 11 — Защита от регрессий

**User Story:** Как разработчик, я хочу, чтобы линтер предотвращал возврат сырых
`console.*` в серверный код.

#### Acceptance Criteria

1. THE ESLint SHALL применять правило `no-console` к серверным директориям, исключая
   `src/lib/logger.ts`.
2. WHEN запускаются `lint`, `type-check`, `test`, `build` THEN все проверки SHALL
   завершаться успешно.
3. WHEN выполняется финальный grep по серверному коду THEN `console.*` SHALL
   отсутствовать (вне разрешённых файлов логгеров).
