# Requirements Document

## Introduction

Настройка корректного Docker-деплоя для Next.js 15 приложения вокальной студии «Звучи».
Текущий Dockerfile имеет три критических проблемы: статика и `public/` копируются не в ту директорию
(из-за чего не грузятся стили и картинки в standalone-режиме), отсутствует docker-compose (данные SQLite
теряются при перезапуске), и `.env` запекается в образ (небезопасно).

Цель — исправить Dockerfile, добавить docker-compose.yml с volume для SQLite и вынести
чувствительные данные из образа.

## Glossary

- **Dockerfile**: Файл с инструкциями для сборки Docker-образа приложения
- **docker-compose.yml**: Файл оркестрации контейнеров, описывающий сервисы, тома и переменные окружения
- **Standalone-режим**: Режим сборки Next.js (`output: 'standalone'`), при котором генерируется
  самодостаточный сервер в директории `.next/standalone/`
- **Builder**: Многоэтапная сборка Docker — первый этап, в котором компилируется приложение
- **Runner**: Многоэтапная сборка Docker — второй этап, финальный образ для запуска
- **Volume**: Docker-том для персистентного хранения данных вне контейнера
- **better-sqlite3**: Нативный Node.js модуль для работы с SQLite, требующий компиляции под целевую платформу
- **Alpine**: Минималистичный Linux-дистрибутив, используемый как базовый образ
- **env_file**: Директива docker-compose для передачи переменных окружения из файла без запекания в образ
- **Static Assets**: Статические файлы (`_next/static/`, `public/`), обслуживаемые Next.js standalone-сервером
- **SQLite_DB**: База данных SQLite, хранящаяся в директории `/app/data/` внутри контейнера

## Requirements

### Requirement 1: Корректное размещение статических файлов в standalone-режиме

**User Story:** Как пользователь сайта, я хочу чтобы стили и картинки загружались корректно,
чтобы сайт отображался правильно после деплоя через Docker.

#### Acceptance Criteria

1. THE Dockerfile SHALL копировать собранную статику из `.next/static` в директорию
   `standalone/.next/static` финального образа
2. THE Dockerfile SHALL копировать директорию `public/` в директорию `standalone/public`
   финального образа
3. WHEN контейнер запущен, THE Next.js_Server SHALL обслуживать CSS-файлы по пути
   `/_next/static/css/*` с корректным Content-Type `text/css`
4. WHEN контейнер запущен, THE Next.js_Server SHALL обслуживать JS-файлы по пути
   `/_next/static/chunks/*` с корректным Content-Type `application/javascript`
5. WHEN контейнер запущен, THE Next.js_Server SHALL обслуживать файлы из `public/` по их
   исходным путям (например, `/logo-transparent.png`, `/icon.svg`)

---

### Requirement 2: Компиляция better-sqlite3 под Alpine

**User Story:** Как DevOps-инженер, я хочу чтобы нативный модуль better-sqlite3 корректно
компилировался и работал в Alpine-контейнере, чтобы приложение запускалось без ошибок.

#### Acceptance Criteria

1. THE Dockerfile SHALL устанавливать пакеты `python3`, `make`, `g++` на этапе Builder
   для компиляции нативных модулей
2. THE Dockerfile SHALL выполнять `npm rebuild better-sqlite3` на этапе Builder после
   копирования исходного кода
3. THE Dockerfile SHALL устанавливать runtime-зависимости `cairo`, `jpeg`, `pango` на
   этапе Runner
4. WHEN образ собирается на этапе Runner, THE Dockerfile SHALL копировать скомпилированные
   `node_modules` из этапа Builder вместо повторной установки зависимостей
5. IF компиляция better-sqlite3 завершается с ошибкой, THEN THE Docker_Build SHALL
   завершиться с ненулевым кодом выхода и вывести сообщение об ошибке

---

### Requirement 3: Персистентность базы данных SQLite через Docker Volume

**User Story:** Как администратор студии, я хочу чтобы данные базы данных сохранялись
между перезапусками контейнера, чтобы не терять информацию о пользователях и голосованиях.

#### Acceptance Criteria

1. THE docker-compose.yml SHALL объявлять именованный volume `zvuchi_data` для хранения
   данных SQLite
2. THE docker-compose.yml SHALL монтировать volume `zvuchi_data` в директорию `/app/data`
   внутри контейнера
