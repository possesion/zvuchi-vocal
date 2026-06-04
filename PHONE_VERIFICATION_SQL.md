# SQL для добавления верификации телефона

Выполните эти команды на production сервере:

```sql
-- Добавление полей для верификации телефона
ALTER TABLE "User" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "phoneVerifyCode" TEXT;
ALTER TABLE "User" ADD COLUMN "phoneCodeExpires" DATETIME;
```

Для SQLite:
```bash
sqlite3 /path/to/your/wiki.db "ALTER TABLE User ADD COLUMN phoneVerified BOOLEAN NOT NULL DEFAULT 0; ALTER TABLE User ADD COLUMN phoneVerifyCode TEXT; ALTER TABLE User ADD COLUMN phoneCodeExpires DATETIME;"
```

## Переменные окружения

Добавьте в `.env` или `.env.local`:

```env
# SMS Aero API Key
# Получить можно в личном кабинете: https://smsaero.ru/cabinet/settings/apikey/
SMS_AERO_API_KEY=your_api_key_here
```

## Особенности

- Код верификации действителен 5 минут
- Повторная отправка доступна через 60 секунд
- При изменении номера верификация сбрасывается
- Номер телефона хранится в международном формате: +79991234567
