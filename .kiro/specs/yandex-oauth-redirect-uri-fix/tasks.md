# Implementation Plan

- [ ] 1. Написать эксплораторный тест на условие бага (Bug Condition)
  - **Property 1: Bug Condition** - Yandex-кнопка вызывает signIn с неэффективным redirect_uri вместо callbackUrl
  - **CRITICAL**: Этот тест ДОЛЖЕН провалиться на неисправленном коде — провал подтверждает наличие бага
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: Тест кодирует ожидаемое поведение — после фикса он станет проходить и будет подтверждать исправление
  - **GOAL**: Зафиксировать контрпример, демонстрирующий баг
  - **Scoped PBT Approach**: Баг детерминированный (единственный обработчик с фиксированными аргументами), поэтому тест скоупится на конкретный случай — клик по кнопке «Войти через Yandex» на неисправленном `handleYandexSignIn`
  - Создать файл теста `src/test/login-page.test.tsx` (по аналогии с `src/test/enrollment-form.test.tsx`), замокать `signIn` из `next-auth/react` через `vi.mock('next-auth/react')`
  - Отрендерить `LoginPage` из `@/app/login/page`, кликнуть по кнопке «Войти через Yandex» (`getByRole('button', { name: /войти через yandex/i })`)
  - Assert (согласно `isBugCondition` из design.md): мок `signIn` вызван с `('yandex', expect.objectContaining({ redirect_uri: 'https://zvuchi-vocal.ru' }))` И аргументы НЕ содержат ключ `callbackUrl`
  - Запустить тест на текущем (неисправленном) `src/app/login/page.tsx`
  - **EXPECTED OUTCOME**: Тест ПРОХОДИТ на неисправленном коде в части фиксации бага (т.к. описывает текущее дефектное поведение) — задокументировать это как подтверждённый контрпример: `signIn('yandex', { redirect_uri: 'https://zvuchi-vocal.ru' })`, а не `signIn('yandex', { callbackUrl: '/profile' })`
  - Задокументировать в комментарии теста, что после фикса этот же ассерт должен быть заменён/инвертирован на проверку `callbackUrl` (см. задачу 3.2) — то есть данный тест играет роль эксплораторной фиксации, а окончательная проверка Property 1 переносится в задачу 3.2 с ассертами на `callbackUrl`
  - _Requirements: 1.1, 2.1_

