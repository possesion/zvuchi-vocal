# Requirements Document

## Introduction

Данный документ описывает требования к рефакторингу кодовой базы проекта vocal-school (Next.js 15, App Router, Prisma, SQLite). Рефакторинг направлен исключительно на улучшение внутренней структуры кода — архитектуры, типизации, именования и устранения дублирования — без изменения пользовательского интерфейса или поведения приложения.

## Glossary

- **App**: приложение vocal-school на Next.js 15 с App Router
- **Server_Action**: функция Next.js с директивой `'use server'`, вызываемая напрямую из клиентских компонентов
- **ActionResult**: унифицированный тип ответа Server Actions: `{ success: true; data: T } | { success: false; error: string }`
- **ApiResponse**: существующий тип `src/types/api.ts`, применяемый ко всем REST API-маршрутам
- **Prisma_Type**: тип, генерируемый Prisma (`Prisma.UserGetPayload`, `Prisma.InstructorGetPayload` и др.)
- **Instructor**: новое имя типа, заменяющее `InstructorRow` в `src/lib/types.ts`
- **AppUser**: новое имя типа, заменяющее `UserRow` в `src/lib/types.ts`
- **NewsArticle**: новое имя типа, заменяющее `NewsRow` в `src/lib/types.ts`
- **Program**: новое имя типа, заменяющее `ProgramRow` в `src/lib/types.ts`
- **AlertDialog**: существующий компонент `src/components/common/alert-dialog/`
- **useQuizAnalytics**: новый хук для аналитики квиза (sessionStorage + Яндекс.Метрика)
- **PROTECTED_PATHS**: массив путей в `middleware.ts`, требующих аутентификации
- **inputCls**: строковая константа CSS-классов для полей ввода, используемая в нескольких компонентах

---

## Requirements

### Requirement 1: Структура директорий layout-компонентов

**User Story:** Как разработчик, я хочу, чтобы компоненты, относящиеся к layout, хранились в единой директории, чтобы структура проекта была предсказуемой.

#### Acceptance Criteria

1. THE App SHALL содержать файл `src/components/layout/burger-menu.tsx` с экспортом компонента `BurgerMenu`.
2. THE App SHALL содержать файл `src/components/layout/mobile-menu.tsx` с экспортом компонента `MobileMenu`.
3. THE App SHALL NOT содержать файл `src/app/burger-menu.tsx`.
4. THE App SHALL NOT содержать файл `src/components/mobile-menu.tsx`.
5. IF любой файл в директории `src/` импортирует `BurgerMenu`, THEN THE import path SHALL быть `@/components/layout/burger-menu`.
6. IF любой файл в директории `src/` импортирует `MobileMenu`, THEN THE import path SHALL быть `@/components/layout/mobile-menu`.

---

### Requirement 2: Защита маршрута /profile через middleware

**User Story:** Как разработчик, я хочу, чтобы защита маршрутов была централизована в middleware, а не разбросана по отдельным страницам.

#### Acceptance Criteria

1. WHEN неаутентифицированный пользователь отправляет запрос на `/profile` или любой путь вида `/profile/*`, THE Middleware SHALL вернуть HTTP-редирект на `/login`.
2. WHEN аутентифицированный пользователь отправляет запрос на `/profile`, THE Middleware SHALL пропустить запрос без редиректа.
3. THE App SHALL содержать `/profile` в массиве `PROTECTED_PATHS` в `src/middleware.ts` и `/profile/:path*` в массиве `matcher` конфига middleware.

---

### Requirement 3: Правило размещения компонентов

**User Story:** Как разработчик, я хочу иметь явное правило о том, где хранить компоненты, чтобы не принимать это решение каждый раз заново.

#### Acceptance Criteria

1. THE App SHALL следовать правилу: компонент, используемый в двух и более местах, размещается в `src/components/`.
2. THE App SHALL следовать правилу: компонент, используемый только в одной странице, размещается рядом с файлом этой страницы.

---

### Requirement 4: Мутации через Server Actions

**User Story:** Как разработчик, я хочу, чтобы мутации данных выполнялись через Server Actions, а не через клиентские `fetch POST/PATCH/DELETE`, чтобы уменьшить сложность клиентского кода.

#### Acceptance Criteria

