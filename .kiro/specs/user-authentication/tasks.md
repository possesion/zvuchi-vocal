# Implementation Plan: User Authentication

## Overview

Реализация полноценной системы аутентификации для вокальной школы ЗВУЧИ на базе Auth.js v5 с Credentials provider, bcrypt-хэшированием паролей, подтверждением email, JWT-сессиями в httpOnly cookie и ролевым доступом (admin/client).

Большинство компонентов уже реализованы. Оставшиеся задачи — установка fast-check, миграция устаревших файлов, создание недостающей страницы `/resend-verification`, обновление middleware и написание тестов.

## Tasks

- [x] 1. Установить зависимости и настроить Auth.js
  - [x] 1.1 Установить `next-auth@^5.0.0-beta.31`, `bcryptjs@^2.4.3`, `@types/bcryptjs@^2.4.6`
    - Все три пакета уже присутствуют в `package.json`
    - _Requirements: 1.3, 5.1, 10.1_
  - [ ]* 1.2 Установить `fast-check` как devDependency для property-based тестов
    - Выполнить: `npm install --save-dev fast-check`
    - _Requirements: 10.1, 10.3_

- [x] 2. Инициализация базы данных и пользовательские функции (`src/lib/db.ts`)
  - [x] 2.1 Создать таблицу `users` с DDL-схемой и индексом на `verification_token`
    - Таблица создаётся в `getDb()` через `CREATE TABLE IF NOT EXISTS users (...)`
    - Индекс `idx_users_verification_token` создаётся там же
    - _Requirements: 1.1, 1.6_
  - [x] 2.2 Реализовать seed первого admin-пользователя из env-переменных
    - При пустой таблице и наличии `ADMIN_EMAIL`/`ADMIN_PASSWORD` создаётся admin с `email_verified = 1`
    - _Requirements: 1.2, 1.3_
  - [x] 2.3 Реализовать CRUD-функции для таблицы `users`
    - `getUserByEmail`, `getUserById`, `createUser`, `updateUser`, `deleteUser`, `getAllUsers`, `getUserByVerificationToken`
    - Все запросы через prepared statements
    - _Requirements: 1.4, 1.5, 10.5_
  - [ ]* 2.4 Написать property-тест: новый пользователь имеет дефолтные значения полей
    - **Property 3: New user default field values**
    - **Validates: Requirements 1.5, 2.1**
  - [ ]* 2.5 Написать property-тест: уникальность email в БД
    - **Property 2: Email uniqueness enforcement**
    - **Validates: Requirements 1.4, 2.5**
  - [ ]* 2.6 Написать property-тест: удаление пользователя удаляет запись из БД
    - **Property 19: User deletion removes record from DB**
    - **Validates: Requirements 8.2**

- [x] 3. Конфигурация Auth.js (`src/auth.ts`)
  - [x] 3.1 Создать `src/auth.ts` с Credentials provider, JWT/session callbacks и расширением типов
    - Экспортирует `handlers`, `auth`, `signIn`, `signOut`
    - JWT содержит `id` и `role`; session.user содержит `id`, `email`, `role`
    - Credentials provider проверяет email, bcrypt-хэш и `email_verified`
    - При `email_verified = 0` выбрасывает `Error('EmailNotVerified')`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.1, 9.2, 9.3_
  - [ ]* 3.2 Написать property-тест: bcrypt round-trip
    - **Property 1: Password hashing round-trip**
    - **Validates: Requirements 1.3, 2.2, 10.1, 10.2**
  - [ ]* 3.3 Написать property-тест: сессия содержит нужные поля без чувствительных данных
    - **Property 13: Session contains required user fields without sensitive data**
    - **Validates: Requirements 5.5, 9.1, 9.2, 10.4**
  - [ ]* 3.4 Написать property-тест: логин отклоняет неверные учётные данные
    - **Property 12: Login rejects incorrect credentials**
    - **Validates: Requirements 5.2, 5.3**
  - [ ]* 3.5 Написать property-тест: логин отклоняет неверифицированных пользователей
    - **Property 11: Login rejects unverified users**
    - **Validates: Requirements 5.4**

- [x] 4. Auth.js API route handler (`src/app/api/auth/[...nextauth]/route.ts`)
  - [x] 4.1 Создать route handler, экспортирующий `GET` и `POST` из `handlers`
    - Файл уже существует и корректен
    - _Requirements: 5.1_

