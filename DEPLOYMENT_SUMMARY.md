# Резюме: Защита Существующих Данных при Развертывании

## 📌 Главное

**Ваши существующие данные на сервере будут сохранены!**

Все скрипты и конфигурация разработаны так, чтобы:
- ✅ Не перезаписывать существующую БД
- ✅ Сохранять данные между перезапусками контейнера
- ✅ Работать с текущими данными без изменений

## 🚀 Быстрый Старт (3 команды)

```bash
# 1. Backup (на всякий случай)
cp /root/web/zvuchi-vocal/data/wiki.db /root/web/zvuchi-vocal/data/wiki.db.backup

# 2. Соберите образ
docker build -t zvuchi-vocal:latest .

# 3. Запустите контейнер
docker run -d \
  --name zvuchi-vocal \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /root/web/zvuchi-vocal/data:/app/data \
  --env-file /root/web/zvuchi-vocal/.env \
  zvuchi-vocal:latest
```

**Готово!** Приложение работает с вашими данными.

## 📚 Документация

### Для быстрого старта:
- **EXISTING_DATA_GUIDE.md** - Краткое руководство (5 минут)

### Для полного понимания:
- **PRODUCTION_DEPLOYMENT.md** - Полное руководство (все сценарии)
- **DOCKER_PRISMA_MIGRATION.md** - Технические детали Docker


## 🔒 Как Данные Защищены

### 1. Seed Скрипт Безопасен

```typescript
// prisma/seed.ts проверяет наличие данных
const existingCategories = await prisma.wikiCategory.count();
if (existingCategories > 0) {
  console.log('⏭️  Database already contains data. Skipping seed...');
}
```

**Результат**: Даже если запустить seed, существующие данные не будут затронуты.

### 2. Volume Сохраняет БД

```bash
-v /root/web/zvuchi-vocal/data:/app/data
```

**Результат**: Файл `wiki.db` на сервере остается нетронутым между перезапусками.

### 3. Prisma Просто Подключается

Prisma не создает новую БД, если она уже существует. Он просто подключается к существующей.

## ✅ Что Было Обновлено

### Файлы Обновлены:
- ✓ `prisma/seed.ts` - Теперь проверяет наличие данных

### Файлы Созданы:
- ✓ `EXISTING_DATA_GUIDE.md` - Краткое руководство
- ✓ `PRODUCTION_DEPLOYMENT.md` - Полное руководство
- ✓ `DEPLOYMENT_SUMMARY.md` - Этот файл

### Проверено:
- ✓ Все тесты проходят (23/23)
- ✓ Приложение собирается успешно
- ✓ Docker образ собирается успешно

## 🎯 Пошаговый Процесс

### На Локальной Машине:

```bash
# 1. Обновите код
git pull origin main

# 2. Соберите Docker образ
docker build -t zvuchi-vocal:latest .

# 3. Протестируйте локально (опционально)
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data zvuchi-vocal:latest
```

### На Production Сервере:

```bash
# 1. Перейдите в директорию проекта
cd /root/web/zvuchi-vocal/

# 2. Обновите код
git pull origin main

# Или вручную:
# - Backup БД
# - Соберите образ
# - Запустите контейнер с volume
```

## 🔄 Обновление Приложения

Когда нужно обновить приложение:

```bash
# 1. Backup
cp data/wiki.db data/wiki.db.backup

# 2. Обновите код
git pull origin main

# 3. Соберите новый образ
docker build -t zvuchi-vocal:latest .

# 4. Перезапустите контейнер
docker stop zvuchi-vocal
docker rm zvuchi-vocal
docker run -d ... zvuchi-vocal:latest

# Ваши данные остаются нетронутыми!
```

## 🆘 Если Что-то Пошло Не Так

### Приложение не запускается

```bash
# Проверьте логи
docker logs zvuchi-vocal

# Восстановите из backup
cp data/wiki.db.backup data/wiki.db

# Перезапустите
docker restart zvuchi-vocal
```

### Данные не видны

```bash
# Проверьте, что БД файл существует
ls -la /root/web/zvuchi-vocal/data/wiki.db

# Проверьте volume
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

## 📋 Чек-лист Перед Развертыванием

- [ ] Прочитали EXISTING_DATA_GUIDE.md
- [ ] Сделали backup существующей БД
- [ ] Обновили код (git pull)
- [ ] Собрали новый Docker образ
- [ ] Остановили старый контейнер
- [ ] Запустили новый контейнер с volume
- [ ] Проверили логи (нет ошибок)
- [ ] Проверили, что приложение доступно
- [ ] Проверили, что данные видны в приложении

## 💡 Ключевые Моменты

### ✅ Делайте Так:

```bash
# Используйте volume для сохранения БД
-v /root/web/zvuchi-vocal/data:/app/data

# Делайте backup перед развертыванием
cp data/wiki.db data/wiki.db.backup

# Проверяйте логи после развертывания
docker logs zvuchi-vocal
```

### ❌ Не Делайте Так:

```bash
# Не удаляйте data/wiki.db перед развертыванием
rm data/wiki.db  # ❌ НЕПРАВИЛЬНО!

# Не забывайте про volume
docker run ... zvuchi-vocal:latest  # ❌ БД потеряется!

# Не используйте prisma migrate reset
npx prisma migrate reset  # ❌ Удалит все данные!
```

## 📞 Поддержка

Если возникли вопросы:

1. Прочитайте **EXISTING_DATA_GUIDE.md** (краткое руководство)
2. Прочитайте **PRODUCTION_DEPLOYMENT.md** (полное руководство)
3. Проверьте логи: `docker logs zvuchi-vocal`
4. Восстановите из backup если нужно

## 🎯 Итоговый Результат

После развертывания:

✅ Приложение работает с Prisma ORM
✅ Все существующие данные сохранены
✅ Приложение работает как раньше
✅ Данные сохраняются между перезапусками
✅ Готово к production использованию

## 📝 Файлы для Справки

```
EXISTING_DATA_GUIDE.md          ← Начните отсюда!
PRODUCTION_DEPLOYMENT.md        ← Полное руководство
DOCKER_PRISMA_MIGRATION.md      ← Технические детали
DEPLOYMENT_SUMMARY.md           ← Этот файл
```

---

**Главное**: Используйте volume для сохранения БД, и ваши данные будут в безопасности! 🔒

```bash
-v /root/web/zvuchi-vocal/data:/app/data
```

**Готово к развертыванию!** ✅