1. THE App SHALL реализовать логику создания, обновления и удаления педагога из `InstructorManager` как вызовы Server Actions вместо `fetch POST/PATCH/DELETE`.
2. THE App SHALL реализовать сохранение профиля педагога из `InstructorProfile` как вызов Server Action вместо `fetch PATCH`.
3. THE App SHALL реализовать отправку формы квиза из `QuizContext` как вызов Server Action вместо `fetch POST`.
4. WHEN Server Action завершается успехом, THE Action SHALL возвращать значение типа `ActionResult<T>` с полем `success: true` и опциональным полем `data`.
5. IF Server Action завершается с ошибкой, THEN THE Action SHALL возвращать `ActionResult<T>` с полем `success: false` и непустым строковым полем `error`.
6. WHEN Server Action изменяет данные, затрагивающие конкретный маршрут, THE Action SHALL вызывать `revalidatePath` для соответствующего маршрута.

---

### Requirement 5: Декомпозиция компонента InstructorProfile

**User Story:** Как разработчик, я хочу, чтобы компонент `InstructorProfile` был разбит на меньшие части, чтобы каждый файл выполнял одну задачу.

#### Acceptance Criteria

1. THE App SHALL содержать компонент `InstructorEditForm` в отдельном файле, принимающий проп `instructor: Instructor` и проп `onSaved: () => void`.
2. THE App SHALL содержать компонент `VideoPlaceholder` в отдельном файле, отображающий иконку Play и текст «Видео скоро появится».
3. WHEN `isAuthorized` равно `true` и пользователь нажимает «Редактировать», THE InstructorProfile SHALL отображать `InstructorEditForm` вместо встроенной inline-формы.
4. WHEN секция видео-визитки не содержит URL (`presentation_video` пуст), THE InstructorProfile SHALL отображать `VideoPlaceholder`.
5. WHEN секция выступлений не содержит ни одного URL (`performance_videos` пуст), THE InstructorProfile SHALL отображать `VideoPlaceholder`.

---

### Requirement 6: Декомпозиция компонента Programs

**User Story:** Как разработчик, я хочу, чтобы компонент `Programs` не содержал встроенных диалогов подтверждения и дублирующего кода форматирования.

#### Acceptance Criteria

1. THE App SHALL выделить карточку первого занятия из `Programs` в отдельный компонент `FirstLessonCard`.
2. WHEN компонент `Programs` запрашивает подтверждение удаления абонемента, THE Programs SHALL использовать существующий компонент `AlertDialog` вместо inline-разметки.
3. THE Programs SHALL использовать функцию `formatPrice` из `src/lib/format.ts` вместо локально объявленной функции с таким же названием.

---

### Requirement 7: Вынесение аналитики квиза в хук

**User Story:** Как разработчик, я хочу, чтобы логика аналитики квиза была изолирована от логики формы, чтобы оба аспекта было легче тестировать и изменять независимо.

#### Acceptance Criteria

1. THE App SHALL создать хук `useQuizAnalytics` в `src/hooks/use-quiz-analytics.ts`, инкапсулирующий работу с sessionStorage и вызовы Яндекс.Метрики.
2. WHEN компонент `QuizProvider` переходит на новый шаг квиза, THE QuizProvider SHALL использовать хук `useQuizAnalytics` вместо встроенной логики sessionStorage и `trackEvent`.

---

### Requirement 8: Единый компонент AlertDialog для подтверждения удаления

**User Story:** Как разработчик, я хочу использовать один компонент `AlertDialog` во всех местах подтверждения удаления, чтобы не поддерживать независимые inline-реализации.

#### Acceptance Criteria

1. THE App SHALL заменить все inline delete-диалоги во всех компонентах (`Programs`, `InstructorManager`, `UsersTable`, `gallery.tsx` и любых других) на компонент `AlertDialog` из `src/components/common/alert-dialog/`.
2. WHEN пользователь инициирует удаление, THE AlertDialog SHALL отображать заголовок, описание, кнопку подтверждения и кнопку отмены.
3. IF Server Action удаления завершается с ошибкой, THEN THE App SHALL отображать сообщение об ошибке пользователю (через `notify` из `useUI` или аналогичный механизм).

---

### Requirement 9: Использование ROLE_LABELS из src/lib/roles.ts

**User Story:** Как разработчик, я хочу, чтобы метки ролей были определены в одном месте, чтобы не допускать расхождения переводов.

#### Acceptance Criteria

1. THE App SHALL удалить локальный объект `roleLabels` из `src/app/profile/page.tsx`.
2. THE App SHALL использовать константу `ROLE_LABELS` из `src/lib/roles.ts` везде, где требуется отображение названия роли пользователя.

---

### Requirement 10: Устранение дублирования в QuizContext через useContactForm

