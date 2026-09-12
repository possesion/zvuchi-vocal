# Requirements Document

## Introduction

Функция синхронизирует номер телефона и URL аватара из профиля OAuth-провайдера (Google, Yandex) с записью пользователя в базе данных при входе через OAuth. Заполнение происходит только для пустых полей (`phone`, `avatarUrl`), существующие значения никогда не перезаписываются. Если телефон заполняется из OAuth-профиля, поле `phoneVerified` автоматически устанавливается в `true`. Аватар отображается в профиле пользователя рядом с именем и телефоном. Функция затрагивает модель данных `User` (новое поле аватара), слой доступа к данным (`db-prisma.ts`), конфигурацию NextAuth (`auth.ts`, `auth.config.ts`) и страницу профиля.

## Glossary

- **OAuth_Sync_Service**: логика в JWT callback (`src/auth.ts`), выполняющая извлечение телефона и аватара из профиля OAuth-провайдера и их условное сохранение в БД.
- **OAuth_Provider**: внешний провайдер аутентификации — Google или Yandex.
- **Provider_Profile**: объект профиля, возвращаемый OAuth-провайдером при аутентификации (включает `profile` и/или `account` данные, доступные в `signIn`/`jwt` callback NextAuth).
- **User_Record**: запись пользователя в таблице `User` базы данных (Prisma model `User`).
- **Avatar_Url**: новое поле `avatarUrl` модели `User`, содержащее URL изображения аватара пользователя.
- **Phone_Field**: поле `phone` модели `User`.
- **Manual_Profile_Update_Action**: существующий Server Action `updateUserProfile` в `src/app/actions/profile.ts`, используемый для ручного редактирования профиля пользователем.
- **Profile_Page**: страница `src/app/profile/page.tsx`, отображающая раздел «Основная информация».
- **Credentials_Sign_In**: вход пользователя по email и паролю через провайдер Credentials.

## Requirements

### Requirement 1: Расширение Yandex OAuth-провайдера для получения телефона и аватара

**User Story:** Как владелец продукта, я хочу получать номер телефона и аватар пользователя из его профиля Yandex при входе через Yandex, чтобы сократить количество полей, которые пользователь должен заполнять вручную.

#### Acceptance Criteria

1. THE OAuth_Sync_Service SHALL запрашивать у Yandex OAuth_Provider дополнительный scope `login:phone` в дополнение к существующим scope `login:info`, `login:email`, `login:avatar`.
2. WHEN Yandex OAuth_Provider возвращает Provider_Profile с непустым полем `default_phone.number` и у пользователя на момент входа отсутствует ранее сохранённый номер телефона, THE OAuth_Sync_Service SHALL сохранить значение этого поля, нормализованное к формату без символа `+` и содержащее только цифры, как номер телефона пользователя и установить `phoneVerified = true`.
3. WHEN Yandex OAuth_Provider возвращает Provider_Profile с непустым полем `default_avatar_id` И поле Avatar_Url текущей User_Record пусто (`null` или пустая строка), THE OAuth_Sync_Service SHALL построить URL аватара на основе `default_avatar_id` по формату Yandex Avatars API и сохранить построенный URL как Avatar_Url пользователя.
4. IF Yandex OAuth_Provider возвращает Provider_Profile без поля `default_phone.number` или с пустым значением этого поля, THEN THE OAuth_Sync_Service SHALL продолжить обработку входа, оставив ранее сохранённый номер телефона пользователя (если он был сохранён) без изменений.
5. IF Yandex OAuth_Provider возвращает Provider_Profile без поля `default_avatar_id` или с пустым значением этого поля, THEN THE OAuth_Sync_Service SHALL продолжить обработку входа, оставив ранее сохранённое значение Avatar_Url пользователя (если оно было сохранено) без изменений.
6. IF Yandex OAuth_Provider возвращает Provider_Profile с непустым полем `default_phone.number`, но у пользователя на момент входа уже сохранён номер телефона, THEN THE OAuth_Sync_Service SHALL сохранить ранее сохранённый номер телефона пользователя без изменений и не устанавливать `phoneVerified` на основании данных Yandex OAuth_Provider.
7. IF Yandex OAuth_Provider возвращает Provider_Profile с непустым полем `default_avatar_id`, но у пользователя на момент входа уже сохранено значение Avatar_Url, THEN THE OAuth_Sync_Service SHALL сохранить ранее сохранённое значение Avatar_Url без изменений.

### Requirement 2: Расширение Google OAuth-провайдера для попытки получения телефона и аватара

**User Story:** Как владелец продукта, я хочу попытаться получить номер телефона и аватар пользователя из его профиля Google при входе через Google, чтобы сократить количество полей, которые пользователь должен заполнять вручную, при этом понимая, что телефон может быть недоступен без верификации приложения в Google Cloud Console.

#### Acceptance Criteria

