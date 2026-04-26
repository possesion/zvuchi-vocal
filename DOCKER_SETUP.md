# Docker Setup для Zvuchi Vocal

## Описание

Этот Dockerfile настроен для production-деплоя Next.js приложения с SQLite базой данных.

## Требования

- Docker 20.10+
- Docker Compose (опционально)

## Структура

- **Build stage**: Компилирует приложение с Node.js 23
- **Production stage**: Минимальный образ только с runtime зависимостями
- **Volume**: `/app/data` для сохранения БД между перезапусками

## Локальное тестирование

### Сборка образа

```bash
docker build -t zvuchi-vocal:latest .
```

### Запуск контейнера

```bash
docker run -d \
  --name zvuchi-vocal \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  zvuchi-vocal:latest
```

### Проверка логов

```bash
docker logs -f zvuchi-vocal
```

### Остановка контейнера

```bash
docker stop zvuchi-vocal
docker rm zvuchi-vocal
```

## Production деплой

Деплой автоматизирован через GitHub Actions. При push в `main`:

1. Создается backup БД
2. Собирается Docker образ
3. Старый контейнер останавливается
4. Запускается новый контейнер с volume для БД

### Ручной деплой на сервере

```bash
cd /root/web/zvuchi-vocal/

# Backup БД
bash scripts/backup-db.sh

# Сборка образа
docker build -t zvuchi-vocal:latest .

# Остановка старого контейнера
docker stop zvuchi-vocal || true
docker rm zvuchi-vocal || true

# Запуск нового контейнера
docker run -d \
  --name zvuchi-vocal \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /root/web/zvuchi-vocal/data:/app/data \
  --env-file .env \
  zvuchi-vocal:latest
```

## Backup БД

Скрипт `scripts/backup-db.sh` автоматически:
- Создает backup БД перед деплоем
- Хранит последние 7 дней backups в `/root/web/zvuchi-vocal/backups/`
- Удаляет старые backups

Запуск вручную:
```bash
bash scripts/backup-db.sh
```

## Nginx конфигурация

Убедись, что Nginx проксирует запросы на контейнер:

```nginx
server {
    listen 80;
    server_name zvuchi-vocal.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Health Check

Контейнер имеет встроенный health check, который проверяет `/api/health` каждые 30 секунд.

Проверить статус:
```bash
docker ps --filter "name=zvuchi-vocal"
```

## Переменные окружения

Все переменные из `.env` автоматически загружаются в контейнер через флаг `--env-file`.

Критичные переменные:
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` — для работы с S3
- `EMAIL_*` — для отправки писем
- `TOCHKA_*` — для платежей

## Troubleshooting

### Контейнер не запускается

```bash
docker logs zvuchi-vocal
```

### БД не сохраняется между перезапусками

Проверь, что volume правильно смонтирован:
```bash
docker inspect zvuchi-vocal | grep -A 5 Mounts
```

### Нужно очистить все Docker ресурсы

```bash
docker stop zvuchi-vocal
docker rm zvuchi-vocal
docker rmi zvuchi-vocal:latest
```

## Дополнительно

- Образ использует Alpine Linux для минимального размера
- Multi-stage build оптимизирует финальный размер образа
- `--restart unless-stopped` гарантирует автоматический перезапуск при сбое
