# Как использовать существующие данные на сервере

## 🎯 Краткий ответ

**Просто используйте существующую `data/wiki.db` как есть!** Все скрипты разработаны так, чтобы сохранять существующие данные.

## 📋 Три простых шага

### Шаг 1: Backup (на всякий случай)

```bash
cp /root/web/zvuchi-vocal/data/wiki.db /root/web/zvuchi-vocal/data/wiki.db.backup
```

### Шаг 2: Соберите новый Docker образ

```bash
docker build -t zvuchi-vocal:latest .
```

### Шаг 3: Запустите контейнер с существующей БД

```bash
docker run -d \
  --name zvuchi-vocal \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /root/web/zvuchi-vocal/data:/app/data \
  --env-file /root/web/zvuchi-vocal/.env \
  zvuchi-vocal:latest
```

**Готово!** Приложение будет работать с вашими существующими данными.

## ✅ Что происходит

- ✓ Prisma подключится к существующей БД
- ✓ Все существующие данные сохранятся
- ✓ Никакие данные не будут перезаписаны
- ✓ Приложение будет работать как раньше

## 🔒 Почему данные безопасны

### 1. Seed скрипт проверяет наличие данных

```typescript
// Если в БД уже есть данные - seed пропускается
const existingCategories = await prisma.wikiCategory.count();
if (existingCategories > 0) {
  console.log('⏭️  Database already contains data. Skipping seed...');
}
```

### 2. Volume сохраняет БД между перезапусками

```bash
-v /root/web/zvuchi-vocal/data:/app/data
```

Это означает, что файл `wiki.db` на сервере остается нетронутым.

### 3. Prisma не перезаписывает существующие данные

Prisma просто подключается к существующей БД и работает с текущими данными.

## 🚀 Полный процесс развертывания

```bash
# 1. Перейдите в директорию проекта
cd /root/web/zvuchi-vocal/

# 2. Сделайте backup
cp data/wiki.db data/wiki.db.backup

# 3. Соберите новый образ
docker build -t zvuchi-vocal:latest .

# 4. Остановите старый контейнер
docker stop zvuchi-vocal || true
docker rm zvuchi-vocal || true

# 5. Запустите новый контейнер
docker run -d \
  --name zvuchi-vocal \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /root/web/zvuchi-vocal/data:/app/data \
  --env-file /root/web/zvuchi-vocal/.env \
  zvuchi-vocal:latest

# 6. Проверьте логи
docker logs -f zvuchi-vocal

# 7. Проверьте, что приложение работает
curl http://localhost:3000/api/v1/wiki
```

## 📊 Проверка данных

### Через API

```bash
# Получите список категорий и терминов
curl http://localhost:3000/api/v1/wiki

# Должны увидеть ваши существующие данные
```

### Через веб-интерфейс

```bash
# Откройте в браузере
http://localhost:3000/wiki

# Должны увидеть все существующие данные
```

### Через логи контейнера

```bash
docker logs zvuchi-vocal | grep -i "database\|error"

# Должны увидеть успешное подключение к БД
```

## ⚠️ Что НЕ нужно делать

❌ **НЕ удаляйте** `data/wiki.db` перед развертыванием
❌ **НЕ запускайте** `npx prisma db push` (может перезаписать схему)
❌ **НЕ используйте** `npx prisma migrate reset` (удалит все данные!)
❌ **НЕ забывайте** про volume в Docker команде

## 🆘 Если что-то пошло не так

### Приложение не запускается

```bash
# Проверьте логи
docker logs zvuchi-vocal

# Восстановите из backup
cp data/wiki.db.backup data/wiki.db

# Перезапустите контейнер
docker restart zvuchi-vocal
```

### Данные не видны

```bash
# Проверьте, что БД файл существует
ls -la /root/web/zvuchi-vocal/data/wiki.db

# Проверьте, что volume правильно смонтирован
docker inspect zvuchi-vocal | grep -A 5 Mounts

# Должно быть:
# "Source": "/root/web/zvuchi-vocal/data",
# "Destination": "/app/data"
```

### Нужно откатиться

```bash
# Остановите текущий контейнер
docker stop zvuchi-vocal
docker rm zvuchi-vocal

# Восстановите БД
cp data/wiki.db.backup data/wiki.db

# Запустите старый образ
docker run -d ... zvuchi-vocal:old-version
```

## 📝 Важные файлы

- `PRODUCTION_DEPLOYMENT.md` - Полное руководство по развертыванию
- `DOCKER_PRISMA_MIGRATION.md` - Детали Docker конфигурации
- `prisma/seed.ts` - Seed скрипт (безопасен для существующих данных)

## 🎯 Итоговый чек-лист

- [ ] Сделан backup `data/wiki.db`
- [ ] Новый Docker образ собран
- [ ] Старый контейнер остановлен
- [ ] Новый контейнер запущен с volume
- [ ] Логи контейнера проверены (нет ошибок)
- [ ] Приложение доступно
- [ ] Существующие данные видны в приложении

## 💡 Главное правило

**Используйте volume для сохранения БД между перезапусками!**

```bash
-v /root/web/zvuchi-vocal/data:/app/data
```

Это гарантирует, что ваши данные останутся нетронутыми.

---

**Все просто**: Backup → Собрать образ → Запустить с volume → Готово! ✅
