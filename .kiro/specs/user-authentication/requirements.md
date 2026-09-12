# Requirements Document

## Introduction

Система аутентификации и авторизации для вокальной школы ЗВУЧИ на базе Auth.js v5 с Credentials provider. Заменяет текущий хардкод-логин на полноценную БД-ориентированную систему с ролями `admin` и `client`, публичной регистрацией с подтверждением email, JWT-сессиями в httpOnly cookie и страницей управления пользователями.

## Glossary

- **Auth_System**: Система аутентификации и авторизации на базе Auth.js v5
- **Credentials_Provider**: Провайдер Auth.js, принимающий email и пароль
- **JWT_Session**: JSON Web Token, хранящийся в httpOnly cookie, содержащий `id`, `email`, `role`
- **Middleware**: Edge Runtime middleware (`middleware.ts`), защищающий маршруты
- **DB**: SQLite база данных (`data/wiki.db`), управляемая через better-sqlite3
- **User**: Запись в таблице `users` с полями `id`, `email`, `password_hash`, `role`, `email_verified`, `verification_token`, `token_expires_at`, `created_at`
- **Admin**: Пользователь с ролью `admin`, имеющий доступ ко всем маршрутам
- **Client**: Пользователь с ролью `client`, имеющий доступ только к клиентским маршрутам
- **Verification_Token**: Криптографически стойкий токен (256 бит), генерируемый при регистрации для подтверждения email
- **Server_Action**: Серверная функция Next.js App Router, выполняемая на сервере
- **Password_Hasher**: Компонент, использующий bcryptjs с cost factor 12 для хэширования паролей
- **Email_Service**: Компонент отправки email через nodemailer/SMTP
- **Auth_Config**: Конфигурационный файл `src/auth.ts` с настройками Auth.js v5

---

## Requirements

### Requirement 1: Инициализация базы данных пользователей

**User Story:** As a system administrator, I want the users table to be automatically created and seeded on startup, so that the application is ready to use without manual database setup.

#### Acceptance Criteria

1. WHEN the application starts, THE DB SHALL create the `users` table if it does not already exist, using the defined DDL schema
2. WHEN the `users` table is empty and `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables are set, THE DB SHALL create an initial admin user with `role = 'admin'` and `email_verified = 1`
3. THE DB SHALL store all passwords exclusively as bcrypt hashes with cost factor 12, never as plaintext
4. THE DB SHALL enforce a UNIQUE constraint on the `email` column
5. THE DB SHALL set `role` to `'client'` by default for all new users unless explicitly specified otherwise
6. THE DB SHALL create an index on `verification_token` to support efficient token lookup

---

### Requirement 2: Регистрация пользователя

**User Story:** As a new user, I want to register with my email and password, so that I can create an account and access the platform.

#### Acceptance Criteria

1. WHEN a user submits a registration form with a valid email and password of at least 8 characters, THE Auth_System SHALL create a new user record with `role = 'client'` and `email_verified = 0`
2. WHEN a user submits a registration form, THE Password_Hasher SHALL hash the password using bcrypt with cost factor 12 before storing it
3. WHEN a new user is created, THE Auth_System SHALL generate a Verification_Token using `crypto.randomBytes(32)` and set `token_expires_at` to 24 hours from creation time
4. WHEN a new user is created, THE Email_Service SHALL send a verification email containing a link in the format `https://zvuchi-vocal.ru/verify-email?token={token}`
5. WHEN a user submits a registration form with an email that already exists in the DB, THE Auth_System SHALL return the error `'Этот email уже зарегистрирован'` without creating a new user record
6. WHEN a user submits a registration form with an invalid email format, THE Auth_System SHALL return a validation error without creating a user record
7. WHEN a user submits a registration form with a password shorter than 8 characters, THE Auth_System SHALL return a validation error without creating a user record
8. WHEN registration succeeds, THE Auth_System SHALL return `{ success: true }` and the registration page SHALL display a message instructing the user to check their email

---

### Requirement 3: Подтверждение email

**User Story:** As a registered user, I want to verify my email address by clicking a link, so that my account becomes active and I can log in.

#### Acceptance Criteria

