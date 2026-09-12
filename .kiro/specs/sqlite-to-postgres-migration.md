# Spec: Миграция SQLite → PostgreSQL

## Описание
Полная миграция базы данных с SQLite на PostgreSQL с сохранением всех существующих данных. Обновление Docker-compose для запуска контейнера с PostgreSQL на production сервере.

**Дата создания**: August 2, 2026  
**Приоритет**: High  
**Статус**: Черновик

---

## Требования

### Функциональные требования
1. **Миграция схемы**
   - Переход с SQLite на PostgreSQL без потери данных
   - Переконфигурация Prisma с использованием `@prisma/adapter-pg`
   - Создание новых миграций для PostgreSQL

2. **Миграция данных**
   - Экспорт всех данных из текущей БД
   - Трансформация типов данных (DATETIME → timestamp, BOOLEAN → boolean)
   - Импорт в новую PostgreSQL БД
   - Валидация целостности данных

3. **Конфигурация окружения**
   - Обновление `.env.local` с PostgreSQL URL
   - Обновление переменных окружения для production
   - Проверка всех зависимостей

4. **Docker & Deployment**
   - Обновление `docker-compose.yml` для запуска PostgreSQL сервиса
   - Настройка volume для persistent storage
   - Health check для БД сервиса
   - Обновление Dockerfile для использования pg адаптера

---

## Текущее состояние

### Зависимости (уже установлены)
- `@prisma/client` v7.8.0 ✓
- `@prisma/adapter-pg` v7.9.1 ✓
- `@prisma/adapter-better-sqlite3` v7.8.0 (будет удалена)
- `pg` v8.22.0 ✓

### Текущие данные (wiki.db)
- 3 WikiCategory записи
- 31 WikiTerm записей
- 3 News записей
- 4 Instructor записей
- 3 User записей
- 1 Program запись
- 0 SmsLog записей
- Общий размер: ~184KB

### Проблемы в текущих миграциях
- ✗ SmsLog таблица не создана в миграции (определена в schema.prisma, но отсутствует в SQL)
- ✗ Несколько failed миграций с ошибками (20260528_add_reset_password_fields, 20260531_add_program_model)
- ✗ Миграции работают только с SQLite директивами

### Структура таблиц
```
WikiCategory (id: TEXT PK, label: TEXT)
WikiTerm (id: TEXT PK, title, description, category FK, author, coverUrl, updatedAt)
News (id: INT AI PK, title, summary, content, coverUrl, views, publishedAt)
Short (id: INT AI PK, url: UNIQUE, createdAt)
Instructor (id: INT AI PK, name, specialty, bio, image, slug: UNIQUE, techniques, level, sortOrder)
User (id: INT AI PK, email: UNIQUE, passwordHash, name, phone, phoneVerified, role, createdAt)
SmsLog (id: INT AI PK, phone, ip, userId, createdAt) ← NOT CREATED YET
Program (id: INT AI PK, slug: UNIQUE, title, description, packages, lessonDuration, programDuration, features, isPopular, sortOrder, createdAt, updatedAt)
```

---

## Задачи

### 1. Подготовка и валидация
- [ ] **1.1**: Проверить целостность текущей SQLite БД (количество записей, индексы)
- [ ] **1.2**: Создать backup всех данных (SQL dump + raw database file)
- [ ] **1.3**: Убедиться, что SmsLog таблица создается правильно перед миграцией
- [ ] **1.4**: Обновить prisma/schema.prisma для PostgreSQL синтаксиса (если нужно)
- [ ] **1.5**: Проверить зависимости и версии пакетов

### 2. Миграция схемы
- [ ] **2.1**: Обновить `prisma/schema.prisma` - изменить datasource с `sqlite` на `postgresql`
- [ ] **2.2**: Обновить Prisma client конфиг (adapter-pg вместо adapter-better-sqlite3)
- [ ] **2.3**: Создать новую миграцию Prisma для PostgreSQL
- [ ] **2.4**: Убедиться, что все индексы и constraints правильно переносятся
- [ ] **2.5**: Создать миграцию для SmsLog (если её еще нет)

### 3. Экспорт и трансформация данных
- [ ] **3.1**: Экспортировать данные из SQLite в JSON/CSV для каждой таблицы
- [ ] **3.2**: Трансформировать типы данных:
  - DATETIME → timestamp with timezone
  - BOOLEAN (0/1) → boolean
  - JSON строки остаются как есть
- [ ] **3.3**: Обработать специальные значения (NULL, пустые строки)
- [ ] **3.4**: Создать SQL скрипт для импорта в PostgreSQL

### 4. Конфигурация PostgreSQL
- [ ] **4.1**: Локально: создать PostgreSQL сервис (Docker или локальная БД)
- [ ] **4.2**: Обновить `.env.local` с новым DATABASE_URL
  ```
  DATABASE_URL="postgresql://username:password@localhost:5432/vocal_school?schema=public"
  ```
- [ ] **4.3**: Убедиться, что Prisma может подключиться к PostgreSQL

### 5. Импорт данных в PostgreSQL
- [ ] **5.1**: Запустить миграции Prisma для создания схемы
- [ ] **5.2**: Импортировать данные из трансформированного скрипта
- [ ] **5.3**: Проверить целостность данных (количество строк, связи)
- [ ] **5.4**: Запустить Prisma seed если используется