1. THE OAuth_Sync_Service SHALL добавлять scope `https://www.googleapis.com/auth/user.phonenumbers.read` в параметры авторизации Google OAuth_Provider в дополнение к существующим scope.
2. WHEN Google OAuth_Provider (Google People API) возвращает Provider_Profile с одним или несколькими номерами телефона, THE OAuth_Sync_Service SHALL интерпретировать первый (основной) номер телефона в списке как номер телефона пользователя.
3. IF Google OAuth_Provider возвращает Provider_Profile без номера телефона, ИЛИ запрос к Google People API завершается ошибкой, ИЛИ доступ к данным телефона отклонён (например, из-за отсутствия верификации приложения в Google Cloud Console), THEN THE OAuth_Sync_Service SHALL продолжить обработку входа без номера телефона, не считая это ошибкой.
4. WHEN Google OAuth_Provider возвращает Provider_Profile с непустым полем `picture`, THE OAuth_Sync_Service SHALL интерпретировать значение поля `picture` как Avatar_Url пользователя.
5. IF Google OAuth_Provider возвращает Provider_Profile без поля `picture` или с пустым значением этого поля, THEN THE OAuth_Sync_Service SHALL продолжить обработку входа без Avatar_Url.

### Requirement 3: Условное заполнение телефона и аватара (только если поле пусто)

**User Story:** Как пользователь, я хочу, чтобы автоматическое заполнение из OAuth-профиля никогда не перезатирало номер телефона или аватар, которые я уже указал вручную, чтобы не потерять мои данные.

#### Acceptance Criteria

1. WHEN OAuth_Sync_Service получает номер телефона из Provider_Profile И Phone_Field текущей User_Record равен `null` или пустой строке, THE OAuth_Sync_Service SHALL сохранить полученный номер телефона в Phone_Field этой User_Record.
2. IF OAuth_Sync_Service получает номер телефона из Provider_Profile И Phone_Field текущей User_Record уже содержит непустое значение, THEN THE OAuth_Sync_Service SHALL оставить существующее значение Phone_Field и текущее значение `phoneVerified` этой User_Record без изменений.
3. WHEN OAuth_Sync_Service получает Avatar_Url из Provider_Profile И поле Avatar_Url текущей User_Record равно `null` или пустой строке, THE OAuth_Sync_Service SHALL сохранить полученный Avatar_Url в этой User_Record.
4. IF OAuth_Sync_Service получает Avatar_Url из Provider_Profile И поле Avatar_Url текущей User_Record уже содержит непустое значение, THEN THE OAuth_Sync_Service SHALL оставить существующее значение Avatar_Url без изменений.
5. WHEN OAuth_Sync_Service сохраняет номер телефона в Phone_Field User_Record по причине, что это поле было пустым (согласно Acceptance Criterion 3.1), THE OAuth_Sync_Service SHALL установить значение `phoneVerified` этой User_Record в `true`.
6. IF Provider_Profile не содержит номера телефона (поле отсутствует или пусто), THEN THE OAuth_Sync_Service SHALL оставить текущее значение Phone_Field и `phoneVerified` User_Record без изменений.
7. IF Provider_Profile не содержит Avatar_Url (поле отсутствует или пусто), THEN THE OAuth_Sync_Service SHALL оставить текущее значение Avatar_Url User_Record без изменений.

### Requirement 4: Модель данных и слой доступа к данным для аватара

**User Story:** Как разработчик, я хочу, чтобы модель `User` и функции доступа к данным поддерживали поле аватара, чтобы аватар можно было сохранять и читать так же надёжно, как остальные поля пользователя.

#### Acceptance Criteria

1. THE User_Record SHALL содержать необязательное (nullable) поле `avatarUrl` типа строка с максимальной длиной 2048 символов и значением по умолчанию `null`, добавленное через новую миграцию Prisma.
2. THE AppUser interface в `src/lib/types.ts` SHALL включать поле `avatarUrl: string | null`.
3. THE UserUpdateData type в `src/lib/types.ts` SHALL включать `avatarUrl` как допустимое для частичного обновления поле.
4. WHEN функция `createUser` в `src/lib/db-prisma.ts` вызывается с непустым значением параметра `avatarUrl`, THE db-prisma module SHALL сохранить переданное значение в поле `avatarUrl` создаваемой User_Record и включить сохранённое значение в возвращаемый объект AppUser.
5. IF функция `createUser` в `src/lib/db-prisma.ts` вызывается без параметра `avatarUrl` или с параметром `avatarUrl`, равным `null`, THEN THE db-prisma module SHALL сохранить значение `null` в поле `avatarUrl` создаваемой User_Record.
6. WHEN функция `updateUser` в `src/lib/db-prisma.ts` вызывается с объектом обновления, содержащим ключ `avatarUrl` со значением строки или `null`, THE db-prisma module SHALL обновить поле `avatarUrl` соответствующей User_Record на переданное значение, включая очистку поля при передаче `null`.
7. IF функция `updateUser` в `src/lib/db-prisma.ts` вызывается с объектом обновления, не содержащим ключ `avatarUrl`, THEN THE db-prisma module SHALL оставить текущее значение поля `avatarUrl` соответствующей User_Record без изменений.
8. WHEN функции `getUserByEmail`, `getUserById`, `getAllUsers`, `getUserByVerificationToken`, `getUserByResetToken` в `src/lib/db-prisma.ts` возвращают AppUser, THE db-prisma module SHALL включать в результат текущее значение поля `avatarUrl`, включая значение `null`, если аватар не задан.