- [x] 5. Server Actions: регистрация, верификация, повторная отправка (`src/app/actions/auth.ts`)
  - [x] 5.1 Реализовать `registerUser` с валидацией email/пароля, bcrypt-хэшированием и генерацией токена
    - Валидация формата email (regex), длина пароля ≥ 8, проверка уникальности
    - `bcrypt.hash(password, 12)`, `crypto.randomBytes(32).toString('hex')`, TTL +24ч
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [x] 5.2 Реализовать `verifyEmail` с проверкой токена, срока действия и обнулением после использования
    - Проверяет существование токена и `token_expires_at < now()`
    - Устанавливает `email_verified = 1`, `verification_token = null`, `token_expires_at = null`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.6_
  - [x] 5.3 Реализовать `resendVerification` с генерацией нового токена и отправкой письма
    - Не раскрывает факт существования email при отсутствии в БД
    - Возвращает ошибку для уже верифицированных пользователей
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ]* 5.4 Написать property-тест: валидация формата email
    - **Property 5: Email format validation rejects invalid inputs**
    - **Validates: Requirements 2.6**
  - [ ]* 5.5 Написать property-тест: валидация длины пароля
    - **Property 6: Password length validation**
    - **Validates: Requirements 2.7**
  - [ ]* 5.6 Написать property-тест: формат и уникальность токена верификации
    - **Property 4: Verification token format and uniqueness**
    - **Validates: Requirements 2.3, 10.3**
  - [ ]* 5.7 Написать property-тест: переход состояния верификации email
    - **Property 7: Email verification state transition**
    - **Validates: Requirements 3.1, 3.5, 10.6**
  - [ ]* 5.8 Написать property-тест: отклонение невалидных и истёкших токенов
    - **Property 8: Invalid and expired token rejection**
    - **Validates: Requirements 3.2, 3.3**
  - [ ]* 5.9 Написать property-тест: повторная отправка обновляет токен и срок действия
    - **Property 9: Resend verification updates token and expiry**
    - **Validates: Requirements 4.1**
  - [ ]* 5.10 Написать property-тест: повторная отправка отклоняется для верифицированных пользователей
    - **Property 10: Resend verification rejected for already-verified users**
    - **Validates: Requirements 4.3**

- [x] 6. Email: отправка письма подтверждения (`src/app/actions/sendEmail.ts`)
  - [x] 6.1 Реализовать `sendVerificationEmail(email, token)` через существующий nodemailer transporter
    - Формирует ссылку `{NEXTAUTH_URL}/verify-email?token={token}`
    - HTML-шаблон в стиле существующих писем (цвет #ab1515)
    - _Requirements: 2.4_

- [x] 7. Страница логина (`src/app/login/page.tsx`)
  - [x] 7.1 Обновить страницу логина: поле `email` (type email), вызов `signIn('credentials', ...)`, ссылка на `/register`
    - Страница уже использует `signIn` из `next-auth/react`
    - Обрабатывает ошибку `EmailNotVerified` с соответствующим сообщением
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 8. Страница регистрации (`src/app/register/page.tsx`)
  - [x] 8.1 Создать страницу `/register` с полями email, password, confirmPassword
    - Клиентская валидация совпадения паролей до отправки на сервер
    - Вызов `registerUser` Server Action
    - Ссылка на `/login`
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ]* 8.2 Написать property-тест: несовпадение паролей отклоняется на клиенте
    - **Property 21: Password confirmation mismatch is rejected client-side**
    - **Validates: Requirements 12.2**

- [x] 9. Страница подтверждения email (`src/app/verify-email/page.tsx`)
  - [x] 9.1 Создать страницу `/verify-email` с чтением `token` из query params и вызовом `verifyEmail`
    - Показывает успех со ссылкой на `/login`
    - Показывает ошибку со ссылкой на `/resend-verification`
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 10. Страница повторной отправки верификации (`src/app/resend-verification/page.tsx`)
  - [x] 10.1 Создать страницу `/resend-verification` с формой ввода email
    - Вызывает `resendVerification(email)` Server Action
    - При успехе показывает сообщение «Письмо отправлено, проверьте почту»
    - При ошибке показывает сообщение об ошибке
    - Ссылка на `/login`
    - Стили в стиле существующих страниц (bg-zinc-950, bg-zinc-900, purple-600)
    - _Requirements: 4.1, 4.2, 4.3, 13.4_

- [x] 11. Страница логаута (`src/app/logout/page.tsx`)
  - [x] 11.1 Заменить `fetch('/api/auth/logout')` на `signOut()` из Auth.js v5
    - Импортировать `signOut` из `next-auth/react`
    - Вызвать `signOut({ callbackUrl: '/' })` вместо ручного fetch
    - _Requirements: 6.1, 6.2_

- [x] 12. Страница управления пользователями (`src/app/users/page.tsx`)
  - [x] 12.1 Создать Server Component `/users` с серверной проверкой роли и таблицей пользователей
    - Отображает email, роль, статус верификации, дату регистрации
    - Server Action `deleteUserAction` с проверкой `id !== session.user.id`
    - Кнопка удаления отключена для текущего пользователя
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 12.2 Написать property-тест: самоудаление всегда отклоняется
    - **Property 20: Self-deletion is always rejected**
    - **Validates: Requirements 8.3**