### 6. Обновление Docker & Dockerfile
- [ ] **6.1**: Обновить `docker-compose.yml`:
  - Настроить PostgreSQL сервис (credentials, healthcheck)
  - Обновить app сервис (DATABASE_URL variable, volume mounts)
  - Конфигурировать networking
- [ ] **6.2**: Обновить `Dockerfile`:
  - Удалить sqlite-dev из build stage
  - Заменить adapter-better-sqlite3 на adapter-pg
  - Обновить DATABASE_URL для production
  - Удалить sqlite-libs из runtime
- [ ] **6.3**: Обновить `docker-entrypoint.sh`:
  - Убедиться, что миграции запускаются перед стартом приложения
  - Добавить waitfor logic для БД readiness

### 7. Тестирование локально
- [ ] **7.1**: Запустить docker-compose локально
- [ ] **7.2**: Проверить, что приложение стартует без ошибок
- [ ] **7.3**: Протестировать основные операции:
  - GET endpoints (программы, инструкторы, wiki)
  - POST/PUT/DELETE операции
  - Аутентификация (логин, верификация email)
- [ ] **7.4**: Проверить логи для ошибок

### 8. Очистка и документирование
- [ ] **8.1**: Удалить adapter-better-sqlite3 из package.json
- [ ] **8.2**: Удалить sqlite-dev зависимости из Dockerfile
- [ ] **8.3**: Обновить README.md с инструкциями для PostgreSQL
- [ ] **8.4**: Создать миграционный гайд для production deployment
- [ ] **8.5**: Убедиться, что все окружения правильно настроены

---

## Структура данных для миграции

### Типы данных: SQLite → PostgreSQL

| SQLite | PostgreSQL | Примечания |
|--------|-----------|-----------|
| TEXT | VARCHAR / TEXT | Оставить как есть |
| INTEGER | BIGINT / INT | Auto-increment ID → SERIAL |
| DATETIME | TIMESTAMP WITH TIME ZONE | Конвертировать ISO 8601 |
| BOOLEAN (0/1) | BOOLEAN | Конвертировать числа в true/false |
| JSON array (строка) | JSONB или TEXT | Проверить использование в коде |

### Таблицы для миграции

```sql
-- WikiCategory: 3 записи
INSERT INTO "WikiCategory" (id, label) VALUES (...)

-- WikiTerm: 31 запись
INSERT INTO "WikiTerm" (id, title, description, category, author, coverUrl, updatedAt) VALUES (...)

-- News: 3 записи
INSERT INTO "News" (id, title, summary, content, coverUrl, views, publishedAt) VALUES (...)

-- Short: скорее всего пусто
INSERT INTO "Short" (id, url, createdAt) VALUES (...)

-- Instructor: 4 записи
INSERT INTO "Instructor" (id, name, specialty, ...) VALUES (...)

-- User: 3 записи
INSERT INTO "User" (id, email, passwordHash, ...) VALUES (...)

-- Program: 1 запись
INSERT INTO "Program" (id, slug, title, ...) VALUES (...)
```

---

## Дополнительно: Требования к разработчику

### Знание о проекте, которое может понадобиться
- Структура Prisma адаптеров (better-sqlite3 vs pg)
- PostgreSQL типы данных и миграции
- Docker и docker-compose конфигурация
- Next.js переменные окружения и их загрузка

### Возможные проблемы и решения
1. **Connection pooling**: PostgreSQL использует pg-pool для управления соединениями
2. **Timezone issues**: SQLite хранит даты в UTC, убедиться, что PostgreSQL тоже
3. **Enum types**: Если используются в schema.prisma, PostgreSQL создаст свои типы
4. **Cascade deletes**: Проверить, что все constraints переносятся правильно

### Validation Checklist
- [ ] Все 8 таблиц мигрированы с полными данными
- [ ] Все индексы работают
- [ ] Foreign keys целостны
- [ ] Upsert/unique constraints работают
- [ ] Timestamps корректны (UTC, правильный формат)
- [ ] Application стартует без ошибок подключения
- [ ] Basic CRUD операции работают в приложении

---

## Информация из анализа

**Найденные файлы:**
- `prisma/schema.prisma` - текущая схема (SQLite)
- `prisma/migrations/20250101000000_init/migration.sql` - единственная успешная миграция
- `data/backup.sql` - экспорт текущей БД с данными
- `.env.local` - уже содержит PostgreSQL URL (закомментирован)
- `docker-compose.yml` - уже содержит PostgreSQL сервис
- `Dockerfile` - готов поддерживать оба адаптера

**Зависимости:**
- ✓ @prisma/adapter-pg@7.9.1
- ✓ pg@8.22.0
- ✓ @prisma/client@7.8.0
- ✓ @prisma/adapter-better-sqlite3@7.8.0 (будет удалена)

---

## Успешное завершение

✓ Задача считается завершенной, когда:
1. PostgreSQL развернута локально через docker-compose
2. Все данные успешно мигрированы (количество записей совпадает)
3. Приложение запускается и работает без ошибок БД
4. Основные операции тестированы (GET, POST, DELETE)
5. Docker Dockerfile обновлен и готов к production
6. Документация обновлена
