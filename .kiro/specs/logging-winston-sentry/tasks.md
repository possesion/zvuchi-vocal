# Tasks — Логирование: Winston (сервер) + Sentry (клиент)

- [ ] 1. Установить Winston и настроить сборку
  - Добавить `winston` (pinned версия) в `dependencies` в `package.json`.
  - В `next.config.ts` добавить `serverExternalPackages: ['winston']`.
  - Задокументировать переменную `LOG_LEVEL` в примере env (`.env` / README-заметка).
  - Проверить `npm run type-check` и `npm run build`.
  - _Requirements: 1.1, 1.7_

- [ ] 2. Реализовать серверный логгер `src/lib/logger.ts` с тестами
  - Реализовать тестируемую фабрику `createLogger(options)` и singleton
    `getLogger()` + `export const logger`.
  - Формат: dev → `combine(colorize, timestamp, printf)`; prod → `combine(timestamp, json)`.
  - `defaultMeta: { service: 'vocal-school', env: NODE_ENV }`; уровни debug/info/warn/error.
  - `level = process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug')`; транспорт Console (stdout).
  - Написать `src/lib/logger.test.ts`: уровень по env; JSON-структура в prod через
    in-memory transport.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 3. Добавить `createModuleLogger(module)`
  - Реализовать child-логгер с полем `module`, наследующий уровень/формат.
  - Дополнить `logger.test.ts` проверкой наличия поля `module` в записях.
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Мигрировать серверные lib на Winston
  - Перевести `src/lib/api-response.ts`, `alfa-crm.ts`, `mobileid.ts`, `google-people.ts`,
    `oauth-sync.ts`, `submit-mail-form.tsx` на logger/module-логгер.
  - Ошибки логировать как `logger.error(message, { err })`; префиксы → поле `module`.
  - Прогнать/дополнить `google-people.test.ts`, `oauth-sync.test.ts`.
  - Grep: нет `console.*` в этих файлах.
  - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Мигрировать Server Actions на Winston
  - Перевести `src/app/actions/crm.ts`, `profile.ts`, `sendEmail.ts`, `auth.ts`,
    `programs.ts`, `instructors.ts` на logger.
  - Сохранить контракт `ActionResult<T>` (без выброса исключений).
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6. Мигрировать API routes на Winston
  - Перевести все роуты `src/app/api/**` (send-verification, mobileid/*, health,
    v1/contest/*, v1/contact и любые другие, найденные grep-ом) на logger.
  - `info` для бизнес-операций с полями (`id`/`userId`); `error` с `{ err }`;
    `[Contest]` → `module: 'contest'`.
  - Убедиться, что HTTP-статусы и тела ответов не изменились.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Интеграция логгера next-auth в `src/auth.ts`
  - Направить события `error`/`warn` next-auth в Winston с `module: 'auth'`.
  - Сохранить подавление `CredentialsSignin`.
  - Тест: `CredentialsSignin` не логируется; прочие события уходят в logger.
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8. Завершить конфигурацию Sentry
  - Обернуть `next.config.ts` в `withSentryConfig` (org/project, `widenClientFileUpload`,
    `silent`/`disableLogger`; совместимость с Turbopack и standalone).
  - Вынести DSN в `NEXT_PUBLIC_SENTRY_DSN` (fallback на текущий) в
    `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.
  - `tracesSampleRate`: dev `1.0`, prod `0.1`.
  - Убедиться, что `.env.sentry-build-plugin` в `.gitignore`.
  - Проверить `npm run build`.
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Перевод клиентского кода на Sentry (напрямую, без фасада)
  - В `src/app/global-error.tsx` заменить `console.error` на
    `Sentry.captureException(error)` (сохранить UI).
  - Мигрировать клиентские `console.error` на прямые вызовы
    `Sentry.captureException(error, { extra })` (quiz-context, contestant-admin-form,
    payment-form, gallery, useMobileID, usePayments, text-preview, instructor-edit-form,
    users-table, news-article и др.).
  - Для информационных/предупреждающих событий без объекта ошибки использовать
    `Sentry.captureMessage` или `Sentry.addBreadcrumb`.
  - Отдельный `client-logger.ts` не создаётся; unit-тест фасада не требуется.
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10. Настроить CI на выгрузку source maps
  - В `Dockerfile` добавить `ARG SENTRY_AUTH_TOKEN` и `ENV` перед `next build`.
  - В `.github/workflows/deploy.yml` пробросить `SENTRY_AUTH_TOKEN` из GitHub Secrets в
    `docker/build-push-action` (`secrets`/`build-args`).
  - Токен — только как секрет CI; сохранить существующий деплой-флоу.
  - Опционально добавить job `verify` (lint/type-check/test) перед сборкой.
  - Задокументировать необходимость завести секрет `SENTRY_AUTH_TOKEN` в GitHub Actions.
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11. MCP-конфигурация Sentry для Kiro
  - Создать `.kiro/settings/mcp.json` с записью Sentry MCP-сервера (hosted
    `https://mcp.sentry.dev/mcp` через remote либо stdio-вариант).
  - Секреты — через env; валидный JSON.
  - Сверить актуальный синтаксис с документацией Sentry MCP.
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 12. Защита от регрессий и финальная проверка
  - Добавить ESLint-правило `no-console` для серверных директорий (исключить
    `src/lib/logger.ts`).
  - Финальный прогон: `npm run lint`, `type-check`, `test`, `build`.
  - Финальный grep: нет сырых `console.*` в серверном коде (вне логгеров).
  - _Requirements: 11.1, 11.2, 11.3_
