# Implementation Plan: contest-voting

## Overview

Перевод голосования конкурса вокальной школы с файлового хранилища (`data/contest-votes.json`) и cookie `hasVoted` на модель данных PostgreSQL через Prisma (`Contestant`, `ContestVote`), привязка голоса к сессии NextAuth, добавление inline CRUD участников для `Admin_User` на `/contest`, загрузка фото в S3 под префиксом `contestant/`, и удаление legacy-кода. Реализация на TypeScript (Next.js 14 App Router, Prisma, Vitest, fast-check), по существующим паттернам проекта (`instructors`, `news`).

## Tasks

- [ ] 1. Расширить Prisma-схему моделями Contestant и ContestVote
  - Добавить в `prisma/schema.prisma` модель `Contestant` (id, name, song, originalArtist, photoUrl с `@default("")`, relation `votes ContestVote[]`, `@@index([id])`)
  - Добавить модель `ContestVote` (id, userId, contestantId, createdAt, updatedAt с `@updatedAt`, relations `user`/`contestant` с `onDelete: Cascade`, `@@unique([userId])`, `@@index([contestantId])`)
  - Дополнить модель `User` обратной связью `contestVotes ContestVote[]`
  - Сгенерировать миграцию `npx prisma migrate dev --name add_contest_voting` (создаёт таблицы пустыми, без переноса legacy-данных — Requirement 1.2) и выполнить `prisma generate`
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

- [ ] 2. Добавить доменные типы контеста
  - В `src/lib/types.ts` добавить интерфейсы `Contestant`, `ContestResult extends Contestant { votes: number }`, `ContestVoteStatus { hasVoted: boolean; contestantId: number | null }`
  - _Requirements: 1.4_

- [ ] 3. Добавить префикс S3 для фото участников
  - В `src/lib/s3.ts` добавить `contestant: 'contestant/'` в объект `S3Prefix`, без изменения сигнатур `uploadImage`/`deleteImage`/`listImages`
  - _Requirements: 6.4_

- [ ] 4. Реализовать функции доступа к данным Contestant и ContestVote
  - [ ] 4.1 Реализовать CRUD-функции для Contestant в `src/lib/db-prisma.ts`
    - `getAllContestants()` — сортировка по `id` возрастанию
    - `getContestantById(id)` — возврат `undefined` при отсутствии записи
    - `createContestant(data)` — возврат созданного объекта
    - `updateContestant(data)` — обновление по `id`
    - `deleteContestant(id)` — удаление по `id`
    - _Requirements: 1.3_

  - [ ]* 4.2 Написать property-тест для Property 1 и Property 3
    - **Property 1: Согласованность списка участников через доступ к данным**
    - **Property 3: Мутации над несуществующим идентификатором не изменяют данные**
    - **Validates: Requirements 1.3, 1.6, 7.7**
    - Файл `src/lib/db-prisma.contest.test.ts`, генерация случайных наборов Contestant/id через `fast-check`, проверка сортировки `getAllContestants`, `undefined` для отсутствующих id, отсутствие изменений при update/delete несуществующего id

  - [ ] 4.3 Реализовать функции результатов и голосов в `src/lib/db-prisma.ts`
    - `getContestResults()` — агрегация `_count.votes` через `findMany({ include: { _count: { select: { votes: true } } } })`, включая участников с 0 голосов
    - `getVoteStatusByUserId(userId)` — возврат `{ hasVoted, contestantId }`
    - `upsertContestVote(userId, contestantId)` — `upsert` по `userId`, возврат `{ created: boolean }`
    - _Requirements: 2.1, 4.1_

  - [ ]* 4.4 Написать property-тест для Property 4 и Property 8
    - **Property 4: Каскадное удаление связанных голосов**
    - **Property 8: Корректная агрегация результатов голосования**
    - **Validates: Requirements 2.3, 2.4, 4.1, 4.2, 4.3, 4.5, 7.5**
    - Файл `src/lib/db-prisma.contest.test.ts`, генерация случайного графа Contestant/User/ContestVote, проверка каскадного удаления и сравнение агрегации `getContestResults` с эталонным подсчётом в памяти, включая пустой список Contestant без ошибки

