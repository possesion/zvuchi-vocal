# Yandex OAuth Redirect URI Fix Bugfix Design

## Overview

Вход через Yandex не работает, потому что `handleYandexSignIn` в `src/app/login/page.tsx` вызывает `signIn('yandex', { redirect_uri: 'https://zvuchi-vocal.ru' })`. Параметр `redirect_uri` не поддерживается клиентским API `signIn()` из `next-auth/react` — он просто попадает в тело POST-запроса и игнорируется. Auth.js всегда самостоятельно вычисляет фактический `redirect_uri`, отправляемый провайдеру, по формуле `${NEXTAUTH_URL}/api/auth/callback/yandex`. Реальная причина ошибки `400` от Yandex — рассинхронизация между этим вычисленным значением и Callback URL, зарегистрированным для приложения на oauth.yandex.ru.

Фикс на уровне кода — привести `handleYandexSignIn` к тому же паттерну, что уже используется в `handleGoogleSignIn`: убрать неэффективный `redirect_uri` и использовать поддерживаемую опцию `callbackUrl`:

```ts
const handleYandexSignIn = () => {
    signIn('yandex', { callbackUrl: '/profile' })
}
```

Это устраняет ложное ощущение, что redirect_uri настраивается из кода, и приводит поведение Yandex-кнопки в соответствие с Google-кнопкой (переход после успешного логина на `/profile`).

Однако сам код никогда не мог управлять тем OAuth `redirect_uri`, который Auth.js отправляет Yandex — этот URL целиком определяется `NEXTAUTH_URL` + фиксированным путём `/api/auth/callback/yandex` и настройками приложения на стороне Yandex. Поэтому исправление кода необходимо, но недостаточно: пока Callback URL, зарегистрированный в приложении на oauth.yandex.ru (для `YANDEX_CLIENT_ID`), не будет равен `https://zvuchi-vocal.ru/api/auth/callback/yandex`, ошибка `400` будет воспроизводиться независимо от кода. Эта проверка/изменение выполняется вручную во внешнем сервисе (oauth.yandex.ru) и не может быть верифицирована или изменена из кодовой базы — она документируется как явный шаг ручной/внешней проверки в этом дизайне.

## Glossary

- **Bug_Condition (C)**: условие, при котором проявляется баг — пользователь инициирует вход через Yandex, используя код, который передаёт неподдерживаемый параметр `redirect_uri` в `signIn('yandex', ...)`
- **Property (P)**: желаемое поведение — `signIn('yandex', ...)` вызывается только с поддерживаемыми опциями (`callbackUrl`), без передачи неэффективного `redirect_uri`, аналогично `handleGoogleSignIn`
- **Preservation**: поведение входа через Google (`handleGoogleSignIn`) и через email/пароль (Credentials), а также использование `NEXTAUTH_URL`/`trustHost` в остальном приложении — должны остаться без изменений
- **handleYandexSignIn**: функция-обработчик клика по кнопке «Войти через Yandex» в `src/app/login/page.tsx`
- **handleGoogleSignIn**: соседняя функция-обработчик клика по кнопке «Войти через Google» в том же файле, используется как эталонный паттерн
- **redirect_uri (OAuth)**: URL, на который провайдер (Yandex) должен вернуть пользователя после авторизации; фактически вычисляется Auth.js на сервере и не может быть переопределён клиентским вызовом `signIn()`
- **callbackUrl**: поддерживаемая NextAuth/Auth.js опция клиентского `signIn()`, определяющая, куда перенаправить пользователя в приложении после успешного завершения входа
- **Callback URL (Yandex)**: значение, настраиваемое в личном кабинете приложения на oauth.yandex.ru; должно точно совпадать с `${NEXTAUTH_URL}/api/auth/callback/yandex`

## Bug Details

### Bug Condition

Баг проявляется, когда код вызывает клиентский `signIn('yandex', { redirect_uri: ... })` с параметром `redirect_uri`, который клиентский API `signIn()` не поддерживает и который не влияет на фактический OAuth `redirect_uri`, вычисляемый Auth.js на сервере. Это создаёт ложное впечатление, что redirect_uri управляется из кода, в то время как реальная причина ошибки `400` от Yandex — несовпадение вычисленного Auth.js `redirect_uri` с Callback URL, зарегистрированным на oauth.yandex.ru.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type SignInCall
  OUTPUT: boolean

  RETURN input.provider == 'yandex'
         AND input.options CONTAINS KEY 'redirect_uri'
         AND NOT (input.options CONTAINS KEY 'callbackUrl')