- [ ] 2. Написать preservation-тесты для Google и Credentials входа (ДО внесения фикса)
  - **Property 2: Preservation** - Поведение Google и Credentials входа не меняется
  - **IMPORTANT**: Следовать observation-first методологии
  - Observe: клик по кнопке «Войти через Google» на неисправленном коде вызывает `signIn('google', { callbackUrl: '/profile' })`
  - Observe: сабмит формы Credentials с валидными данными на неисправленном коде вызывает `signIn('credentials', { email, password, redirect: false })` (и с `maxAge: REMEMBER_ME_MAX_AGE` при включённом «Запомнить меня»)
  - Observe: при `authResult.error === 'EmailNotVerified'` отображается сообщение `Подтвердите email. Письмо отправлено на ${email}`; при `authResult.error === 'UseGoogle'` — `Этот аккаунт зарегистрирован через Google. Войдите через Google.`; иначе — `Неверный email или пароль`
  - Observe: при `authResult.ok === true` вызывается `router.push('/profile')` (замокать `useRouter` из `next/navigation`)
  - В файле `src/test/login-page.test.tsx` добавить тесты, покрывающие этот домен (клик по Google-кнопке; сабмит формы с валидными данными; сабмит с ошибкой `EmailNotVerified`; сабмит с ошибкой `UseGoogle`; сабмит с успешным `authResult.ok`)
  - Запустить тесты на неисправленном коде
  - **EXPECTED OUTCOME**: Все тесты ПРОХОДЯТ на неисправленном коде (фиксируют базовую линию поведения, которую нельзя нарушать фиксом Yandex-кнопки)
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3. Исправить `handleYandexSignIn` в `src/app/login/page.tsx`

  - [ ] 3.1 Внести исправление
    - Заменить `signIn('yandex', { redirect_uri: 'https://zvuchi-vocal.ru' })` на `signIn('yandex', { callbackUrl: '/profile' })` в функции `handleYandexSignIn`
    - Не менять `onSubmit`, `handleGoogleSignIn`, разметку кнопок/формы, импорты и остальной код файла
    - Не менять `src/auth.ts` / `src/auth.config.ts` (регистрацию `YandexProvider`, `NEXTAUTH_URL`, `trustHost`)
    - _Bug_Condition: isBugCondition(input) — input.provider == 'yandex' AND input.options CONTAINS 'redirect_uri' AND NOT input.options CONTAINS 'callbackUrl'_
    - _Expected_Behavior: signIn вызывается как ('yandex', { callbackUrl: '/profile' }), без ключа redirect_uri, аналогично handleGoogleSignIn_
    - _Preservation: поведение handleGoogleSignIn, обработка ошибок Credentials (EmailNotVerified, UseGoogle), использование NEXTAUTH_URL/trustHost — без изменений_
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.2 Проверить, что тест на условие бага теперь подтверждает исправленное поведение
    - **Property 1: Expected Behavior** - Yandex-кнопка вызывает signIn с callbackUrl вместо redirect_uri
    - **IMPORTANT**: Обновить ассерты теста из задачи 1 на проверку исправленного поведения — не создавать новый тестовый файл, изменить существующие ассерты в `src/test/login-page.test.tsx`
    - Assert: мок `signIn` вызван с `('yandex', { callbackUrl: '/profile' })`
    - Assert: аргументы вызова `signIn('yandex', ...)` НЕ содержат ключ `redirect_uri`
    - Запустить тест на исправленном коде
    - **EXPECTED OUTCOME**: Тест ПРОХОДИТ (подтверждает, что баг исправлен)
    - _Requirements: 2.1_

  - [ ] 3.3 Проверить, что preservation-тесты всё ещё проходят
    - **Property 2: Preservation** - Поведение Google и Credentials входа не меняется
    - **IMPORTANT**: Повторно запустить те же тесты из задачи 2 — не писать новые тесты
    - Запустить тесты Google-кнопки и Credentials-формы из задачи 2 на исправленном коде
    - **EXPECTED OUTCOME**: Все тесты ПРОХОДЯТ (подтверждают отсутствие регрессий)
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4. Checkpoint — Убедиться, что все тесты проходят
  - Запустить `npm run test -- src/test/login-page.test.tsx` (или полный `npm run test`, флаг `--run` уже задан в скрипте `test`)
  - Убедиться, что весь набор тестов зелёный; при вопросах — уточнить у пользователя
  - Запустить `npm run type-check` и `npm run lint` для файла `src/app/login/page.tsx`, чтобы убедиться в отсутствии регрессий типов/линта
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [ ] 5. Ручная внешняя проверка Callback URL в приложении Yandex OAuth (НЕ выполняется агентом)
  - **MANUAL / EXTERNAL STEP — не может быть выполнен из кода или автоматизированными инструментами кодовой базы**
  - Зайти в личный кабинет разработчика на `oauth.yandex.ru`, открыть настройки приложения, соответствующего `YANDEX_CLIENT_ID` из `.env.local`
  - Проверить, что поле «Callback URL» (Redirect URI) установлено ровно в значение `https://zvuchi-vocal.ru/api/auth/callback/yandex` (равно `${NEXTAUTH_URL}` + `/api/auth/callback/yandex`)
  - При несовпадении (другой домен, отсутствие пути, `http` вместо `https`, лишний слэш) — обновить значение и сохранить настройки приложения
  - После деплоя кодового фикса (задача 3) и подтверждения/обновления Callback URL — вручную кликнуть «Войти через Yandex» в продакшене и убедиться, что происходит переход на страницу авторизации Yandex и после подтверждения — возврат в приложение на `/profile` с активной сессией, без ошибки `400`
  - Эта задача документируется как явный шаг ручной проверки и должна быть выполнена человеком с доступом к личному кабинету на oauth.yandex.ru; статус чекбокса отмечается вручную после выполнения
  - _Requirements: 2.2, 2.3_