- [ ] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Реализовать общую валидацию текстовых полей участника
  - [ ] 6.1 Создать `src/lib/contest-validation.ts`
    - `validateContestantFields(input: unknown)` — trim имени/песни/исполнителя, проверка непустоты и максимальной длины (200/300/200), возврат `ContestantValidationResult` (`{ valid: true; data }` | `{ valid: false; error }`)
    - _Requirements: 1.5, 6.3, 6.5, 6.7_

  - [ ]* 6.2 Написать unit и property-тест для Property 2
    - **Property 2: Валидация обязательных текстовых полей при создании и обновлении**
    - **Validates: Requirements 1.5, 6.3, 6.5, 6.7**
    - Файл `src/lib/contest-validation.test.ts` — примеры: валидные значения, пустая строка/строка из пробелов, граница длины (200/300 ровно проходит, +1 отклоняется); property-часть на `fast-check` — генерация случайных строк с пробелами по краям и случайной длины, проверка `valid ⇔ (trim непусто ∧ длина ≤ max)` для всех трёх полей

- [ ] 7. Реализовать API-роут результатов голосования
  - [ ] 7.1 Создать `src/app/api/v1/contest/route.ts`
    - `GET` — вызов `getContestResults()`, возврат `ApiResponse<ContestResult[]>`, `try/catch` → 500 при ошибке без изменения ContestVote
    - Логирование ошибки агрегации через `console.error('[Contest] ...', error)` в catch-блоке, по разделу "Logging" в design.md
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 7.2 Написать unit-тест для роута результатов
    - Пример: успешный список (включая участника с 0 голосов), пример ошибки БД → 500, пример пустого списка Contestant → пустой массив без ошибки
    - Пример: ошибка БД → проверка вызова `console.error('[Contest] ...')` через `vi.spyOn(console, 'error')`
    - _Requirements: 4.3, 4.5_

- [ ] 8. Реализовать API-роут голосования
  - [ ] 8.1 Создать `src/app/api/v1/contest/vote/route.ts`
    - `GET` — без сессии возвращает `{ hasVoted: false, contestantId: null }`; с сессией — `getVoteStatusByUserId`
    - `POST` — 401 без сессии; валидация `contestantId` (положительное целое) → 400 при невалидности; 404 при отсутствующем Contestant; `upsertContestVote` → 201 при создании, 200 при обновлении/повторе; `revalidatePath('/contest')` и `revalidatePath('/contest/result')`
    - Логирование успешного сохранения голоса через `console.log('[Contest] ...')` после `upsertContestVote`, по разделу "Logging" в design.md
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 8.2 Написать property-тест для Property 5 и Property 6
    - **Property 5: Ровно один голос на пользователя, отражающий последний выбор**
    - **Property 6: Неавторизованное или невалидное голосование не создаёт и не изменяет голос**
    - **Validates: Requirements 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
    - Файл `src/app/api/v1/contest/vote/route.test.ts` — мок `auth()` и функций `db-prisma`; property-генерация случайных последовательностей запросов голосования одного пользователя за существующих/несуществующих участников, проверка ровно одной записи ContestVote и статусов 201/200; отдельные property-кейсы для запроса без сессии, `contestantId` не positive-int, несуществующего `contestantId`

  - [ ]* 8.3 Написать property-тест и unit-тест для Property 7
    - **Property 7: Статус голосования точно отражает состояние базы данных**
    - **Validates: Requirements 3.7**
    - В том же файле `src/app/api/v1/contest/vote/route.test.ts` — property-генерация случайного состояния ContestVote и наличия/отсутствия сессии, проверка эквивалентности статуса; unit-примеры: `contestantId: 0`, `contestantId: 'abc'` → 400
    - Unit-пример: успешное голосование → проверка вызова `console.log('[Contest] ...')` через `vi.spyOn(console, 'log')`