END FUNCTION
```

### Examples

- Текущий код: `signIn('yandex', { redirect_uri: 'https://zvuchi-vocal.ru' })` — `redirect_uri` игнорируется клиентским API, пользователь получает `400 redirect_uri не совпадает с Callback URL` от Yandex, ожидалось перенаправление на страницу авторизации Yandex
- После нажатия кнопки «Войти через Yandex» пользователь не видит explicit объяснения на `/login`, почему вход не удался — ожидалось либо успешное перенаправление, либо явная ошибка
- Кнопка «Войти через Google» (`handleGoogleSignIn`) с `signIn('google', { callbackUrl: '/profile' })` работает корректно — используется как образец правильного паттерна
- Граничный случай: даже после исправления кода ошибка `400` продолжит воспроизводиться, если Callback URL приложения на oauth.yandex.ru не равен `https://zvuchi-vocal.ru/api/auth/callback/yandex` — это внешняя конфигурация, не устранимая правкой кода

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Вход через Google (`handleGoogleSignIn`, `signIn('google', { callbackUrl: '/profile' })`) должен продолжать работать без изменений
- Вход через email/пароль (Credentials, `onSubmit` в `LoginPage`) должен продолжать работать без изменений, включая обработку ошибок `EmailNotVerified` и `UseGoogle`
- Использование `NEXTAUTH_URL` и `trustHost: true` в `src/auth.config.ts`/`src/auth.ts` для формирования абсолютных ссылок и редиректов middleware должно остаться неизменным
- Внешний вид и разметка кнопки «Войти через Yandex» (иконка, текст, стили) должны остаться неизменными — меняется только логика обработчика клика

**Scope:**
Все вызовы, не связанные с `handleYandexSignIn` (клик по Google-кнопке, отправка формы Credentials, любые другие клиентские вызовы `signIn`/`auth`), должны быть полностью не затронуты этим исправлением. Это включает:
- Клик по кнопке «Войти через Google»
- Отправку формы входа по email/паролю
- Работу middleware и серверных callback-функций (`jwt`, `session`, `authorized`)
- Регистрацию провайдера `YandexProvider` в `src/auth.ts` (`clientId`/`clientSecret`) — эти настройки не меняются

## Hypothesized Root Cause

Основываясь на описании бага и коде `src/app/login/page.tsx`:

1. **Неподдерживаемая клиентская опция**: `signIn()` из `next-auth/react` принимает `callbackUrl`, `redirect`, `redirectTo` и провайдер-специфичные значения, передаваемые в форму, но не интерпретирует `redirect_uri` как OAuth-параметр — эта опция просто игнорируется сервером Auth.js при построении URL авторизации
   - `handleGoogleSignIn` рядом в том же файле уже использует правильный паттерн (`callbackUrl`), что подтверждает несогласованность именно в `handleYandexSignIn`

2. **Ошибочное предположение о контроле redirect_uri из клиента**: разработчик, вероятно, пытался явно задать OAuth `redirect_uri`, не зная, что Auth.js всегда вычисляет его самостоятельно на сервере как `${NEXTAUTH_URL}/api/auth/callback/yandex`, независимо от клиентских опций

3. **Рассинхронизация внешней конфигурации**: даже без опечатки в коде, Callback URL, зарегистрированный в приложении на oauth.yandex.ru для `YANDEX_CLIENT_ID`, может не совпадать с `https://zvuchi-vocal.ru/api/auth/callback/yandex` — это отдельная, не связанная с кодом причина ошибки `400`, которую нельзя проверить или исправить из кодовой базы

4. **Отсутствие явной верификации внешней настройки**: в существующем процессе разработки не было явного шага проверки Callback URL на стороне Yandex после того, как было замечено, что redirect_uri в коде "не работает"

## Correctness Properties

Property 1: Bug Condition - Использование неэффективного redirect_uri вместо callbackUrl

_For any_ клик по кнопке «Войти через Yandex», где `isBugCondition` истинно (обработчик передаёт неподдерживаемый `redirect_uri` и не передаёт `callbackUrl`), исправленный `handleYandexSignIn` SHALL вызывать `signIn('yandex', { callbackUrl: '/profile' })` — то есть не передавать `redirect_uri` и передавать поддерживаемую опцию `callbackUrl` со значением `/profile`, аналогично `handleGoogleSignIn`.

