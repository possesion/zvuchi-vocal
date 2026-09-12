# Design Document

## Overview

Функция переводит голосование конкурса вокальной школы с файлового хранения (`data/contest-votes.json`) и cookie-защиты (`hasVoted`) на модель данных PostgreSQL через Prisma, привязывая голос к авторизованному пользователю (NextAuth сессия) вместо cookie. Администраторам (`role === 'admin'`) добавляется inline CRUD участников конкурса непосредственно на странице `/contest`, включая загрузку/удаление фото в S3.

Ключевые архитектурные решения:

1. **Две новые таблицы Prisma**: `Contestant` (участники) и `ContestVote` (голоса, один на пользователя, `@@unique([userId])`).
2. **Функции доступа к данным** добавляются в `src/lib/db-prisma.ts` по существующему паттерну (`getPrisma()`, доменные типы из `src/lib/types.ts`).
3. **API-роуты**: новые эндпоинты создаются под версионированным префиксом `/api/v1/contest/*`, а существующие legacy-роуты без версии (`/api/contest`, `/api/contest/check-vote`, `/api/contest-reset`) удаляются. Обоснование версионирования — ниже в разделе "API Versioning Decision".
4. **Верстка страниц `/contest` и `/contest/result` не меняется** — меняется только источник данных (fetch на новые эндпоинты) и точечно добавляются admin-контролы внутрь существующих карточек, согласно Requirement 8.
5. **Фото участников** хранятся в S3 под новым префиксом `S3Prefix.contestant = 'contestant/'`, по паттерну `uploadImage`/`deleteImage`, аналогично `instructorPhotos` и `newsCovers`.

### API Versioning Decision

Текущий (legacy) `contest` функционал использует неверсионированные роуты `/api/contest`, `/api/contest/check-vote`, `/api/contest-reset`. Правило проекта (code-conventions) требует версионирования `/api/v1/...` для всех API-роутов. Поскольку Requirement 5 явно требует удаления legacy-роутов и хардкоженого списка, а не их сохранения, разумно **привести contest к стандарту `/api/v1/contest/*`** одновременно с переводом на БД — отдельного "переходного" неверсионированного слоя создавать не нужно, так как весь клиентский код (`ContestPage`, `ContestResultPage`), обращающийся к этим роутам, переписывается в рамках этой же фичи. Это не нарушает Requirement 8 (верстка не меняется), так как меняется только URL внутри `fetch()`, а не JSX-структура страниц.

Итоговые пути:
- `GET /api/v1/contest` — результаты (список Contestant + агрегированные votes).
- `GET /api/v1/contest/vote` — статус голосования текущего пользователя.
- `POST /api/v1/contest/vote` — отдать/изменить голос.
- `POST /api/v1/contest/contestants` — создать участника (Admin_User/canEdit).
- `PUT /api/v1/contest/contestants/[id]` — обновить участника.
- `DELETE /api/v1/contest/contestants/[id]` — удалить участника.
- `POST /api/v1/contest/contestants/[id]/photo` — загрузить/заменить фото.

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────────┐
│  ContestPage         │        │  ContestResultPage            │
│  (/contest)          │        │  (/contest/result)            │
│  'use client'        │        │  'use client'                 │
└──────────┬───────────┘        └───────────────┬───────────────┘
           │ fetch                              │ fetch
           ▼                                    ▼
   /api/v1/contest (GET)               /api/v1/contest (GET)
   /api/v1/contest/vote (GET/POST)
   /api/v1/contest/contestants (POST)      [read-only]
   /api/v1/contest/contestants/[id] (PUT/DELETE)
   /api/v1/contest/contestants/[id]/photo (POST)
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  src/lib/db-prisma.ts                                        │
│  getAllContestants / getContestantById / createContestant /  │
│  updateContestant / deleteContestant /                       │
│  getContestResults / getVoteByUserId / upsertVote            │
└──────────────────────────┬────────────────────────────────────┘
                           │ getPrisma() (singleton)
                           ▼
                 ┌───────────────────┐        ┌───────────────┐
                 │  Contestant table │◄──────►│ ContestVote   │
                 └───────────────────┘  1:N   └───────┬───────┘
                                                       │ N:1
                                                       ▼
                                                 ┌───────────┐
                                                 │   User    │
                                                 └───────────┘

Фото:  POST .../photo → src/lib/s3.ts (uploadImage/deleteImage, S3Prefix.contestant)
Авторизация: auth() из src/auth.ts → session.user.role → isAdmin()/canEdit() из src/lib/roles.ts
```

## Components and Interfaces

### 1. Prisma Schema (`prisma/schema.prisma`)

```prisma
// ─── Contest ──────────────────────────────────────────────────────────────────
// Участники и голоса конкурса вокальной школы

model Contestant {
  id             Int      @id @default(autoincrement())
  name           String
  song           String
  originalArtist String
  photoUrl       String   @default("")

  votes ContestVote[]

  @@index([id])
}