- [ ] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Реализовать API-роут создания участников
  - [ ] 10.1 Создать `src/app/api/v1/contest/contestants/route.ts`
    - `POST` — 403 если `!canEdit(session?.user?.role)`; валидация через `validateContestantFields`; `createContestant` с `photoUrl: ''`; `revalidatePath('/contest')`; 201 при успехе
    - Логирование успешного создания участника через `console.log('[Contest] ...', created.id)`, по разделу "Logging" в design.md
    - _Requirements: 1.1, 1.5, 6.3, 6.6_

  - [ ]* 10.2 Написать unit-тест для роута создания участников
    - Пример: успешное создание (201); пример без `canEdit` → 403; пример невалидных полей → 400, запись не создаётся
    - Пример: успешное создание → проверка вызова `console.log('[Contest] ...', created.id)` через `vi.spyOn(console, 'log')`
    - _Requirements: 6.6, 6.7_

- [ ] 11. Реализовать API-роут обновления и удаления участника
  - [ ] 11.1 Создать `src/app/api/v1/contest/contestants/[id]/route.ts` — метод PUT
    - 403 если `!canEdit`; 404 если Contestant не найден; валидация через `validateContestantFields`; `updateContestant`; `revalidatePath` для `/contest` и `/contest/result`
    - Логирование успешного обновления участника через `console.log('[Contest] ...', updated.id)`, по разделу "Logging" в design.md
    - _Requirements: 1.6, 6.5, 6.6, 6.7_

  - [ ] 11.2 Реализовать метод DELETE в том же файле
    - 403 если `!isAdmin`; 404 если Contestant не найден; при непустом `photoUrl` — удаление файла через `deleteImage(fileName, S3Prefix.contestant)` до удаления записи; ошибка удаления файла (не "не найден") → 502, запись не удаляется; при пустом `photoUrl` — удаление записи без обращения к S3; `deleteContestant` каскадно удаляет ContestVote; `revalidatePath` для обеих страниц
    - Логирование ошибки удаления файла фото через `console.error('[Contest] ...', error)` перед возвратом 502, и логирование успешного удаления участника через `console.log('[Contest] ...', id)`, по разделу "Logging" в design.md
    - _Requirements: 1.6, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 11.3 Написать property-тест для Property 10 и Property 13
    - **Property 10: Авторизация мутаций участников соответствует роли пользователя**
    - **Property 13: Порядок и обработка ошибок при удалении участника с фото**
    - **Validates: Requirements 6.6, 7.2, 7.3, 7.4, 7.6**
    - Файл `src/app/api/v1/contest/contestants/[id]/route.test.ts` — property-генерация случайных ролей пользователя для PUT/DELETE, проверка `canEdit`/`isAdmin` эквивалентности выполнения операции; property-генерация случайного исхода мока `deleteImage` (успех/файл не найден/ошибка) для Contestant со случайным `photoUrl` (пустой/непустой), проверка порядка удаления и итогового состояния записи

  - [ ]* 11.4 Написать unit-тест для граничных случаев роута
    - Пример: DELETE с ошибкой S3 не равной "не найдено" (мок `deleteImage` бросает исключение) → 502, запись не удалена; пример PUT/DELETE с несуществующим id → 404, данные не изменяются
    - Пример: DELETE с ошибкой S3 → проверка вызова `console.error('[Contest] ...', error)` через `vi.spyOn(console, 'error')` перед ответом 502
    - _Requirements: 1.6, 7.6, 7.7_

