# Пересборка Docker образа

Если у тебя возникла ошибка "Failed to find Server Action", нужно пересобрать Docker образ с очисткой кэша.

## На удаленном сервере:

```bash
cd /root/web/zvuchi-vocal/

# Остановить текущий контейнер
docker stop zvuchi-vocal || true
docker rm zvuchi-vocal || true

# Удалить старый образ (опционально)
docker rmi zvuchi-vocal:latest || true

# Пересобрать образ (кэш будет очищен в Dockerfile)
docker build -t zvuchi-vocal:latest .

# Запустить новый контейнер
docker run -d \
  --name zvuchi-vocal \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /root/web/zvuchi-vocal/data:/app/data \
  --env-file .env \
  zvuchi-vocal:latest

# Проверить логи
docker logs -f zvuchi-vocal
```

## Или через GitHub Actions:

Просто сделай новый push в `main` ветку:

```bash
git add .
git commit -m "Fix: Clear Next.js cache in Dockerfile"
git push origin main
```

GitHub Actions автоматически пересоберет образ с очисткой кэша.