model ContestVote {
  id           Int      @id @default(autoincrement())
  userId       Int
  contestantId Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @default(now()) @updatedAt

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  contestant Contestant @relation(fields: [contestantId], references: [id], onDelete: Cascade)

  @@unique([userId])
  @@index([contestantId])
}
```

`User` модель дополняется обратной связью:

```prisma
model User {
  // ...существующие поля...
  contestVotes ContestVote[]
}
```

Ограничения длины полей (имя ≤200, песня ≤300, исполнитель ≤200, photoUrl ≤2048) применяются на уровне валидации в функциях доступа к данным / API-роутах, а не как `@db.VarChar` в схеме — это соответствует существующему паттерну проекта (например, `WikiTerm.title` без ограничения длины на уровне БД, валидация в API).

**Миграция**: `prisma/migrations/{timestamp}_add_contest_voting/migration.sql` — создаёт таблицы `Contestant` и `ContestVote` пустыми (без переноса данных из `data/contest-votes.json`), согласно Requirement 1.2. Генерируется через `npx prisma migrate dev --name add_contest_voting`.

### 2. Domain Types (`src/lib/types.ts`)

```typescript
export interface Contestant {
  id: number
  name: string
  song: string
  originalArtist: string
  photoUrl: string
}

// Contestant с агрегированным количеством голосов — для результатов
export interface ContestResult extends Contestant {
  votes: number
}

// Статус голосования текущего пользователя
export interface ContestVoteStatus {
  hasVoted: boolean
  contestantId: number | null
}
```

### 3. Data Access Layer (`src/lib/db-prisma.ts`)

Добавляются функции по существующему паттерну (try/return undefined для not-found, без исключений на "не найдено"):

```typescript
import { Contestant, ContestResult, ContestVoteStatus } from './types';

// ─── Contest: Contestants ──────────────────────────────────────────────────────

export async function getAllContestants(): Promise<Contestant[]> {
  const prisma = getPrisma();
  const rows = await prisma.contestant.findMany({ orderBy: { id: 'asc' } });
  return rows.map((c) => ({ id: c.id, name: c.name, song: c.song, originalArtist: c.originalArtist, photoUrl: c.photoUrl }));
}

export async function getContestantById(id: number): Promise<Contestant | undefined> {
  const prisma = getPrisma();
  const c = await prisma.contestant.findUnique({ where: { id } });
  if (!c) return undefined;
  return { id: c.id, name: c.name, song: c.song, originalArtist: c.originalArtist, photoUrl: c.photoUrl };
}

export async function createContestant(data: Omit<Contestant, 'id'>): Promise<Contestant> {
  const prisma = getPrisma();
  const created = await prisma.contestant.create({
    data: { name: data.name, song: data.song, originalArtist: data.originalArtist, photoUrl: data.photoUrl },
  });
  return { id: created.id, name: created.name, song: created.song, originalArtist: created.originalArtist, photoUrl: created.photoUrl };
}

export async function updateContestant(data: Contestant): Promise<Contestant> {
  const prisma = getPrisma();
  const updated = await prisma.contestant.update({
    where: { id: data.id },
    data: { name: data.name, song: data.song, originalArtist: data.originalArtist, photoUrl: data.photoUrl },
  });
  return { id: updated.id, name: updated.name, song: updated.song, originalArtist: updated.originalArtist, photoUrl: updated.photoUrl };
}

export async function deleteContestant(id: number): Promise<void> {
  const prisma = getPrisma();
  await prisma.contestant.delete({ where: { id } });
}

// ─── Contest: Results ───────────────────────────────────────────────────────────

export async function getContestResults(): Promise<ContestResult[]> {
  const prisma = getPrisma();
  const rows = await prisma.contestant.findMany({
    orderBy: { id: 'asc' },
    include: { _count: { select: { votes: true } } },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    song: c.song,
    originalArtist: c.originalArtist,
    photoUrl: c.photoUrl,
    votes: c._count.votes,
  }));
}

// ─── Contest: Votes ─────────────────────────────────────────────────────────────

export async function getVoteStatusByUserId(userId: number): Promise<ContestVoteStatus> {
  const prisma = getPrisma();
  const vote = await prisma.contestVote.findUnique({ where: { userId } });
  return { hasVoted: !!vote, contestantId: vote?.contestantId ?? null };
}