- [ ] 12. Реализовать API-роут загрузки фото участника
  - [ ] 12.1 Создать `src/app/api/v1/contest/contestants/[id]/photo/route.ts`
    - `POST` — 403 если `!canEdit`; 404 если Contestant не найден; валидация MIME (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) и размера (≤5MB) до обращения к S3 — 400 при нарушении без изменения `photoUrl`; при валидном файле — удаление старого фото через `deleteImage` (если `photoUrl` был непустым), загрузка нового через `uploadImage` с префиксом `S3Prefix.contestant`, `updateContestant` с новым `photoUrl`, `revalidatePath` для обеих страниц
    - Логирование ошибки удаления старого фото через `console.error('[Contest] ...', error)` (без прерывания загрузки нового) и логирование успешного обновления фото через `console.log('[Contest] ...', id)`, по разделу "Logging" в design.md
    - _Requirements: 6.4, 6.8_

  - [ ]* 12.2 Написать property-тест для Property 12
    - **Property 12: Загрузка фото условна по MIME-типу и размеру, со сменой файла**
    - **Validates: Requirements 6.4, 6.8**
    - Файл `src/app/api/v1/contest/contestants/[id]/photo/route.test.ts` — property-генерация случайных MIME-типов из объединения допустимых/недопустимых множеств и случайных размеров файла вокруг границы 5MB, проверка `успех ⇔ (MIME допустим ∧ размер ≤ 5MB)` и что `photoUrl`/старый файл не меняются при отклонении

  - [ ]* 12.3 Написать unit-тест для граничных случаев загрузки фото
    - Пример: недопустимый MIME (`application/pdf`) → 400; пример файла 6MB → 400; пример успешной замены существующего фото — проверка вызова `deleteImage` для старого файла
    - Пример: успешная загрузка фото → проверка вызова `console.log('[Contest] ...', id)` через `vi.spyOn(console, 'log')`
    - _Requirements: 6.4, 6.8_

- [ ] 13. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Добавить схему валидации формы участника и расширить проверку ролей
  - [ ] 14.1 Добавить `ContestantSchema` в `src/lib/definitions.ts`
    - По паттерну `NewsSchema`: поля `name` (required, trim, max 200), `song` (required, trim, max 300), `originalArtist` (required, trim, max 200); экспорт типа `ContestantForm = yup.InferType<typeof ContestantSchema>`
    - _Requirements: 6.3, 6.5, 6.7_

  - [ ]* 14.2 Написать property-тест для Property 11 (видимость админ-контролов)
    - **Property 11: Видимость административных элементов управления соответствует роли**
    - **Validates: Requirements 6.1, 6.2, 7.1**
    - Файл `src/lib/roles.test.ts` — property-генерация случайной роли (`admin`/`manager`/`client`/`undefined`/`null`), проверка `isAdmin`/`canEdit` эквивалентности для всех значений `UserRole`; используется как основа для последующего теста рендера `ContestPage`

- [ ] 15. Реализовать компонент ContestantAdminForm
  - [ ] 15.1 Создать `src/components/contest/contestant-admin-form.tsx`
    - `'use client'`, `ContestantAdminFormProps { contestant?: Contestant; onSaved: () => void; onCancel?: () => void }`
    - `react-hook-form` + `yupResolver(ContestantSchema)`, по паттерну `news-add-form.tsx`: поля `name`/`song`/`originalArtist`, опциональный файл фото (`input[type=file]`, превью через `URL.createObjectURL`)
    - `onSubmit`: JSON `POST /api/v1/contest/contestants` (создание) или `PUT /api/v1/contest/contestants/[id]` (редактирование, если передан `contestant`), затем при наличии файла — `FormData POST /api/v1/contest/contestants/[id]/photo`
    - Вызов `onSaved()` после успешного сохранения
    - Оба fetch-вызова (JSON и FormData) оборачиваются в try/catch; сетевая ошибка или `!response.ok` логируются через `console.error('[Contest] ...', error)`, по разделу "Logging" в design.md
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

  - [ ]* 15.2 Написать unit-тест для ContestantAdminForm
    - Пример: отправка с пустым полем показывает ошибку валидации и не вызывает `fetch`; пример успешного создания вызывает `POST /api/v1/contest/contestants` с корректным телом; пример редактирования вызывает `PUT` с id существующего `contestant`
    - _Requirements: 6.3, 6.5_