- [x] 13. Middleware (`src/middleware.ts`)
  - [x] 13.1 Обновить matcher в `middleware.ts` согласно спецификации дизайна
    - Текущий matcher: `['/((?!_next/static|_next/image|favicon.ico|api/auth).*)']` — слишком широкий
    - Новый matcher должен защищать только: `/wiki/:path*/edit`, `/users/:path*`, `/api/v1/:path*`
    - Добавить редирект на `/login` для неаутентифицированных запросов к защищённым маршрутам
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 13.2 Написать property-тест: middleware блокирует неаутентифицированные запросы
    - **Property 15: Middleware blocks unauthenticated requests to protected routes**
    - **Validates: Requirements 7.1**
  - [ ]* 13.3 Написать property-тест: middleware блокирует client-роль на admin-маршрутах
    - **Property 16: Middleware blocks client-role users from admin routes**
    - **Validates: Requirements 7.2**
  - [ ]* 13.4 Написать property-тест: middleware пропускает admin через все защищённые маршруты
    - **Property 17: Middleware allows admin through all protected routes**
    - **Validates: Requirements 7.3**
  - [ ]* 13.5 Написать property-тест: middleware пропускает client через не-admin маршруты
    - **Property 18: Middleware allows client through non-admin protected routes**
    - **Validates: Requirements 7.4**

- [ ] 14. Checkpoint — Проверить базовую функциональность
  - Убедиться, что все тесты проходят, спросить пользователя при возникновении вопросов.

- [x] 15. Миграция устаревших файлов
  - [x] 15.1 Удалить `src/app/api/auth/login/route.ts` (хардкод-логин)
    - Файл содержит старую логику с `ZVUCHI_PASSWORD` и `auth_token` cookie
    - Auth.js v5 обрабатывает логин через `/api/auth/[...nextauth]`
    - _Requirements: 5.1_
  - [x] 15.2 Удалить или очистить `src/lib/auth.ts` (старые `checkAuth`/`checkApiAuth`)
    - Функции `checkAuth` и `checkApiAuth` больше не используются
    - Файл можно удалить или оставить пустым для обратной совместимости
    - _Requirements: 7.1_
  - [x] 15.3 Мигрировать `src/app/api/v1/instructors/[id]/route.ts` с `ADMIN_TOKEN` на `auth()`
    - Заменить проверку `Authorization` header на `const session = await auth()`
    - Проверять `session?.user?.role === 'admin'` вместо сравнения с `ADMIN_TOKEN`
    - _Requirements: 7.3_

- [x] 16. Добавить переменные окружения в `.env.local`
  - [x] 16.1 Добавить `AUTH_SECRET` для Auth.js v5 (обязательно для JWT-подписи)
    - Сгенерировать: `openssl rand -base64 32`
    - Добавить в `.env.local`: `AUTH_SECRET=<generated_value>`
    - Добавить в `.env.local`: `NEXTAUTH_URL=https://zvuchi-vocal.ru` (или `http://localhost:3000` для dev)
    - _Requirements: 5.6_
  - [x] 16.2 Добавить `ADMIN_EMAIL` и `ADMIN_PASSWORD` для seed первого admin
    - Добавить в `.env.local`: `ADMIN_EMAIL=<admin_email>`, `ADMIN_PASSWORD=<strong_password>`
    - _Requirements: 1.2_

- [x] 17. Финальный checkpoint — Убедиться, что все тесты проходят
  - Убедиться, что все тесты проходят, спросить пользователя при возникновении вопросов.
  - Проверить: регистрация → письмо → верификация → логин → логаут
  - Проверить: middleware корректно защищает маршруты для обеих ролей
  - Проверить: страница `/users` доступна только admin
  - Проверить: `property-тест: login-logout round-trip` (Property 14, Requirements 6.1, 6.2)

## Notes

- Задачи, отмеченные `*`, являются опциональными и могут быть пропущены для быстрого MVP
- Задачи, отмеченные `[x]`, уже реализованы в кодовой базе
- Каждая задача ссылается на конкретные требования для трассируемости
- Property-тесты используют `fast-check` (нужно установить: `npm install --save-dev fast-check`)
- Middleware требует обновления matcher — текущий вариант слишком широкий и может замедлить приложение
- Страница `/resend-verification` отсутствует, хотя на неё ссылается `/verify-email`
- Страница `/logout` всё ещё использует старый `fetch('/api/auth/logout')` вместо `signOut()`
- `src/app/api/v1/instructors/[id]/route.ts` всё ещё использует `ADMIN_TOKEN` — нужна миграция