1. WHEN a user visits `/verify-email?token={token}` with a valid, non-expired token, THE Auth_System SHALL set `email_verified = 1` and clear `verification_token` and `token_expires_at` for the corresponding user
2. WHEN a user visits `/verify-email?token={token}` with a token that does not exist in the DB, THE Auth_System SHALL return the error `'Ссылка недействительна или устарела'`
3. WHEN a user visits `/verify-email?token={token}` with a token where `token_expires_at` is in the past, THE Auth_System SHALL return the error `'Ссылка недействительна или устарела'`
4. WHEN email verification succeeds, THE Auth_System SHALL return `{ success: true }` and the verification page SHALL display a message instructing the user to log in
5. WHEN a Verification_Token is used successfully, THE Auth_System SHALL invalidate it immediately so it cannot be reused

---

### Requirement 4: Повторная отправка письма подтверждения

**User Story:** As a registered user whose verification email expired or was lost, I want to request a new verification email, so that I can complete my account activation.

#### Acceptance Criteria

1. WHEN a user requests resend verification for an email that exists in the DB with `email_verified = 0`, THE Auth_System SHALL generate a new Verification_Token, update `token_expires_at` to 24 hours from now, and send a new verification email
2. WHEN a user requests resend verification for an email that does not exist in the DB, THE Auth_System SHALL return an error without revealing whether the email is registered
3. WHEN a user requests resend verification for an email that is already verified (`email_verified = 1`), THE Auth_System SHALL return an error indicating the email is already confirmed

---

### Requirement 5: Аутентификация (логин)

**User Story:** As a registered user with a verified email, I want to log in with my email and password, so that I can access protected areas of the application.

#### Acceptance Criteria

1. WHEN a user submits valid credentials (email exists, password matches bcrypt hash, `email_verified = 1`), THE Auth_System SHALL establish a JWT_Session stored in an httpOnly cookie and redirect the user to the home page
2. WHEN a user submits credentials where the email does not exist in the DB, THE Auth_System SHALL return the error `'Неверный email или пароль'` without revealing which field is incorrect
3. WHEN a user submits credentials where the password does not match the stored bcrypt hash, THE Auth_System SHALL return the error `'Неверный email или пароль'` without revealing which field is incorrect
4. WHEN a user submits valid credentials but `email_verified = 0`, THE Auth_System SHALL reject the login and display the message `'Подтвердите email. Письмо отправлено на {email}'`
5. THE JWT_Session SHALL contain the fields `id`, `email`, and `role` of the authenticated user
6. THE JWT_Session SHALL be stored exclusively in an httpOnly, Secure, SameSite=Lax cookie and SHALL NOT be accessible via JavaScript
7. THE JWT_Session SHALL expire after 7 days

---

### Requirement 6: Завершение сессии (логаут)

**User Story:** As an authenticated user, I want to log out, so that my session is terminated and my account is secured.

#### Acceptance Criteria

1. WHEN an authenticated user triggers logout, THE Auth_System SHALL invalidate the JWT_Session cookie and redirect the user to the login page
2. WHEN a user is logged out, THE Auth_System SHALL ensure the session cookie is cleared so subsequent requests are treated as unauthenticated

---

### Requirement 7: Защита маршрутов (Middleware)

**User Story:** As a system administrator, I want routes to be protected based on authentication and role, so that unauthorized users cannot access restricted pages.

#### Acceptance Criteria

1. WHEN an unauthenticated user requests a protected route (`/wiki/:path*/edit`, `/users/:path*`, `/api/v1/:path*`), THE Middleware SHALL redirect the user to `/login`
2. WHEN an authenticated user with `role = 'client'` requests an admin-only route (`/users/:path*`), THE Middleware SHALL redirect the user to `/`
3. WHEN an authenticated user with `role = 'admin'` requests any protected route, THE Middleware SHALL allow the request to proceed
4. WHEN an authenticated user with `role = 'client'` requests a non-admin protected route, THE Middleware SHALL allow the request to proceed

---

### Requirement 8: Управление пользователями (Admin)

**User Story:** As an admin, I want to view and manage all registered users, so that I can maintain the user base and remove accounts when necessary.