**User Story:** Как разработчик, я хочу, чтобы `QuizContext` не дублировал логику `handleChange` и форматирования телефона, которая уже реализована в хуке `useContactForm`.

#### Acceptance Criteria

1. THE QuizContext SHALL использовать хук `useContactForm` для управления полями `name` и `phone` вместо отдельного состояния `formData` и локальной функции `handleChange`.
2. THE App SHALL удалить из `src/components/modals/quiz-context.tsx` дублирующий импорт `formatPhoneNumber` и локальную функцию `handleChange`.

---

### Requirement 11: Централизация форматтеров в src/lib/format.ts

**User Story:** Как разработчик, я хочу, чтобы все утилиты форматирования находились в одном файле, чтобы не искать и не дублировать их по всей кодовой базе.

#### Acceptance Criteria

1. THE App SHALL перенести функции `formatters.date`, `formatters.dateTime`, `formatters.balance` и `formatters.lessonCount` из `src/components/sections/client-balance.tsx` в `src/lib/format.ts`.
2. WHEN компонент `ClientBalance` форматирует данные, THE ClientBalance SHALL использовать функции из `src/lib/format.ts`.
3. THE App SHALL экспортировать перенесённые функции форматирования из `src/lib/format.ts` для использования в других модулях.

---

### Requirement 12: Вынесение константы inputCls

**User Story:** Как разработчик, я хочу, чтобы CSS-константа для стилей полей ввода не копировалась между компонентами.

#### Acceptance Criteria

1. THE App SHALL объявить строку `inputCls` ровно в одном общем файле констант.
2. THE InstructorProfile SHALL использовать импортированную константу `inputCls` вместо локально объявленной.
3. THE InstructorManager SHALL использовать импортированную константу `inputCls` вместо локально объявленной.

---

### Requirement 13: Удаление мёртвого кода

**User Story:** Как разработчик, я хочу удалить файлы, которые нигде не используются, чтобы не вводить в заблуждение будущих разработчиков.

#### Acceptance Criteria

1. THE App SHALL удалить файл `src/types/instructor.ts`, содержащий неиспользуемый интерфейс `Instructor` с полем `bio: ReactNode`.
2. THE App SHALL удалить файл `src/types/program.ts`, содержащий неиспользуемый интерфейс `Program` с полем `icon: ReactNode`.
3. IF любой файл импортирует типы из `src/types/instructor.ts` или `src/types/program.ts`, THEN THE App SHALL заменить эти импорты на актуальные типы из `src/lib/types.ts` до удаления файлов.

---

### Requirement 14: Замена 0|1 anti-pattern на boolean

**User Story:** Как разработчик, я хочу, чтобы булевы поля в TypeScript-типах были объявлены как `boolean`, а не как `0 | 1`, отражая реальную семантику данных.

#### Acceptance Criteria

1. THE App SHALL заменить поля `phone_verified: 0 | 1` и `email_verified: 0 | 1` в интерфейсе `UserRow` на `phoneVerified: boolean` и `emailVerified: boolean`.
2. THE App SHALL обновить функцию `convertPrismaUserToRow` в `src/lib/db-prisma.ts`: передавать `user.phoneVerified` и `user.emailVerified` напрямую без преобразования `? 1 : 0`.
3. THE App SHALL заменить все сравнения `user.phone_verified !== 1` / `=== 1` и `user.email_verified !== 1` / `=== 1` на `user.phoneVerified` / `!user.phoneVerified` и `user.emailVerified` / `!user.emailVerified` в следующих файлах: `src/auth.ts`, `src/app/actions/profile.ts`, `src/app/actions/crm.ts`, `src/app/profile/page.tsx`, `src/components/sections/profile/phone-verification.tsx`.
4. THE App SHALL обновить тип `UserUpdateData` в `src/lib/types.ts`: поля `phone_verified` и `email_verified` должны принимать `boolean` вместо `0 | 1`.

---

### Requirement 15: Миграция к Prisma-генерированным типам

**User Story:** Как разработчик, я хочу, чтобы типы данных приложения основывались на Prisma-генерированных типах, а не на ручном слое конвертации, чтобы устранить расхождения при изменении схемы.

#### Acceptance Criteria