/** Создаёт голос пользователя или обновляет ссылку на Contestant, если голос уже существует. */
export async function upsertContestVote(userId: number, contestantId: number): Promise<{ created: boolean }> {
  const prisma = getPrisma();
  const existing = await prisma.contestVote.findUnique({ where: { userId } });
  await prisma.contestVote.upsert({
    where: { userId },
    update: { contestantId },
    create: { userId, contestantId },
  });
  return { created: !existing };
}
```

`getContestResults` использует `_count` (агрегация на уровне БД), что удовлетворяет Requirement 4.1 (включая участников с 0 голосов, так как `findMany` без `where` возвращает все записи `Contestant` независимо от наличия голосов).

### 4. API Routes

#### `src/app/api/v1/contest/route.ts` — результаты голосования

```typescript
export async function GET(): Promise<NextResponse<ApiResponse<ContestResult[]>>> {
  try {
    const results = await getContestResults();
    return NextResponse.json({ success: true, data: results, timestamp: new Date() });
  } catch (error) {
    console.error('[Contest] Ошибка загрузки результатов голосования:', error);
    return NextResponse.json({ success: false, error: 'Internal server error', timestamp: new Date() }, { status: 500 });
  }
}
```

Requirement 4.3 (ошибка агрегации → индикация ошибки, ContestVote не изменяется) выполняется естественным образом: `GET` не производит запись, а исключение из Prisma перехватывается и превращается в 500 без падения на частичный список.

#### `src/app/api/v1/contest/vote/route.ts` — статус и голосование

```typescript
export async function GET(): Promise<NextResponse<ApiResponse<ContestVoteStatus>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: true, data: { hasVoted: false, contestantId: null }, timestamp: new Date() });
  }
  const status = await getVoteStatusByUserId(Number(session.user.id));
  return NextResponse.json({ success: true, data: status, timestamp: new Date() });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ContestVoteStatus>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized', timestamp: new Date() }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const contestantId = body?.contestantId;
  if (typeof contestantId !== 'number' || !Number.isInteger(contestantId) || contestantId <= 0) {
    return NextResponse.json({ success: false, error: 'Invalid contestantId', timestamp: new Date() }, { status: 400 });
  }

  const contestant = await getContestantById(contestantId);
  if (!contestant) {
    return NextResponse.json({ success: false, error: 'Contestant not found', timestamp: new Date() }, { status: 404 });
  }

  const { created } = await upsertContestVote(Number(session.user.id), contestantId);
  console.log(`[Contest] Голос сохранён: userId=${session.user.id}, contestantId=${contestantId}, created=${created}`);
  revalidatePath('/contest');
  revalidatePath('/contest/result');

  return NextResponse.json(
    { success: true, data: { hasVoted: true, contestantId }, timestamp: new Date() },
    { status: created ? 201 : 200 }
  );
}
```

`GET` без сессии возвращает `hasVoted: false` вместо 401 — это осознанное решение: ContestPage вызывает этот эндпоинт при первой загрузке страницы для всех посетителей (включая неавторизованных), и Requirement 3.7 явно требует статус «не проголосовал» для неавторизованных, а не ошибку. 401 применяется только к `POST` (Requirement 3.1), где неавторизованная попытка голосования — ошибочное действие.

Requirement 3.4 (повторный голос за того же Contestant — без изменений, статус 200) удовлетворяется через `upsert`: `update: { contestantId }` с тем же значением не меняет данные по сути, `created` будет `false`, статус 200.

#### `src/app/api/v1/contest/contestants/route.ts` — создание участника

```typescript
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Contestant>>> {
  const session = await auth();
  if (!canEdit(session?.user?.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden', timestamp: new Date() }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const validation = validateContestantFields(body);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.error, timestamp: new Date() }, { status: 400 });
  }

  const created = await createContestant({
    name: validation.data.name,
    song: validation.data.song,
    originalArtist: validation.data.originalArtist,
    photoUrl: '',
  });
  console.log('[Contest] Участник создан:', created.id);
  revalidatePath('/contest');
  return NextResponse.json({ success: true, data: created, timestamp: new Date() }, { status: 201 });
}
```

`validateContestantFields` — общая функция валидации (см. ниже, `src/lib/contest-validation.ts`), используемая как при создании, так и при обновлении, чтобы не дублировать проверки длины/пустоты (Requirement 1.5, 6.3, 6.5, 6.7).

#### `src/app/api/v1/contest/contestants/[id]/route.ts` — обновление и удаление

```typescript
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<Contestant>>> {
  const session = await auth();
  if (!canEdit(session?.user?.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden', timestamp: new Date() }, { status: 403 });
  }

  const { id } = await props.params;
  const existing = await getContestantById(Number(id));
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Not found', timestamp: new Date() }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const validation = validateContestantFields(body);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.error, timestamp: new Date() }, { status: 400 });
  }

  const updated = await updateContestant({ ...existing, ...validation.data });
  console.log('[Contest] Участник обновлён:', updated.id);
  revalidatePath('/contest');
  revalidatePath('/contest/result');
  return NextResponse.json({ success: true, data: updated, timestamp: new Date() });
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  const session = await auth();
  if (!isAdmin(session?.user?.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden', timestamp: new Date() }, { status: 403 });
  }

  const { id } = await props.params;
  const existing = await getContestantById(Number(id));
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Not found', timestamp: new Date() }, { status: 404 });
  }

  if (existing.photoUrl) {
    const fileName = existing.photoUrl.split('/').pop();
    if (fileName) {
      try {
        await deleteImage(fileName, S3Prefix.contestant);
      } catch (error) {
        // Ошибка, отличная от "файл не найден" — не удаляем запись (Requirement 7.6)
        console.error('[Contest] Не удалось удалить фото участника, запись не удалена:', existing.id, error);
        return NextResponse.json({ success: false, error: 'Failed to delete photo, contestant not deleted', timestamp: new Date() }, { status: 502 });
      }
    }
  }

  await deleteContestant(Number(id)); // каскадно удаляет связанные ContestVote
  console.log('[Contest] Участник удалён:', id);
  revalidatePath('/contest');
  revalidatePath('/contest/result');
  return NextResponse.json({ success: true, data: { success: true }, timestamp: new Date() });
}
```

Требование 7.2 ("удалять запись при успешном удалении файла **или** при отсутствии файла в хранилище") реализуется так: S3 `DeleteObjectCommand` не возвращает ошибку для отсутствующего ключа (идемпотентное удаление в S3-совместимых хранилищах), поэтому "файл не найден" и "успешно удалён" ведут по одному и тому же успешному пути `try`, а запись удаляется в обоих случаях. Ошибки транспорта/доступности хранилища (сетевые, 5xx от S3) попадают в `catch` и прерывают удаление записи согласно Requirement 7.6.

#### `src/app/api/v1/contest/contestants/[id]/photo/route.ts` — фото участника

Полностью аналогичен `instructors/[id]/photo/route.ts`, с расширенным списком MIME-типов (Requirement 6.4 включает `image/gif`, в отличие от instructor/news роутов):

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<{ url: string }>>> {
  const session = await auth();
  if (!canEdit(session?.user?.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden', timestamp: new Date() }, { status: 403 });
  }

  const { id } = await props.params;
  const contestant = await getContestantById(Number(id));
  if (!contestant) return NextResponse.json({ success: false, error: 'Not found', timestamp: new Date() }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ success: false, error: 'No file provided', timestamp: new Date() }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ success: false, error: 'Invalid file type', timestamp: new Date() }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ success: false, error: 'File too large (max 5MB)', timestamp: new Date() }, { status: 400 });

  if (contestant.photoUrl) {
    const oldFileName = contestant.photoUrl.split('/').pop();
    if (oldFileName) {
      await deleteImage(oldFileName, S3Prefix.contestant).catch((error) =>
        console.error('[Contest] Не удалось удалить старое фото участника:', id, error)
      );
    }
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `contestant-${id}-${Date.now()}.${ext}`;
  const url = await uploadImage(Buffer.from(await file.arrayBuffer()), fileName, file.type, S3Prefix.contestant);

  await updateContestant({ ...contestant, photoUrl: url });
  console.log('[Contest] Фото участника обновлено:', id);
  revalidatePath('/contest');
  revalidatePath('/contest/result');
  return NextResponse.json({ success: true, data: { url }, timestamp: new Date() });
}
```

Валидация MIME/размера выполняется **до** обращения к S3 и до удаления старого файла — при отклонении (400) `photoUrl` не изменяется, старый файл не трогается (Requirement 6.8 в сочетании с 6.4).

### 5. Shared Validation (`src/lib/contest-validation.ts`)

```typescript
export interface ContestantFieldsInput {
  name?: unknown;
  song?: unknown;
  originalArtist?: unknown;
}

export type ContestantValidationResult =
  | { valid: true; data: { name: string; song: string; originalArtist: string } }
  | { valid: false; error: string };

const MAX_NAME = 200;
const MAX_SONG = 300;
const MAX_ARTIST = 200;

export function validateContestantFields(input: unknown): ContestantValidationResult {
  const body = (input ?? {}) as ContestantFieldsInput;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const song = typeof body.song === 'string' ? body.song.trim() : '';
  const originalArtist = typeof body.originalArtist === 'string' ? body.originalArtist.trim() : '';

  if (!name || name.length > MAX_NAME) return { valid: false, error: `Имя обязательно и не должно превышать ${MAX_NAME} символов` };
  if (!song || song.length > MAX_SONG) return { valid: false, error: `Название песни обязательно и не должно превышать ${MAX_SONG} символов` };
  if (!originalArtist || originalArtist.length > MAX_ARTIST) return { valid: false, error: `Исполнитель обязателен и не должен превышать ${MAX_ARTIST} символов` };

  return { valid: true, data: { name, song, originalArtist } };
}
```

Используется и в `createContestant`-роуте, и в `updateContestant`-роуте — единая точка проверки для Requirement 1.5, 6.3, 6.5, 6.7.

### 6. S3 Prefix (`src/lib/s3.ts`)

```typescript
export const S3Prefix = {
    concertPhotos: 'concert-photos/',
    wikiCovers: 'wiki-covers/',
    instructorPhotos: 'instructor-photos/',
    newsCovers: 'news-covers/',
    contestant: 'contestant/',
} as const;
```

Добавляется одна строка в существующий const-объект, без изменения сигнатур `uploadImage`/`deleteImage`/`listImages`.

### 7. UI: ContestPage (`src/app/contest/page.tsx`)

Верстка карточки участника, заголовков и структуры сохраняется полностью (Requirement 8.1, 8.2). Изменения:

- `interface Contestant` дополняется полем `originalArtist: string` (не отображается в верстке, но нужен для формы редактирования) — тип импортируется из `@/lib/types` вместо локального объявления.
- `fetchResults` вызывает `GET /api/v1/contest`, маппит `ContestResult[]` в текущую форму (поле `photo` → `photoUrl`, остальное совместимо). Для минимизации изменений верстки, при чтении ответа локальная переменная `photo` присваивается как `contestant.photoUrl`.
- `checkVotingStatus` вызывает `GET /api/v1/contest/vote`, использует `data.contestantId` для подсветки текущего выбранного варианта (кнопка "Проголосовано" уже показывается на основе `hasVoted`, логика не меняется).
- `handleVote` вызывает `POST /api/v1/contest/vote` с телом `{ contestantId }` вместо `/api/contest`.
- Компонент оборачивается в проверку сессии (`useSession()` из `next-auth/react`, аналогично `NavMenu`/`UserAvatar`) для определения `isAdmin`. Серверный компонент не подходит, так как страница целиком клиентская (`'use client'`) — используется `useSession()` вместо `auth()`.
- Внутрь существующего `<div className="group relative overflow-hidden rounded-xl ...">` карточки (после блока с индикатором прогресса, до закрывающего `</div>` карточки, рядом с кнопкой "Голосовать") добавляются кнопки "Редактировать" и "Удалить", видимые только при `isAdmin` (Requirement 6.1, 6.2, 7.1, 8.4). Кнопки не изменяют порядок существующих элементов — располагаются в отдельном `<div>` рядом с кнопкой голосования.
- `ContestantAdminForm` (см. ниже) рендерится как отдельный блок **перед** `<div className="space-y-4">` (списком карточек), видимый только при `isAdmin` (Requirement 6.1, 8.5).
- Удаление участника показывает диалог подтверждения (тот же паттерн, что в `users-table.tsx`: `deleteTarget` state + модальное окно с "Отмена"/"Удалить") перед вызовом `DELETE` (Requirement 7.8).
- Все `fetch`-вызовы (`fetchResults`, `checkVotingStatus`, `handleVote`, а также запросы создания/обновления/удаления участника и загрузки фото, инициируемые со страницы) оборачиваются в `try/catch`; сетевая ошибка или неуспешный ответ логируются через `console.error('[Contest] ...', error)` (см. раздел "Logging"), без изменения отображаемого пользователю UI сверх уже предусмотренного текущей версткой.

### 8. UI: ContestResultPage (`src/app/contest/result/page.tsx`)

Единственное изменение — источник данных: `fetchResults` вызывает `GET /api/v1/contest` вместо `/api/contest`. Верстка блока победителя, диаграммы и топ-3 не меняется (Requirement 8.3). `fetchResults` остаётся обёрнутым в `try/catch`; сетевая ошибка или неуспешный ответ логируются через `console.error('[Contest] ...', error)`, по тому же правилу из раздела "Logging". Admin-контролы на этой странице не добавляются — Requirement 6/7 говорят только о `ContestPage`.

Логика определения победителя (`reduce` по максимуму `votes`) остаётся, но Requirement 4.4 (несколько лидеров с одинаковым максимумом) требует показывать **всех** лидеров, а не одного. Текущий `reduce` выбирает первого найденного. Меняется на:

```typescript
const maxVotes = contestants.length > 0 ? Math.max(...contestants.map(c => c.votes)) : 0;
const winners = maxVotes > 0 ? contestants.filter(c => c.votes === maxVotes) : [];
```

Блок "Победитель" рендерится для каждого элемента `winners` (при `winners.length > 1` — несколько карточек победителя рядом/друг под другом), сохраняя состав элементов (иконки кубка, фото, имя в h3, название номера, количество и процент голосов) для каждой карточки. Это единственное расширение верстки, прямо требуемое Requirement 4.4 и не противоречащее Requirement 8.3 (состав элементов на карточку победителя сохранён, меняется только количество отображаемых карточек).

### 9. Component: `ContestantAdminForm`

`src/components/contest/contestant-admin-form.tsx`

```typescript
'use client';

interface ContestantAdminFormProps {
    contestant?: Contestant; // если передан — режим редактирования, иначе создание
    onSaved: () => void;
    onCancel?: () => void;
}

export const ContestantAdminForm: FC<ContestantAdminFormProps> = ({ contestant, onSaved, onCancel }) => {
    // react-hook-form + yup, по паттерну NewsAddForm:
    // - поля name, song, originalArtist (текстовые input)
    // - опциональный файл фото (input[type=file], preview через URL.createObjectURL)
    // - onSubmit: JSON POST/PUT на /api/v1/contest/contestants[/id], затем при наличии файла
    //   FormData POST на /api/v1/contest/contestants/[id]/photo
    // - валидация yup: name/originalArtist max 200, song max 300, все required (trim)
    // - оба fetch-вызова (JSON и FormData) оборачиваются в try/catch; сетевая ошибка или
    //   !response.ok логируются через console.error('[Contest] ...', error) (см. раздел "Logging")
    // ...
};
```

Схема валидации `ContestantSchema` добавляется в `src/lib/definitions.ts` (там же, где `NewsSchema`), с полями `name`, `song`, `originalArtist`.

Форма используется дважды на `ContestPage`:
- Без `contestant` prop — блок создания (постоянно видимый для admin, либо за кнопкой "+ Добавить участника", по аналогии с `NewsAddForm`).
- С `contestant` prop — открывается inline при клике "Редактировать" на конкретной карточке (состояние `editingId` на странице определяет, какая карточка сейчас в режиме редактирования).

### 10. Cleanup — удаляемые файлы (Requirement 5)

| Файл | Действие |
|---|---|
| `src/app/api/contest/route.ts` | Удалить (логика перенесена в `src/app/api/v1/contest/route.ts` + `contestants/*`) |
| `src/app/api/contest/check-vote/route.ts` | Удалить (заменён `GET /api/v1/contest/vote`) |
| `src/app/api/contest-reset/route.ts` | Удалить (сброс по паролю не переносится — Requirement 5.3) |
| `src/app/contest/reset-contest/page.tsx` (если существует) | Удалить |
| `data/contest-votes.json` | Удалить файл; убедиться, что никакой код больше не содержит `fs.readFileSync`/`writeFileSync` с этим путём |
| Cookie `hasVoted` | Убедиться, что ни один роут больше не читает/пишет `cookies().get('hasVoted')` / `response.cookies.set('hasVoted', ...)` |

Файлы фото в `/public/contest/*` **не удаляются** (Requirement 5.5) — они становятся "осиротевшими" статическими файлами, не связанными с новыми записями `Contestant` (которые создаются пустыми согласно Requirement 1.2). Admin вручную создаст новых участников через `ContestantAdminForm` и загрузит фото через S3-флоу при необходимости.

## Data Models

```
Contestant                          ContestVote
┌──────────────────┐                ┌──────────────────┐
│ id: Int (PK)      │◄───┐           │ id: Int (PK)      │
│ name: String      │    │ 1:N       │ userId: Int (FK)  │──┐
│ song: String      │    └───────────│ contestantId: FK  │  │ N:1
│ originalArtist:Str │               │ createdAt: DateTime│  │
│ photoUrl: String   │               │ updatedAt: DateTime│  │
└──────────────────┘                └──────────────────┘  │
   onDelete: Cascade (via ContestVote.contestant relation)  │
                                                             ▼
                                                        User (existing)
                                     @@unique([userId]) — один голос на пользователя
                                     onDelete: Cascade (via ContestVote.user relation)
```

Доменные типы (`src/lib/types.ts`): `Contestant`, `ContestResult extends Contestant { votes: number }`, `ContestVoteStatus { hasVoted, contestantId }`.

## Error Handling

| Сценарий | Ответ | Данные |
|---|---|---|
| Голосование без сессии | 401 | ContestVote не создаётся |
| Голосование за отсутствующий contestantId | 404 | ContestVote не изменяется |
| Голосование с невалидным/отсутствующим contestantId | 400 | ContestVote не изменяется |
| Создание/обновление участника без `canEdit` | 403 | Contestant не изменяется |
| Удаление участника без `isAdmin` | 403 | Contestant/ContestVote не изменяются |
| Пустые/слишком длинные текстовые поля участника | 400 | Contestant не создаётся/не изменяется |
| Недопустимый MIME/размер фото | 400 | photoUrl не изменяется, старый файл не удаляется |
| Обновление/удаление несуществующего id | 404 | Данные не изменяются |
| Ошибка удаления файла фото (не "не найден") | 502 | Contestant не удаляется из БД |
| Ошибка агрегации результатов (БД недоступна) | 500 | ContestVote/Contestant не изменяются |

Все API-роуты оборачивают операции с БД/S3 в `try/catch`, логируют ошибку через `console.error` и возвращают `ApiResponse` с `success: false`, никогда не выбрасывая необработанное исключение — согласно code-conventions ("Never throw exceptions").

## Logging

В проекте отсутствует централизованный logger-модуль: `src/lib/api-response.ts`, `src/lib/alfa-crm.ts` и `src/lib/mobileid.ts` используют `console.error`/`console.log` напрямую с текстовым префиксом (`[Alfa CRM] ...`). Фича `contest-voting` следует этому же паттерну, без введения новой инфраструктуры логирования, с единым префиксом `[Contest]`.

**Сервер (API-роуты, `db-prisma.ts`, обращения к `s3.ts`):**

- Каждая ошибка сетевого/БД/S3 взаимодействия логируется через `console.error('[Contest] <что делали>', error)` непосредственно в `catch`-блоке, где она перехвачена. Контекст сообщения указывает операцию и нечувствительные параметры (например, `contestantId`, `id`), но не логирует токены, пароли или содержимое сессии.
- Значимые успешные сетевые операции — создание/обновление/удаление участника, загрузка/удаление фото, создание/изменение голоса — логируются через `console.log('[Contest] <что произошло>', ...)` по аналогии с `alfa-crm.ts` (`console.log('[Alfa CRM] Токен успешно получен')`). Например: `console.log('[Contest] Участник создан:', created.id)`, `console.log('[Contest] Голос сохранён: userId=..., contestantId=...')`.
- Ветки с ошибками S3 (например, "не удалось удалить файл фото, отличное от 'не найден'") логируются через `console.error('[Contest] ...', error)` перед возвратом ответа с кодом ошибки.

**Клиент (`ContestPage`, `ContestResultPage`, `ContestantAdminForm`):**

- Каждый `fetch`-вызов оборачивается в `try/catch`; сетевые исключения и ответы с `!response.ok` (или `success: false` в теле `ApiResponse`) логируются через `console.error('[Contest] ...', error)` — этого достаточно для диагностики проблем соединения без подключения внешних библиотек логирования, так как в проекте нет выделенного клиентского логгера.

Это чисто техническое улучшение наблюдаемости — оно не меняет бизнес-логику, коды ответов или структуру данных, описанные в разделе "Error Handling" выше.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Согласованность списка участников через доступ к данным

Для любого набора созданных записей `Contestant`, `getAllContestants()` должен возвращать ровно эти записи, отсортированные по `id` в порядке возрастания, а `getContestantById(id)` должен возвращать соответствующую запись для существующего `id` и `undefined` для `id`, отсутствующего среди созданных записей.

**Validates: Requirements 1.3**

### Property 2: Валидация обязательных текстовых полей при создании и обновлении

Для любых значений имени, названия песни и оригинального исполнителя, операция создания или обновления `Contestant` завершается успешно (сохраняет запись) тогда и только тогда, когда после удаления пробелов по краям все три значения непустые и не превышают максимальную длину (200, 300, 200 символов соответственно); в противном случае операция возвращает признак ошибки и не изменяет таблицу `Contestant`.

**Validates: Requirements 1.5, 6.3, 6.5, 6.7**

### Property 3: Мутации над несуществующим идентификатором не изменяют данные

Для любого идентификатора, отсутствующего в таблице `Contestant`, операции обновления и удаления должны возвращать признак ошибки (404) и не создавать, не изменять и не удалять записи `Contestant` или связанные `ContestVote`.

**Validates: Requirements 1.6, 7.7**

### Property 4: Каскадное удаление связанных голосов

Для любого `Contestant` или `User`, имеющего связанные записи `ContestVote`, удаление этого `Contestant` или `User` приводит к удалению всех связанных с ним записей `ContestVote`, и никаких других записей `ContestVote` не затрагивается.

**Validates: Requirements 2.3, 2.4, 7.5**

### Property 5: Ровно один голос на пользователя, отражающий последний выбор

Для любого авторизованного пользователя и любой последовательности запросов голосования за существующих участников, после каждого запроса в таблице `ContestVote` существует ровно одна запись с данным `userId`, и её `contestantId` равен `contestantId` из последнего успешного запроса этого пользователя; при этом первый такой запрос возвращает статус 201, а последующие — статус 200 независимо от того, совпадает ли новый `contestantId` с предыдущим.

**Validates: Requirements 2.2, 3.2, 3.3, 3.4**

### Property 6: Неавторизованное или невалидное голосование не создаёт и не изменяет голос

Для любого запроса голосования, который либо отправлен без авторизованной сессии, либо содержит `contestantId`, отсутствующий в базе данных, либо содержит `contestantId`, не являющийся положительным целым числом, система возвращает соответствующий код ошибки (401, 404 или 400) и не создаёт и не изменяет ни одной записи `ContestVote`.

**Validates: Requirements 3.1, 3.5, 3.6**

### Property 7: Статус голосования точно отражает состояние базы данных

Для любого пользователя и любого состояния таблицы `ContestVote`, запрос статуса голосования возвращает «проголосовал» с соответствующим `contestantId` тогда и только тогда, когда для данного авторизованного пользователя существует запись `ContestVote`; в остальных случаях (нет сессии или нет записи) возвращается «не проголосовал», и результат не зависит от значения каких-либо cookie.

**Validates: Requirements 3.7**

### Property 8: Корректная агрегация результатов голосования

Для любого набора записей `Contestant` и `ContestVote`, результат запроса результатов голосования должен содержать ровно все записи `Contestant` (включая участников без голосов, с количеством голосов равным 0, и пустой список при отсутствии участников), и для каждого участника агрегированное количество голосов должно точно равняться числу связанных с ним записей `ContestVote`; при ошибке выполнения агрегации система возвращает индикацию ошибки вместо частичного или обнулённого списка, и ранее сохранённые записи `ContestVote` остаются без изменений.

**Validates: Requirements 4.1, 4.2, 4.3, 4.5**

### Property 9: Все участники с максимальным количеством голосов отмечаются как лидеры

Для любого распределения голосов среди участников, множество отображаемых на `ContestResultPage` победителей должно точно совпадать с множеством участников, чьё количество голосов равно максимальному количеству голосов среди всех участников (при максимуме больше 0).

**Validates: Requirements 4.4**

### Property 10: Авторизация мутаций участников соответствует роли пользователя

Для любого запроса создания или обновления `Contestant`, операция выполняется тогда и только тогда, когда `canEdit(role)` пользователя истинно; для любого запроса удаления `Contestant`, операция выполняется тогда и только тогда, когда `isAdmin(role)` пользователя истинно; в противном случае возвращается ответ 403 и данные `Contestant` не изменяются.

**Validates: Requirements 6.6, 7.4**

### Property 11: Видимость административных элементов управления соответствует роли

Для любой роли текущего пользователя, `ContestantAdminForm` и элементы управления редактированием/удалением участника отображаются на `ContestPage` тогда и только тогда, когда `isAdmin(role)` истинно для данного пользователя.

**Validates: Requirements 6.1, 6.2, 7.1**

### Property 12: Загрузка фото условна по MIME-типу и размеру, со сменой файла

Для любого загружаемого файла фото участника, операция загрузки завершается успешно (сохраняет новый `photoUrl` и удаляет файл, соответствующий предыдущему `photoUrl`, если он был непустым) тогда и только тогда, когда MIME-тип файла входит в множество `{image/jpeg, image/png, image/webp, image/gif}` и размер файла не превышает 5 МБ; в противном случае операция возвращает ответ 400, и `photoUrl` участника, а также ранее сохранённый файл, остаются без изменений.

**Validates: Requirements 6.4, 6.8**

### Property 13: Порядок и обработка ошибок при удалении участника с фото

Для любого `Contestant` с непустым `photoUrl`, удаление участника сначала выполняет удаление файла из `ContestantPhotoStorage`; если удаление файла завершается успешно или файл отсутствует в хранилище, запись `Contestant` удаляется из базы данных; если удаление файла завершается иной ошибкой (например, недоступность хранилища), запись `Contestant` не удаляется, и система возвращает ответ, указывающий на невозможность выполнить удаление. Для любого `Contestant` с пустым `photoUrl`, удаление записи выполняется без обращения к `ContestantPhotoStorage`.

**Validates: Requirements 7.2, 7.3, 7.6**

## Testing Strategy

Проект использует **Vitest** (`vitest.config.ts`, jsdom-окружение). Тесты располагаются рядом с кодом (`*.test.ts`), по паттерну `src/app/programs/utils.test.ts`.

### Unit / Integration тесты (примеры и граничные случаи)

- `src/lib/contest-validation.test.ts` — примеры: валидные значения проходят; пустая строка/строка из пробелов отклоняется; значение ровно на границе длины (200/300 символов) проходит, длина+1 отклоняется.
- `src/app/api/v1/contest/vote/route.test.ts` — мокается `auth()` и `getPrisma()`/функции `db-prisma`: пример без сессии → 401; пример с несуществующим `contestantId` → 404; пример с `contestantId: 0` и `contestantId: 'abc'` → 400 (граничные случаи для Property 6).
- `src/app/api/v1/contest/contestants/[id]/route.test.ts` — пример DELETE с ошибкой S3 не равной "не найдено" (мок `deleteImage` бросает исключение) → 502, запись не удалена (edge case для Property 13).
- `src/app/api/v1/contest/contestants/[id]/photo/route.test.ts` — пример с недопустимым MIME (`application/pdf`) → 400; пример с файлом 6MB → 400 (edge cases для Property 12).
- Компонентный тест `contestant-admin-form.test.tsx` — пример: клик по кнопке "Удалить" открывает диалог подтверждения и не вызывает `fetch` до подтверждения (Requirement 7.8, классифицировано как EXAMPLE, а не property).
- Snapshot/example-тест `contest-page-layout.test.tsx` — пример: структура карточки участника (порядок фото/имя/песня/кнопка) не изменилась относительно текущей верстки (Requirement 8) — статический пример, не property.

### Property-based тесты

Используется `fast-check` (стандартная библиотека PBT для TypeScript/Vitest; при отсутствии в проекте — добавить как dev-dependency с точной версией). Минимум 100 итераций на property, доступ к БД в property-тестах — через тестовый Prisma-клиент (например, `pglite`, уже присутствующий в `node_modules` транзитивно, либо тестовая PostgreSQL-схема) либо через мок слоя `db-prisma` для API-роутов, чтобы изолировать логику от реальной инфраструктуры.

Каждый property-тест помечается тегом:
**Feature: contest-voting, Property {number}: {краткое название}**

Примеры соответствия properties → тестовые файлы:

- Property 1, 3 → `src/lib/db-prisma.contest.test.ts` (генерация случайных наборов участников/id, проверка сортировки и undefined для отсутствующих id).
- Property 2 → `src/lib/contest-validation.test.ts` (property-часть: генерация случайных строк с пробелами по краям и случайной длины, проверка `valid ⇔ (trim непусто ∧ длина ≤ max)` для всех трёх полей).
- Property 4 → `src/lib/db-prisma.contest.test.ts` (генерация случайного графа Contestant/User/ContestVote, проверка каскадного удаления через тестовую БД).
- Property 5, 6 → `src/app/api/v1/contest/vote/route.test.ts` (генерация случайных последовательностей запросов голосования от одного пользователя за случайных существующих/несуществующих участников).
- Property 7 → `src/app/api/v1/contest/vote/route.test.ts` (генерация случайного состояния ContestVote и наличия/отсутствия сессии).
- Property 8 → `src/lib/db-prisma.contest.test.ts` (генерация случайных наборов участников и голосов, сравнение агрегации с эталонным подсчётом в памяти).
- Property 9 → `src/app/contest/result/page.test.tsx` или вынесенная утилита `getWinners(results)` в `src/app/contest/result/utils.ts` + `utils.test.ts` (генерация случайного распределения голосов, проверка множества победителей).
- Property 10, 11 → `src/lib/roles.test.ts` (уже покрывает `isAdmin`/`canEdit` для всех значений `UserRole`; дополняется property для всех API-роутов мутации участников и для условного рендера в `ContestPage`/`ContestantAdminForm`).
- Property 12, 13 → `src/app/api/v1/contest/contestants/[id]/photo/route.test.ts` и `.../[id]/route.test.ts` (генерация случайных MIME-типов из объединения допустимых/недопустимых множеств и случайных размеров файла вокруг границы 5MB; для 13 — мок S3 со случайным исходом "найден"/"не найден"/"ошибка").

Property-тесты дополняют, а не заменяют unit-тесты: unit-тесты фиксируют конкретные граничные примеры (0 байт, ровно 5MB, ровно 200 символов), property-тесты покрывают широкий диапазон входных данных для обнаружения непредусмотренных комбинаций.

Дополнительно, unit-тесты для API-роутов проверяют вызов `console.error`/`console.log` (через `vi.spyOn(console, 'error')`/`vi.spyOn(console, 'log')`) в ключевых сценариях ошибок и успешных мутаций как часть проверки наблюдаемости, а не как отдельное correctness property.