#### Acceptance Criteria

1. WHEN an admin visits `/users`, THE Auth_System SHALL display a table of all users containing email, role, email verification status, and registration date
2. WHEN an admin requests deletion of a user other than themselves, THE Auth_System SHALL delete the user record from the DB and refresh the user list
3. WHEN an admin attempts to delete their own account, THE Auth_System SHALL return the error `'Нельзя удалить собственный аккаунт'` and leave the record unchanged
4. THE Auth_System SHALL disable the delete button in the UI for the currently authenticated admin user
5. WHEN a non-admin user accesses `/users` directly (bypassing middleware), THE Auth_System SHALL perform a server-side role check and deny access

---

### Requirement 9: Расширение JWT и сессии

**User Story:** As a developer, I want the Auth.js session and JWT to include user id and role, so that server components and API routes can make authorization decisions without additional DB queries.

#### Acceptance Criteria

1. WHEN Auth.js creates a JWT token, THE Auth_Config SHALL include the user's `id` and `role` fields in the token payload
2. WHEN Auth.js creates a session object, THE Auth_Config SHALL expose `session.user.id` and `session.user.role` derived from the JWT token
3. THE Auth_Config SHALL define TypeScript type extensions for `Session`, `User`, and `JWT` interfaces to include `id` and `role` fields

---

### Requirement 10: Безопасность паролей и токенов

**User Story:** As a security-conscious operator, I want passwords and tokens to be handled securely, so that user credentials are protected even if the database is compromised.

#### Acceptance Criteria

1. THE Password_Hasher SHALL use bcrypt with cost factor 12 for all password hashing operations
2. WHEN comparing a submitted password to a stored hash, THE Auth_System SHALL use `bcrypt.compare` and SHALL NOT perform plaintext comparison
3. THE Auth_System SHALL generate Verification_Tokens using `crypto.randomBytes(32)` providing 256 bits of entropy
4. THE Auth_System SHALL never include `password_hash` in any API response, session object, or client-side data
5. THE DB SHALL use prepared statements for all SQL queries to prevent SQL injection
6. WHEN a Verification_Token is used, THE Auth_System SHALL set `verification_token` to `null` in the DB immediately after use

---

### Requirement 11: Страница логина (обновление)

**User Story:** As a user, I want a login page that uses email as the identifier and links to registration, so that I can authenticate and discover how to create an account.

#### Acceptance Criteria

1. THE Auth_System SHALL provide a login page at `/login` with `email` (type `email`) and `password` input fields
2. WHEN a user submits the login form, THE Auth_System SHALL call `signIn('credentials', { email, password })` from Auth.js v5
3. THE login page SHALL display a link to `/register` for users who do not have an account
4. WHEN authentication fails, THE login page SHALL display the error message returned by the Credentials_Provider
5. WHEN authentication succeeds, THE Auth_System SHALL redirect the user away from `/login`

---

### Requirement 12: Страница регистрации

**User Story:** As a new user, I want a registration page with email, password, and password confirmation fields, so that I can create an account with a verified password.

#### Acceptance Criteria

1. THE Auth_System SHALL provide a registration page at `/register` with `email`, `password`, and `confirmPassword` input fields
2. WHEN the `password` and `confirmPassword` fields do not match, THE Auth_System SHALL display a validation error before submitting to the server
3. WHEN registration succeeds, THE registration page SHALL display a confirmation message instructing the user to check their email
4. THE registration page SHALL display a link to `/login` for users who already have an account

---

### Requirement 13: Страница подтверждения email

**User Story:** As a user who clicked a verification link, I want a page that processes my token and shows the result, so that I know whether my email was successfully verified.

#### Acceptance Criteria

1. THE Auth_System SHALL provide a verification page at `/verify-email` that reads the `token` query parameter and calls the `verifyEmail` Server_Action
2. WHEN verification succeeds, THE verification page SHALL display a success message and a link to `/login`
3. WHEN verification fails, THE verification page SHALL display the error message returned by the `verifyEmail` Server_Action
4. THE verification page SHALL provide a link to `/resend-verification` for users whose token has expired