- [ ] 16. Интегрировать данные и роль в ContestPage без изменения верстки карточек
  - [ ] 16.1 Обновить `src/app/contest/page.tsx` — источник данных и определение роли
    - Заменить локальный интерфейс `Contestant` на импорт типов `ContestResult`, `ContestVoteStatus` из `@/lib/types`
    - `fetchResults` → `GET /api/v1/contest`, маппинг `photoUrl` вместо `photo` без изменения JSX-структуры карточки
    - `checkVotingStatus` → `GET /api/v1/contest/vote`, использование `contestantId` для подсветки выбранного варианта
    - `handleVote` → `POST /api/v1/contest/vote` с телом `{ contestantId }`
    - Добавить `useSession()` из `next-auth/react` для определения `isAdmin`
    - Обернуть `fetchResults`, `checkVotingStatus` и `handleVote` в try/catch; сетевая ошибка или неуспешный ответ логируются через `console.error('[Contest] ...', error)`, по разделу "Logging" в design.md
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 4.1, 4.2, 8.1, 8.2_

  - [ ] 16.2 Добавить admin-элементы управления и форму в ContestPage
    - Внутрь существующего контейнера карточки участника (рядом с кнопкой "Голосовать", в отдельном `<div>`, без изменения порядка фото/имя/песня/прогресс) добавить кнопки "Редактировать"/"Удалить", видимые только при `isAdmin`
    - Клик "Редактировать" — inline-рендер `ContestantAdminForm` с `contestant` prop (состояние `editingId`)
    - Клик "Удалить" — диалог подтверждения (паттерн `deleteTarget` state + модальное окно "Отмена"/"Удалить", как в `users-table.tsx`) перед `DELETE /api/v1/contest/contestants/[id]`
    - Рендер `ContestantAdminForm` без `contestant` prop как отдельный блок перед `<div className="space-y-4">` (списком карточек), видимый только при `isAdmin`
    - Fetch-вызов удаления участника со страницы (DELETE) оборачивается в try/catch с логированием сетевой ошибки через `console.error('[Contest] ...', error)`, по разделу "Logging" в design.md
    - _Requirements: 6.1, 6.2, 6.6, 7.1, 7.2, 7.4, 7.8, 8.4, 8.5_

  - [ ]* 16.3 Написать snapshot/example-тест структуры карточки ContestPage
    - Файл `src/app/contest/contest-page-layout.test.tsx` — пример: структура карточки участника (порядок фото/имя/песня/кнопка/прогресс) не изменилась относительно текущей верстки; пример: `ContestantAdminForm` и кнопки редактирования/удаления отсутствуют в DOM при роли `client`, присутствуют при роли `admin`
    - _Requirements: 6.1, 6.2, 8.1, 8.4, 8.5_

- [ ] 17. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Обновить ContestResultPage: источник данных и множественные победители
  - [ ] 18.1 Вынести определение победителей в `src/app/contest/result/utils.ts`
    - Функция `getWinners(results: ContestResult[]): ContestResult[]` — `maxVotes = Math.max(...votes)` (0 при пустом списке), возврат всех участников с `votes === maxVotes` при `maxVotes > 0`, иначе пустой массив
    - _Requirements: 4.4_

  - [ ]* 18.2 Написать property-тест для Property 9
    - **Property 9: Все участники с максимальным количеством голосов отмечаются как лидеры**
    - **Validates: Requirements 4.4**
    - Файл `src/app/contest/result/utils.test.ts` — property-генерация случайного распределения голосов среди участников, проверка что множество возвращённых `getWinners` результатов точно совпадает с множеством участников с максимальным количеством голосов

  - [ ] 18.3 Обновить `src/app/contest/result/page.tsx`
    - `fetchResults` → `GET /api/v1/contest` вместо `/api/contest`, использование типа `ContestResult` из `@/lib/types`
    - Заменить `reduce`-выбор единственного победителя на `getWinners(contestants)` из `utils.ts`; блок "Победитель" рендерится для каждого элемента `winners` (карточка сохраняет состав элементов: иконки кубка, фото, имя в h3, название номера, количество и процент голосов), без изменения диаграммы и блока "Топ-3"
    - `fetchResults` оборачивается в try/catch; сетевая ошибка или неуспешный ответ логируются через `console.error('[Contest] ...', error)`, по разделу "Logging" в design.md
    - _Requirements: 4.4, 8.3_

  - [ ]* 18.4 Написать snapshot/example-тест структуры ContestResultPage
    - Пример: при одном лидере рендерится одна карточка победителя с прежним составом элементов; пример при нескольких лидерах с одинаковым максимумом — несколько карточек победителя, каждая с полным составом элементов; блок "Топ-3" и диаграмма не изменены
    - _Requirements: 4.4, 8.3_