### Requirement 5: Прохождение аватара через NextAuth JWT и Session

**User Story:** Как разработчик, я хочу, чтобы аватар пользователя корректно передавался через JWT-токен и объект сессии NextAuth для OAuth- и credentials-пользователей, чтобы страницы могли отображать актуальный аватар без дополнительных запросов к БД.

#### Acceptance Criteria

1. THE NextAuth type augmentation в `src/auth.config.ts` SHALL определять поле `image?: string | null` в интерфейсах `Session.user` и `User`.
2. WHEN JWT callback в `src/auth.ts` обрабатывает вход через Google или Yandex OAuth_Provider, THE OAuth_Sync_Service SHALL записать итоговое значение Avatar_Url User_Record (полученное после применения правил Requirement 3 к текущему входу) в поле `token.image`.
3. IF итоговое значение Avatar_Url User_Record (после применения правил Requirement 3 к текущему входу через Google или Yandex OAuth_Provider) равно `null` или пустой строке, THEN THE OAuth_Sync_Service SHALL записать значение `null` в поле `token.image`.
4. WHEN JWT callback в `src/auth.ts` обрабатывает вход через Credentials_Sign_In И значение поля `image` объекта `user` (равное значению Avatar_Url аутентифицированной User_Record) непусто, THE JWT callback SHALL записать это значение в поле `token.image`.
5. IF JWT callback в `src/auth.ts` обрабатывает вход через Credentials_Sign_In И значение поля `image` объекта `user` пусто, отсутствует или равно `null`, THEN THE JWT callback SHALL записать значение `null` в поле `token.image`.
6. WHEN session callback в `src/auth.config.ts` формирует объект сессии, THE session callback SHALL скопировать значение `token.image` в поле `session.user.image`, приводя значение `undefined` к `null`.

### Requirement 6: Отсутствие влияния на ручное редактирование профиля

**User Story:** Как пользователь, я хочу, чтобы ручное изменение номера телефона в форме профиля продолжало сбрасывать флаг верификации телефона так же, как и раньше, чтобы автоматическая OAuth-синхронизация не ослабляла существующую защиту от подмены номера.

#### Acceptance Criteria

1. WHEN пользователь через Manual_Profile_Update_Action указывает значение номера телефона, отличное от текущего сохранённого значения Phone_Field этой User_Record, THE Manual_Profile_Update_Action SHALL установить `phoneVerified` в `false`, `phoneVerifyCode` в `null` и `phoneCodeExpires` в `null` для этой User_Record, независимо от того, было ли текущее значение `phoneVerified` установлено в `true` OAuth_Sync_Service согласно Requirement 3.
2. WHEN пользователь через Manual_Profile_Update_Action указывает значение номера телефона, равное текущему сохранённому значению Phone_Field этой User_Record, THE Manual_Profile_Update_Action SHALL оставить значения `phoneVerified`, `phoneVerifyCode` и `phoneCodeExpires` этой User_Record без изменений.

### Requirement 7: Отображение аватара на странице профиля

**User Story:** Как пользователь, я хочу видеть свой аватар в разделе «Основная информация» страницы профиля, чтобы визуально идентифицировать свой аккаунт.

#### Acceptance Criteria

1. IF значение `avatarUrl` текущего пользователя не равно `null` и не является пустой строкой, THEN THE Profile_Page SHALL отобразить в разделе «Основная информация» изображение аватара круглой формы размером 40×40 пикселей, расположенное непосредственно перед именем пользователя в одной строке с ним, с непустым атрибутом `alt`.
2. IF значение `avatarUrl` текущего пользователя равно `null` или является пустой строкой, THEN THE Profile_Page SHALL отображать раздел «Основная информация» без изображения аватара.
3. THE Profile_Page SHALL отображать изображение аватара внутри существующего блока «Основная информация», без создания отдельного раздела страницы.
4. IF изображение аватара по значению `avatarUrl` не удаётся загрузить (ошибка загрузки), THEN THE Profile_Page SHALL отображать раздел «Основная информация» без изображения аватара, без отображения ошибки пользователю.

### Requirement 8: Отсутствие влияния на Credentials-вход

**User Story:** Как разработчик, я хочу, чтобы вход по email и паролю не запускал логику OAuth-синхронизации телефона и аватара, чтобы поведение Credentials-пользователей оставалось предсказуемым.

#### Acceptance Criteria

1. WHEN пользователь успешно завершает вход методом Credentials_Sign_In (аутентификация по email и паролю подтверждена), THE OAuth_Sync_Service SHALL не запускаться для этого входа.
2. IF OAuth_Sync_Service не запускается вследствие входа методом Credentials_Sign_In, THEN THE System SHALL оставить текущие значения Phone_Field и Avatar_Url учётной записи пользователя без изменений.
3. THE OAuth_Sync_Service SHALL запускаться исключительно при входе через провайдер Google или через провайдер Yandex и SHALL не запускаться при входе любым иным способом аутентификации, включая Credentials_Sign_In.