3. WHEN контейнер останавливается и запускается повторно, THE SQLite_DB SHALL сохранять
   все данные, записанные в предыдущей сессии
4. WHEN образ обновляется командой `docker compose pull` и контейнер пересоздаётся,
   THE SQLite_DB SHALL сохранять все существующие данные
5. THE Dockerfile SHALL создавать директорию `/app/data` с корректными правами доступа
   для пользователя, от имени которого запускается Node.js-процесс

---

### Requirement 4: Безопасная передача переменных окружения

**User Story:** Как DevOps-инженер, я хочу чтобы чувствительные данные (секреты, ключи API,
пароли) не запекались в Docker-образ, чтобы образ можно было безопасно хранить в реестре.

#### Acceptance Criteria

1. THE Dockerfile SHALL NOT содержать инструкцию `COPY .env` или `COPY .env.local`
2. THE docker-compose.yml SHALL использовать директиву `env_file` для передачи переменных
   окружения из файла `.env.local` в контейнер во время запуска
3. THE docker-compose.yml SHALL содержать файл `.env.example` (или комментарий) с перечнем
   обязательных переменных окружения без их значений
4. WHEN образ собирается командой `docker build`, THE Builder SHALL NOT включать файлы
   `.env` и `.env.local` в слои образа
5. THE .gitignore SHALL содержать записи для `.env` и `.env.local`, чтобы исключить
   их из системы контроля версий

---

### Requirement 5: Управление контейнером через docker-compose

**User Story:** Как DevOps-инженер, я хочу управлять жизненным циклом контейнера через
docker-compose, чтобы упростить запуск, остановку и обновление приложения на сервере.

#### Acceptance Criteria

1. THE docker-compose.yml SHALL определять сервис `app` с указанием имени образа и
   политики перезапуска `unless-stopped`
2. WHEN выполняется команда `docker compose up -d`, THE Docker_Compose SHALL запустить
   контейнер приложения в фоновом режиме на порту 3000
3. WHEN выполняется команда `docker compose down`, THE Docker_Compose SHALL остановить
   и удалить контейнер, сохранив данные в volume
4. WHEN выполняется последовательность `docker compose pull` и `docker compose up -d`,
   THE Docker_Compose SHALL пересоздать контейнер с новым образом без потери данных SQLite
5. THE docker-compose.yml SHALL пробрасывать порт `3000:3000` для взаимодействия с nginx
   как reverse proxy

---

### Requirement 6: Запуск приложения на порту 3000

**User Story:** Как системный администратор, я хочу чтобы Next.js приложение слушало
порт 3000, чтобы nginx мог проксировать запросы на него без дополнительной настройки.

#### Acceptance Criteria

1. THE Dockerfile SHALL устанавливать переменную окружения `PORT=3000`
2. THE Dockerfile SHALL объявлять `EXPOSE 3000`
3. THE Dockerfile SHALL устанавливать переменную окружения `HOSTNAME=0.0.0.0`, чтобы
   сервер принимал соединения со всех сетевых интерфейсов контейнера
4. WHEN контейнер запущен, THE Next.js_Server SHALL отвечать на HTTP-запросы на порту 3000
5. THE Dockerfile SHALL запускать приложение командой `node standalone/server.js`

---

### Requirement 7: Оптимизация размера и времени сборки образа

**User Story:** Как DevOps-инженер, я хочу чтобы Docker-образ был минимального размера
и собирался за разумное время, чтобы ускорить деплой и снизить потребление ресурсов.

#### Acceptance Criteria

1. THE Dockerfile SHALL использовать многоэтапную сборку (multi-stage build) с этапами
   `builder` и `runner`
2. THE Dockerfile SHALL использовать `.dockerignore` для исключения `node_modules`,
   `.next`, `.git`, `.env*` и других ненужных файлов из контекста сборки
3. THE Runner SHALL NOT содержать инструменты сборки (`python3`, `make`, `g++`,
   `cairo-dev`, `jpeg-dev`, `pango-dev`) — только runtime-зависимости
4. THE Dockerfile SHALL копировать `package*.json` и устанавливать зависимости до
   копирования исходного кода, чтобы использовать кэш слоёв Docker
5. WHEN исходный код изменяется без изменения `package.json`, THE Docker_Build SHALL
   использовать кэшированный слой с `node_modules` и не переустанавливать зависимости
