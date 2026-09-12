# Bugfix Requirements Document

## Introduction

При нажатии кнопки «Войти через Yandex» на странице входа (`src/app/login/page.tsx`) OAuth-авторизация через Yandex не запускается: вместо перехода на страницу авторизации Yandex пользователь видит ошибку `400 redirect_uri не совпадает с Callback URL, указанным при регистрации приложения`. Функция `handleYandexSignIn` вызывает `signIn('yandex', { redirect_uri: 'https://zvuchi-vocal.ru' })`, где `redirect_uri` не является поддерживаемым параметром клиентского `signIn()` в NextAuth.js — Auth.js всегда вычисляет фактический `redirect_uri`, отправляемый провайдеру, самостоятельно как `${NEXTAUTH_URL или host запроса}/api/auth/callback/yandex`, независимо от переданного значения. Реальная причина ошибки — несовпадение между тем, что Auth.js фактически отправляет Yandex, и Callback URL, зарегистрированным для приложения на oauth.yandex.ru. Это блокирует вход через Yandex для всех пользователей.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN пользователь нажимает «Войти через Yandex» на `/login` THEN система вызывает `signIn('yandex', { redirect_uri: 'https://zvuchi-vocal.ru' })` с параметром `redirect_uri`, который не поддерживается клиентским API `signIn()` и не влияет на фактический `redirect_uri`, отправляемый провайдеру Yandex

1.2 WHEN Auth.js инициирует OAuth-запрос к Yandex THEN фактически вычисленный `redirect_uri` (на основе `NEXTAUTH_URL`/хоста запроса + `/api/auth/callback/yandex`) не совпадает с Callback URL, зарегистрированным в настройках приложения на oauth.yandex.ru, из-за чего Yandex возвращает ошибку `400 redirect_uri не совпадает с Callback URL, указанным при регистрации приложения`

1.3 WHEN происходит ошибка `400` от Yandex THEN пользователь остаётся без входа в систему и не получает понятного объяснения причины на странице `/login`

### Expected Behavior (Correct)

2.1 WHEN пользователь нажимает «Войти через Yandex» на `/login` THEN система SHALL вызывать `signIn('yandex', ...)` без несуществующего/неэффективного клиентского параметра `redirect_uri`, используя вместо этого поддерживаемые параметры NextAuth (например, `callbackUrl`), аналогично `handleGoogleSignIn`

2.2 WHEN Auth.js инициирует OAuth-запрос к Yandex THEN фактический `redirect_uri`, вычисляемый Auth.js (`${NEXTAUTH_URL}/api/auth/callback/yandex`), SHALL точно совпадать с Callback URL, зарегистрированным в настройках Yandex OAuth-приложения (YANDEX_CLIENT_ID) на oauth.yandex.ru

2.3 WHEN redirect_uri корректно совпадает THEN пользователь SHALL успешно перенаправляться на страницу авторизации Yandex и после подтверждения — обратно в приложение с активной сессией

### Unchanged Behavior (Regression Prevention)

3.1 WHEN пользователь нажимает «Войти через Google» THEN система SHALL CONTINUE TO выполнять вход через Google без изменений в поведении `handleGoogleSignIn`

3.2 WHEN пользователь входит через email/пароль (Credentials) THEN система SHALL CONTINUE TO проходить процесс входа без изменений

3.3 WHEN другие части приложения используют `NEXTAUTH_URL` и `trustHost: true` (например, для формирования абсолютных ссылок или редиректов middleware) THEN система SHALL CONTINUE TO вести себя так же, как до исправления