**Validates: Requirements 2.1**

Property 2: Preservation - Поведение Google и Credentials входа не меняется

_For any_ действие, не являющееся вызовом `handleYandexSignIn` (клик по Google-кнопке, сабмит формы Credentials, работа middleware/callbacks), исправленный код SHALL производить точно такой же результат, как до исправления, сохраняя поведение `handleGoogleSignIn`, обработку ошибок Credentials-входа (`EmailNotVerified`, `UseGoogle`) и использование `NEXTAUTH_URL`/`trustHost`.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

**File**: `src/app/login/page.tsx`

**Function**: `handleYandexSignIn`

**Specific Changes**:
1. **Удалить неэффективный параметр**: убрать `redirect_uri: 'https://zvuchi-vocal.ru'` из вызова `signIn('yandex', ...)` — этот параметр не поддерживается клиентским API и не влияет на фактический OAuth redirect_uri

2. **Добавить поддерживаемую опцию `callbackUrl`**: заменить вызов на `signIn('yandex', { callbackUrl: '/profile' })`, зеркально повторяя существующий паттерн `handleGoogleSignIn` (`signIn('google', { callbackUrl: '/profile' })`), чтобы после успешного входа через Yandex пользователь также перенаправлялся на `/profile`

3. **Не менять остальной код файла**: `onSubmit`, `handleGoogleSignIn`, разметка формы и кнопок, импорты — остаются без изменений

4. **Не менять `src/auth.ts` / `src/auth.config.ts`**: регистрация `YandexProvider({ clientId, clientSecret })` и общая конфигурация Auth.js (в частности `NEXTAUTH_URL`, `trustHost: true`) не требуют изменений в коде — сервер и так вычисляет `redirect_uri` корректно относительно `NEXTAUTH_URL`

**File**: внешняя конфигурация — приложение на **oauth.yandex.ru** (не в кодовой базе)

**Manual/External Verification Step (обязателен, не может быть выполнен из кода)**:
5. **Проверить/обновить Callback URL в приложении Yandex OAuth**: в личном кабинете разработчика на `oauth.yandex.ru`, в настройках приложения, соответствующего `YANDEX_CLIENT_ID` из `.env.local`, поле "Callback URL" (Redirect URI) SHALL быть установлено ровно в:
   ```
   https://zvuchi-vocal.ru/api/auth/callback/yandex
   ```
   Это значение равно `${NEXTAUTH_URL}` (`https://zvuchi-vocal.ru` в `.env.local`) + путь по умолчанию Auth.js для callback-эндпоинта провайдера `/api/auth/callback/yandex`. Любое отличие (другой домен, отсутствие пути, http вместо https, лишний слэш) приведёт к повторению ошибки `400 redirect_uri не совпадает с Callback URL`, независимо от исправления в коде. Эта настройка находится вне репозитория, недоступна для автоматической верификации инструментами кодовой базы и должна быть проверена/изменена вручную человеком, имеющим доступ к личному кабинету на oauth.yandex.ru.

## Testing Strategy

### Validation Approach

Тестирование состоит из двух фаз: сначала подтверждается, что текущий код действительно передаёт неэффективный `redirect_uri` (эксплораторная проверка на неисправленном коде), затем проверяется, что исправленный обработчик использует `callbackUrl` так же, как `handleGoogleSignIn`, и что поведение Google/Credentials входа не изменилось. Поскольку фактическая причина ошибки `400` частично лежит вне кода (настройка на oauth.yandex.ru), автоматические тесты могут проверить только код-часть фикса (вызов `signIn` с правильными аргументами); совпадение redirect_uri с внешней настройкой Yandex остаётся ручным шагом.

### Exploratory Bug Condition Checking

**Goal**: Подтвердить на неисправленном коде, что `handleYandexSignIn` вызывает `signIn('yandex', ...)` с `redirect_uri` и без `callbackUrl`, в отличие от `handleGoogleSignIn`.

**Test Plan**: Замокать `signIn` из `next-auth/react`, отрендерить `LoginPage`, кликнуть по кнопке «Войти через Yandex» и проверить аргументы вызова мока. Выполнить этот тест на неисправленном коде, чтобы зафиксировать текущее (неверное) поведение.

