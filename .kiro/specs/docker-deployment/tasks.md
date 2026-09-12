# Implementation Plan: Docker Deployment

## Overview

Исправляем Dockerfile, добавляем docker-compose.yml с volume для SQLite, выносим `.env` из образа
и обновляем GitHub Actions для деплоя через Docker вместо PM2.

## Tasks

- [x] 1. Исправить Dockerfile: статика, безопасность и запуск
  - [x] 1.1 Убрать `COPY .env .env` из Dockerfile
    - Удалить строку `COPY .env .env` из production-этапа
    - Убедиться, что `.env` и `.env.local` не копируются ни на одном этапе
    - _Requirements: 4.1, 4.4_

  - [x] 1.2 Исправить размещение статических файлов в standalone-режиме
    - Изменить `COPY --from=builder /app/.next/static ./.next/static` на
      `COPY --from=builder /app/.next/static ./standalone/.next/static`
    - Изменить `COPY --from=builder /app/public ./public` на
      `COPY --from=builder /app/public ./standalone/public`
    - _Requirements: 1.1, 1.2_

  - [x] 1.3 Добавить переменные окружения PORT и HOSTNAME
    - Добавить `ENV PORT=3000` и `ENV HOSTNAME=0.0.0.0` в runner-этап
    - Убедиться, что `EXPOSE 3000` присутствует
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.4 Создать директорию `/app/data` с корректными правами
    - Добавить `RUN mkdir -p /app/data && chown -R node:node /app/data`
    - Убедиться, что Node.js-процесс запускается от пользователя `node`
    - _Requirements: 3.5_

  - [x] 1.5 Оптимизировать runner-этап: убрать лишние build-инструменты
    - Убедиться, что в runner-этапе нет `python3`, `make`, `g++`, `cairo-dev`, `jpeg-dev`, `pango-dev`
    - В runner должны быть только runtime-зависимости: `cairo`, `jpeg`, `pango`, `giflib`
    - Убедиться, что `node_modules` копируются из builder, а не устанавливаются заново
    - _Requirements: 7.3, 2.4_

- [x] 2. Создать `.dockerignore`
  - Создать файл `.dockerignore` в корне проекта
  - Включить: `node_modules`, `.next`, `.git`, `.env`, `.env.local`, `.env.production`, `data/`
  - _Requirements: 4.4, 7.2_

- [x] 3. Создать `docker-compose.yml`
  - [x] 3.1 Определить сервис `app` с image, restart и портом
    - Указать `image:` с именем образа (например, `ghcr.io/<owner>/zvuchi-vocal:latest`)
    - Установить `restart: unless-stopped`
    - Пробросить порт `3000:3000`
    - _Requirements: 5.1, 5.2, 5.5, 6.4_

  - [x] 3.2 Подключить env_file для передачи переменных окружения
    - Добавить `env_file: /root/web/zvuchi-vocal/.env` в секцию сервиса
    - Убедиться, что `.env` не монтируется как volume — только читается через `env_file`
    - _Requirements: 4.2_

  - [x] 3.3 Объявить volume `zvuchi_data` и смонтировать в `/app/data`
    - Добавить в секцию `volumes` сервиса: `zvuchi_data:/app/data`
    - Объявить именованный volume в корневой секции `volumes:`
    - _Requirements: 3.1, 3.2_

- [x] 4. Checkpoint — проверить конфигурацию Docker локально
  - Убедиться, что `docker build .` завершается без ошибок
  - Убедиться, что `docker compose up -d` запускает контейнер
  - Проверить, что `http://localhost:3000` отвечает и стили загружаются
  - Убедиться, что `/app/data` существует внутри контейнера
  - Спросить пользователя, если возникнут вопросы.

- [x] 5. Обновить GitHub Actions: добавить сборку и пуш Docker-образа
  - [x] 5.1 Добавить шаг логина в GitHub Container Registry (GHCR)
    - В job `test-and-build` добавить шаг `docker/login-action` для `ghcr.io`
    - Использовать `secrets.GITHUB_TOKEN` для аутентификации
    - _Requirements: 5.4_

  - [x] 5.2 Добавить шаг сборки и пуша образа через `docker/build-push-action`
    - Собирать образ с тегом `ghcr.io/<owner>/zvuchi-vocal:latest`
    - Пушить образ только при пуше в `main` (не на PR)
    - Убедиться, что шаг выполняется после успешного `npm run build`
    - _Requirements: 5.4_

  - [x] 5.3 Раскомментировать и переписать job `deploy`
    - Раскомментировать блок `deploy:` в `.github/workflows/deploy.yml`
    - Убрать шаги `git pull`, `npm i`, `npm rebuild`, `npm run build`, `pm2 restart`
    - Заменить тело скрипта на:
      ```
      cd /root/web/zvuchi-vocal/
      docker compose pull
      docker compose up -d
      ```
    - Убедиться, что `needs: test-and-build` сохранён
    - _Requirements: 5.4_

- [x] 6. Проверить `.gitignore`
  - Убедиться, что `.env` и `.env.local` присутствуют в `.gitignore`
  - Добавить записи, если отсутствуют
  - _Requirements: 4.5_

- [x] 7. Final checkpoint — сквозная проверка деплоя
  - Убедиться, что пуш в `main` запускает CI/CD pipeline
  - Убедиться, что образ собирается и пушится в GHCR
  - Убедиться, что deploy job подключается к серверу и выполняет `docker compose pull && docker compose up -d`
  - Убедиться, что данные SQLite сохраняются после `docker compose up -d` с новым образом
  - Спросить пользователя, если возникнут вопросы.

## Notes

- Задачи 1.1–1.5 исправляют существующий `Dockerfile` — не создают новый
- Образ собирается в GitHub Actions и пушится в GHCR; на сервере только `docker compose pull`
- `env_file` в docker-compose указывает на `/root/web/zvuchi-vocal/.env` на сервере — этот файл не попадает в репозиторий и не запекается в образ
- Volume `zvuchi_data` сохраняет данные SQLite между пересозданиями контейнера
- Задачи, помеченные `*`, отсутствуют — property-based тесты не применимы к конфигурационным файлам