- [ ] 19. Удалить устаревший код хранения голосов
  - [ ] 19.1 Удалить legacy API-роуты и файлы данных
    - Удалить `src/app/api/contest/route.ts`, `src/app/api/contest/check-vote/route.ts`, `src/app/api/contest-reset/route.ts`, `data/contest-votes.json`
    - Убедиться (поиском по кодовой базе), что не остаётся кода с `fs.readFileSync`/`writeFileSync` по пути `contest-votes.json` и работы с cookie `hasVoted` (`cookies().get('hasVoted')`, `response.cookies.set('hasVoted', ...)`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 19.2 Удалить страницу сброса конкурса
    - Удалить `src/app/contest/reset-contest/page.tsx`
    - Проверить, что нет других ссылок/навигации на `/contest/reset-contest` в кодовой базе (кроме уже переписанного `page.tsx`, где ссылки на reset отсутствуют)
    - _Requirements: 5.3_

  - [ ]* 19.3 Написать unit-тест, подтверждающий отсутствие legacy-функционала
    - Тест на уровне файловой системы/интеграции: `data/contest-votes.json` не существует; попытка `GET /api/contest`, `/api/contest/check-vote`, `/api/contest-reset` возвращает 404 (роут не зарегистрирован)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 20. Финальный checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Задачи, отмеченные `*`, опциональны (тесты) и не реализуются автоматически в рамках выполнения текущей задачи-родителя.
- `fast-check` уже присутствует как транзитивная dev-зависимость (`^3.23.1`, разрешается до `3.23.2`) — при написании property-тестов её нужно явно добавить в `devDependencies` package.json с точной версией `3.23.2` перед использованием в тестовых файлах.
- Файлы фото в `/public/contest/*` не удаляются (Requirement 5.5) — задачи очистки их не затрагивают.
- Каждый property-тест должен быть помечен тегом `Feature: contest-voting, Property {number}: {краткое название}` согласно Testing Strategy в design.md.
- Доступ к БД в property-тестах для `db-prisma.contest.test.ts` — через тестовый Prisma-клиент/тестовую схему либо мок слоя, согласно Testing Strategy в design.md; для API-роутов — через мок `auth()` и функций `db-prisma`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2", "3"] },
    { "id": 1, "tasks": ["4.1", "6.1", "14.1", "18.1"] },
    { "id": 2, "tasks": ["4.2", "4.3", "6.2", "14.2", "18.2"] },
    { "id": 3, "tasks": ["4.4", "7.1", "8.1", "10.1", "11.1", "12.1"] },
    { "id": 4, "tasks": ["7.2", "8.2", "8.3", "10.2", "11.2", "12.2", "12.3", "15.1"] },
    { "id": 5, "tasks": ["11.3", "11.4", "15.2", "16.1", "18.3"] },
    { "id": 6, "tasks": ["16.2"] },
    { "id": 7, "tasks": ["16.3", "18.4"] },
    { "id": 8, "tasks": ["19.1"] },
    { "id": 9, "tasks": ["19.2"] },
    { "id": 10, "tasks": ["19.3"] }
  ]
}
```