**Test Cases**:
1. **Yandex Button Args Test**: клик по кнопке «Войти через Yandex» → мок `signIn` вызван с `('yandex', { redirect_uri: 'https://zvuchi-vocal.ru' })` (провалится после фикса, так как аргументы изменятся)
2. **Yandex Missing callbackUrl Test**: проверка, что на неисправленном коде опция `callbackUrl` отсутствует в аргументах вызова `signIn('yandex', ...)`
3. **Google Button Args Reference Test**: клик по кнопке «Войти через Google» → мок `signIn` вызван с `('google', { callbackUrl: '/profile' })`, используется как эталон ожидаемого паттерна (уже проходит на неисправленном коде)

**Expected Counterexamples**:
- `signIn` для Yandex вызывается с `redirect_uri`, а не с `callbackUrl`
- Возможные причины: неверное предположение о поддерживаемых опциях клиентского `signIn()`, путаница между клиентским `callbackUrl` и серверным OAuth `redirect_uri`

### Fix Checking

**Goal**: Проверить, что для всех вызовов, где выполняется условие бага, исправленная функция вызывает `signIn` с ожидаемыми аргументами.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := handleYandexSignIn_fixed()
  ASSERT signIn.calledWith('yandex', { callbackUrl: '/profile' })
  ASSERT NOT signIn.calledWithOptionKey('redirect_uri')
END FOR
```

### Preservation Checking

**Goal**: Проверить, что для действий, не связанных с Yandex-кнопкой, исправленный код производит тот же результат, что и до исправления.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT behavior_original(input) = behavior_fixed(input)
END FOR
```

**Testing Approach**: Для preservation-проверки достаточно unit/интеграционных тестов на уровне компонента `LoginPage` (мокая `signIn` и, при необходимости, `getUserByEmail`/`bcrypt` для Credentials-ветки), так как затронутая поверхность — один локальный обработчик в клиентском компоненте. Property-based testing не даёт дополнительной ценности здесь, так как входной домен (клик по одной из двух OAuth-кнопок или сабмит формы) мал и полностью перечисляем.

**Test Plan**: Наблюдать поведение Google-кнопки и формы Credentials на неисправленном коде, зафиксировать ожидаемые аргументы/переходы, затем убедиться, что после фикса это поведение не изменилось.

**Test Cases**:
1. **Google Sign-In Preservation**: клик по кнопке «Войти через Google» до и после фикса вызывает `signIn('google', { callbackUrl: '/profile' })` без изменений
2. **Credentials Sign-In Preservation**: сабмит формы с валидными/невалидными данными до и после фикса вызывает `signIn('credentials', { email, password, redirect: false, ... })` и обрабатывает `authResult.error`/`authResult.ok` так же, как раньше
3. **Yandex Button Markup Preservation**: после фикса кнопка «Войти через Yandex» сохраняет прежние иконку, текст и стили — изменяется только обработчик клика

### Unit Tests

- Тест обработчика `handleYandexSignIn`: проверка точных аргументов вызова `signIn('yandex', { callbackUrl: '/profile' })`
- Тест обработчика `handleGoogleSignIn`: регресс-проверка, что аргументы не изменились (`signIn('google', { callbackUrl: '/profile' })`)
- Тест, что после фикса ни один аргумент, передаваемый в `signIn('yandex', ...)`, не содержит ключ `redirect_uri`

### Property-Based Tests

Property-based тесты не применяются к этому фиксу: изменение затрагивает единственный обработчик с фиксированным набором аргументов (без пользовательского ввода или диапазона значений), поэтому исчерпывающее unit-покрытие полностью покрывает область изменения. Единственная переменная величина — Callback URL на стороне Yandex — не тестируема программно и покрывается ручной верификацией (см. Fix Implementation, шаг 5).

### Integration Tests

- Рендер `/login`, клик по кнопке «Войти через Yandex», проверка, что вызывается `signIn` с корректными аргументами и (при `redirect: true` по умолчанию для OAuth-провайдеров) браузер перенаправляется на URL авторизации Yandex, построенный Auth.js
- Рендер `/login`, клик по кнопке «Войти через Google», проверка отсутствия регрессий в существующем потоке
- Ручная сквозная проверка (вне автоматических тестов): после деплоя фикса и подтверждения/обновления Callback URL на oauth.yandex.ru — реальный клик по кнопке «Войти через Yandex» должен успешно завершаться перенаправлением на `/profile` с активной сессией
