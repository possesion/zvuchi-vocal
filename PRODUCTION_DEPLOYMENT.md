# Production Deployment Guide - Сохранение Существующих Данных

## 🎯 Главное правило

**Никогда не перезаписывайте существующую `data/wiki.db`!**

Все скрипты и конфигурация разработаны так, чтобы сохранять существующие данные.

## 📋 Способы развертывания

### Способ 1: Docker с существующей БД (РЕКОМЕНДУЕТСЯ)

Это самый безопасный способ - используйте существующую БД как есть:

```bash
# 1. Сделайте backup существующей БД
cp /root/web/zvuchi-vocal/data/wiki.db /root/web/zvuchi-vocal/data/wiki.db.backup

# 2. Соберите новый Docker образ
docker build -t zvuchi-vocal:latest .

# 3. Остановите старый контейнер
docker stop zvuchi-vocal || true
docker rm zvuchi-vocal || true

# 4. Запустите новый контейнер с существующей БД
docker run -d \
  --name zvuchi-vocal \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /root/web/zvuchi-vocal/data:/app/data \
  --env-file /root/web/zvuchi-vocal/.env \
  zvuchi-vocal:latest

# 5. Проверьте логи
docker logs -f zvuchi-vocal
```

**Что происходит**:
- ✅ Prisma подключится к существующей БД
- ✅ Все существующие данные сохранятся
- ✅ Приложение будет работать с текущими данными
- ✅ Никакие данные не будут перезаписаны

### Способ 2: Docker Compose

Если используете `docker-compose.yml`:

```bash
# 1. Backup БД
cp data/wiki.db data/wiki.db.backup

# 2. Обновите образ
docker-compose pull

# 3. Перезапустите контейнер
docker-compose down
docker-compose up -d

# 4. Проверьте логи
docker-compose logs -f app
```

**Важно**: Убедитесь, что в `docker-compose.yml` volume правильно смонтирован:

```yaml
volumes:
  - zvuchi_data:/app/data  # Это сохранит данные между перезапусками
```

### Способ 3: Локальное развертывание (для тестирования)

Если тестируете локально перед деплоем:

```bash
# 1. Установите зависимости
npm install

# 2. Сгенерируйте Prisma Client
npx prisma generate

# 3. Запустите приложение (БД не будет перезаписана)
npm run dev
```

## 🔒 Защита от перезаписи данных

### Seed скрипт теперь безопасен

Обновленный `prisma/seed.ts` проверяет, есть ли уже данные в БД:

```typescript
// Проверяет количество категорий и терминов
const existingCategories = await prisma.wikiCategory.count();
const existingTerms = await prisma.wikiTerm.count();

// Если данные есть - пропускает seed
if (existingCategories > 0 && existingTerms > 0) {
  console.log('⏭️  Database already contains data. Skipping seed...');
}
```

**Результат**: Даже если случайно запустить `npx prisma db seed`, существующие данные не будут затронуты.

### Миграции не трогают данные

Prisma миграции только изменяют структуру БД, не трогая данные:

```bash
# Безопасно запустить на сервере
npx prisma migrate deploy

# Это применит только новые миграции, если они есть
# Существующие данные останутся нетронутыми
```

## 📊 Проверка данных после развертывания

### 1. Проверьте, что приложение видит данные

```bash
# Проверьте логи контейнера
docker logs zvuchi-vocal | grep -i "database\|error"

# Должны увидеть успешное подключение к БД
```

### 2. Проверьте через API

```bash
# Получите список категорий
curl http://localhost:3000/api/v1/wiki

# Должны увидеть существующие категории и термины
```

### 3. Проверьте через веб-интерфейс

```bash
# Откройте в браузере
http://localhost:3000/wiki

# Должны увидеть все существующие данные
```

## ⚠️ Что НЕ нужно делать

❌ **НЕ удаляйте** `data/wiki.db` перед развертыванием
❌ **НЕ запускайте** `npx prisma db push` (это может перезаписать схему)
❌ **НЕ используйте** `npx prisma migrate reset` (это удалит все данные!)
❌ **НЕ монтируйте** volume неправильно в Docker

## ✅ Что нужно делать