1. THE App SHALL удалить функции `convertPrismaUserToRow`, `convertPrismaInstructorToRow`, `convertPrismaNewsToRow`, `convertPrismaProgramToRow` и `convertPrismaWikiTermToRow` из `src/lib/db-prisma.ts`.
2. THE App SHALL возвращать из всех публичных функций `src/lib/db-prisma.ts` типы, основанные на `Prisma.UserGetPayload`, `Prisma.InstructorGetPayload`, `Prisma.NewsGetPayload`, `Prisma.ProgramGetPayload` и `Prisma.WikiTermGetPayload` (или нативные возвращаемые типы Prisma), вместо `*Row`-типов.
3. WHEN поле базы данных хранит JSON-строку (`performanceVideos`, `techniques`, `packages`, `features`), THE db-prisma layer SHALL выполнять парсинг JSON и возвращать типизированный массив — это единственное место в кодовой базе, где производится этот парсинг.
4. IF парсинг JSON завершается ошибкой, THEN THE db-prisma layer SHALL возвращать пустой массив `[]` и не пробрасывать исключение.

---

### Requirement 16: Централизованный тип ActionResult

**User Story:** Как разработчик, я хочу, чтобы все Server Actions возвращали одинаково структурированный тип результата, чтобы клиентский код мог обрабатывать ошибки предсказуемо.

#### Acceptance Criteria

1. THE App SHALL определить тип `ActionResult<T = void>` в файле `src/app/actions/types.ts` следующим образом: `type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }`. Существующий тип `VerifyPhoneCodeResult` в этом же файле SHALL быть заменён на `ActionResult`.
2. THE App SHALL применить `ActionResult<void>` ко всем Server Actions, не возвращающим полезных данных при успехе (`updateUserName`, `updateUserProfile`, `sendPhoneVerification`, `updateInstructor`, `deleteInstructor` и аналогичные). Server Actions, ранее использующие `throw` для сигнализации об ошибке (`sendEmail`, `sendVerificationEmail`, `sendPasswordResetEmail`), SHALL быть изменены для возврата `ActionResult<void>` вместо броска исключения.
3. THE App SHALL применить тип `ApiResponse<T>` из `src/types/api.ts` ко всем обработчикам маршрутов в `src/app/api/v1/` в качестве типа возвращаемого значения `NextResponse`.

---

### Requirement 17: Переименование типов и полей

**User Story:** Как разработчик, я хочу, чтобы имена типов отражали предметную область, а не детали реализации хранилища данных.

#### Acceptance Criteria

1. THE App SHALL переименовать экспортируемый тип `InstructorRow` в `Instructor` в `src/lib/types.ts` и обновить все импорты в кодовой базе.
2. THE App SHALL переименовать экспортируемый тип `UserRow` в `AppUser` в `src/lib/types.ts` и обновить все импорты в кодовой базе.
3. THE App SHALL переименовать экспортируемый тип `NewsRow` в `NewsArticle` в `src/lib/types.ts` и обновить все импорты в кодовой базе.
4. THE App SHALL переименовать экспортируемый тип `ProgramRow` в `Program` в `src/lib/types.ts` и обновить все импорты в кодовой базе.
5. THE App SHALL переименовать поле `feature` в `tagline` в типе `Instructor` (бывший `InstructorRow`) в `src/lib/types.ts`, в модели `Instructor` в `prisma/schema.prisma` и в функциях `src/lib/db-prisma.ts`, затем обновить все места использования этого поля в кодовой базе.
6. THE App SHALL удалить интерфейс `InstructorDbRow` из `src/lib/types.ts`, поскольку после миграции к Prisma-типам (Requirement 15) он становится избыточным.

---

### Requirement 18: Перевод полей типов на camelCase

**User Story:** Как разработчик, я хочу, чтобы поля TypeScript-типов приложения использовали camelCase, совпадающий с именованием в Prisma, чтобы устранить необходимость маппинга при каждом обращении к БД.

#### Acceptance Criteria

1. THE App SHALL перевести все snake_case-поля типов `Instructor`, `AppUser`, `NewsArticle` и `Program` в `src/lib/types.ts` на camelCase: например, `sort_order → sortOrder`, `cover_url → coverUrl`, `short_description → shortDescription`, `is_popular → isPopular`, `password_hash → passwordHash`, `phone_verify_code → phoneVerifyCode` и т.д.
2. THE App SHALL обновить все ссылки на переименованные поля во всей кодовой базе: компоненты, API-маршруты в `src/app/api/v1/`, Server Actions, утилиты и хуки.
3. THE App SHALL удалить из функции `updateUser` в `src/lib/db-prisma.ts` динамический маппинг snake_case → camelCase (`fieldMapping` и `replace(/_([a-z])...)`), заменив его на прямое обращение к camelCase-полям аргумента `data`.