✅ **Сделайте backup** перед развертыванием
✅ **Используйте volume** для сохранения БД между перезапусками
✅ **Проверьте логи** после развертывания
✅ **Тестируйте локально** перед production деплоем

## 🔄 Процесс обновления приложения

Когда нужно обновить приложение на сервере:

```bash
# 1. Backup БД
cp /root/web/zvuchi-vocal/data/wiki.db /root/web/zvuchi-vocal/backups/wiki.db.$(date +%Y%m%d_%H%M%S)

# 2. Соберите новый образ
docker build -t zvuchi-vocal:latest .

# 3. Остановите старый контейнер
docker stop zvuchi-vocal

# 4. Запустите новый контейнер
docker run -d \
  --name zvuchi-vocal \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /root/web/zvuchi-vocal/data:/app/data \
  --env-file /root/web/zvuchi-vocal/.env \
  zvuchi-vocal:latest

# 5. Проверьте, что приложение запустилось
sleep 5
docker logs zvuchi-vocal | tail -20

# 6. Если есть ошибки - откатитесь
# docker stop zvuchi-vocal
# docker rm zvuchi-vocal
# docker run -d ... (старый образ)
```

## 🆘 Если что-то пошло не так

### Сценарий 1: Приложение не запускается

```bash
# Проверьте логи
docker logs zvuchi-vocal

# Если ошибка в БД - проверьте backup
ls -la /root/web/zvuchi-vocal/backups/

# Восстановите из backup
cp /root/web/zvuchi-vocal/backups/wiki.db.YYYYMMDD_HHMMSS /root/web/zvuchi-vocal/data/wiki.db

# Перезапустите контейнер
docker restart zvuchi-vocal
```

### Сценарий 2: Данные не видны в приложении

```bash
# Проверьте, что БД файл существует
ls -la /root/web/zvuchi-vocal/data/wiki.db

# Проверьте права доступа
stat /root/web/zvuchi-vocal/data/wiki.db

# Проверьте, что volume правильно смонтирован
docker inspect zvuchi-vocal | grep -A 5 Mounts

# Должно быть:
# "Source": "/root/web/zvuchi-vocal/data",
# "Destination": "/app/data"
```

### Сценарий 3: Нужно откатиться на старую версию

```bash
# 1. Остановите текущий контейнер
docker stop zvuchi-vocal
docker rm zvuchi-vocal

# 2. Восстановите БД из backup
cp /root/web/zvuchi-vocal/backups/wiki.db.backup /root/web/zvuchi-vocal/data/wiki.db

# 3. Запустите старый образ
docker run -d \
  --name zvuchi-vocal \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /root/web/zvuchi-vocal/data:/app/data \
  --env-file /root/web/zvuchi-vocal/.env \
  zvuchi-vocal:old-version
```

## 📝 Переменные окружения

Убедитесь, что в `.env` файле установлены правильные переменные:

```bash
# Обязательные
DATABASE_URL="file:./data/wiki.db"

# Опциональные (для seed скрипта)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure_password"

# Другие переменные
S3_ENDPOINT="..."
S3_BUCKET="..."
# и т.д.
```

## 🎯 Итоговый чек-лист перед деплоем

- [ ] Сделан backup существующей БД
- [ ] Новый Docker образ собран успешно
- [ ] Проверены логи сборки (нет ошибок)
- [ ] Старый контейнер остановлен
- [ ] Новый контейнер запущен с правильным volume
- [ ] Проверены логи контейнера (нет ошибок)
- [ ] Приложение доступно по адресу
- [ ] Существующие данные видны в приложении
- [ ] API endpoints работают
- [ ] Веб-интерфейс загружается

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи: `docker logs zvuchi-vocal`
2. Проверьте volume: `docker inspect zvuchi-vocal | grep -A 5 Mounts`
3. Проверьте БД файл: `ls -la /root/web/zvuchi-vocal/data/`
4. Восстановите из backup если нужно
5. Обратитесь к документации: `DOCKER_PRISMA_MIGRATION.md`

---

**Главное**: Все скрипты и конфигурация разработаны так, чтобы **сохранять существующие данные**. Просто используйте volume для сохранения БД между перезапусками!
