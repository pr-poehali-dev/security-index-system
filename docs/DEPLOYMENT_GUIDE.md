# Руководство по развертыванию базы данных

Пошаговая инструкция по созданию и настройке базы данных для системы управления промышленной безопасностью.

---

## 📋 Требования

### Минимальные системные требования:
- **PostgreSQL:** версия 14 или выше
- **Диск:** минимум 10 GB свободного места
- **RAM:** минимум 2 GB для PostgreSQL
- **CPU:** 2+ ядра рекомендуется

### Дополнительное ПО:
- `psql` (PostgreSQL client) для выполнения SQL-скриптов
- Опционально: GUI клиент (pgAdmin, DBeaver, TablePlus)

---

## 🚀 Шаг 1: Установка PostgreSQL

### На Linux (Ubuntu/Debian):
```bash
# Установка PostgreSQL 14
sudo apt update
sudo apt install postgresql-14 postgresql-contrib-14

# Запуск службы
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### На macOS:
```bash
# Через Homebrew
brew install postgresql@14
brew services start postgresql@14
```

### На Windows:
1. Скачать установщик с [postgresql.org](https://www.postgresql.org/download/windows/)
2. Запустить установщик и следовать инструкциям
3. Запомнить пароль для пользователя `postgres`

---

## 🗄️ Шаг 2: Создание базы данных

### 2.1. Подключение к PostgreSQL
```bash
# Подключение к PostgreSQL как суперпользователь
sudo -u postgres psql
```

### 2.2. Создание базы данных и пользователя
```sql
-- Создание базы данных
CREATE DATABASE industrial_safety_db
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'ru_RU.UTF-8'
    LC_CTYPE = 'ru_RU.UTF-8'
    TEMPLATE = template0;

-- Создание пользователя
CREATE USER app_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Предоставление прав
GRANT ALL PRIVILEGES ON DATABASE industrial_safety_db TO app_user;

-- Выход
\q
```

### 2.3. Настройка доступа (опционально)
Отредактируйте `pg_hba.conf` для разрешения подключений:
```bash
# Найти файл конфигурации
sudo -u postgres psql -c "SHOW hba_file;"

# Добавить строку (для локальных подключений):
# local   industrial_safety_db   app_user   md5
```

---

## 📝 Шаг 3: Развертывание схемы

### 3.1. Скачивание SQL-скриптов
Убедитесь, что у вас есть файлы:
- `DATABASE_SCHEMA.sql` - схема базы данных
- `SAMPLE_DATA.sql` - тестовые данные (опционально)

### 3.2. Выполнение скрипта схемы
```bash
# Способ 1: Через psql
psql -U app_user -d industrial_safety_db -f docs/DATABASE_SCHEMA.sql

# Способ 2: Если требуется ввести пароль
PGPASSWORD=your_secure_password_here psql -U app_user -d industrial_safety_db -f docs/DATABASE_SCHEMA.sql

# Способ 3: Через суперпользователя postgres
sudo -u postgres psql -d industrial_safety_db -f docs/DATABASE_SCHEMA.sql
```

### 3.3. Проверка создания схемы
```bash
psql -U app_user -d industrial_safety_db
```

```sql
-- Проверить количество таблиц
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Должно быть около 50+ таблиц

-- Проверить список таблиц
\dt

-- Выход
\q
```

---

## 🧪 Шаг 4: Загрузка тестовых данных (опционально)

### 4.1. Выполнение скрипта тестовых данных
```bash
psql -U app_user -d industrial_safety_db -f docs/SAMPLE_DATA.sql
```

### 4.2. Проверка данных
```bash
psql -U app_user -d industrial_safety_db
```

```sql
-- Проверка загруженных данных
SELECT 'Тенантов:' as entity, COUNT(*) as count FROM tenant
UNION ALL SELECT 'Организаций:', COUNT(*) FROM organization
UNION ALL SELECT 'Пользователей:', COUNT(*) FROM system_user
UNION ALL SELECT 'Персонала:', COUNT(*) FROM personnel
UNION ALL SELECT 'Инцидентов:', COUNT(*) FROM incident;

-- Выход
\q
```

---

## 🔧 Шаг 5: Настройка производительности

### 5.1. Оптимизация параметров PostgreSQL

Отредактируйте `postgresql.conf`:
```bash
# Найти файл конфигурации
sudo -u postgres psql -c "SHOW config_file;"

# Открыть для редактирования
sudo nano /путь/к/postgresql.conf
```

Рекомендуемые настройки для средней нагрузки:
```ini
# Память
shared_buffers = 256MB          # 25% от RAM
effective_cache_size = 1GB      # 50-75% от RAM
work_mem = 16MB
maintenance_work_mem = 128MB

# Параллелизм
max_connections = 100
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4

# Журналирование
wal_level = replica
max_wal_size = 1GB
min_wal_size = 80MB

# Чекпоинты
checkpoint_completion_target = 0.9
```

Перезапустите PostgreSQL после изменений:
```bash
sudo systemctl restart postgresql
```

### 5.2. Анализ таблиц
```bash
psql -U app_user -d industrial_safety_db
```

```sql
-- Обновление статистики для оптимизатора запросов
VACUUM ANALYZE;

-- Или для конкретных таблиц
VACUUM ANALYZE tenant;
VACUUM ANALYZE organization;
VACUUM ANALYZE personnel;
VACUUM ANALYZE incident;
```

---

## 🔐 Шаг 6: Безопасность

### 6.1. Создание роли только для чтения (для отчётов)
```sql
-- Создание роли
CREATE ROLE readonly_user WITH LOGIN PASSWORD 'readonly_password';

-- Предоставление прав SELECT
GRANT CONNECT ON DATABASE industrial_safety_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Для будущих таблиц
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT ON TABLES TO readonly_user;
```

### 6.2. Настройка SSL (для продакшн)
```bash
# В postgresql.conf
ssl = on
ssl_cert_file = '/путь/к/server.crt'
ssl_key_file = '/путь/к/server.key'
```

### 6.3. Регулярные бэкапы
```bash
# Создание бэкапа
pg_dump -U app_user -d industrial_safety_db -F c -f backup_$(date +%Y%m%d).dump

# Восстановление из бэкапа
pg_restore -U app_user -d industrial_safety_db -c backup_20241013.dump
```

---

## 📊 Шаг 7: Тестирование

### 7.1. Выполнение тестовых запросов
```bash
psql -U app_user -d industrial_safety_db -f docs/USEFUL_QUERIES.sql
```

### 7.2. Проверка производительности
```sql
-- Анализ медленных запросов
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 7.3. Проверка индексов
```sql
-- Неиспользуемые индексы
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;

-- Размер индексов
SELECT
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

---

## 🌐 Шаг 8: Подключение приложения

### 8.1. Строка подключения

**Node.js / TypeScript:**
```typescript
const connectionString = 'postgresql://app_user:your_password@localhost:5432/industrial_safety_db';
```

**Python:**
```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="industrial_safety_db",
    user="app_user",
    password="your_password",
    port=5432
)
```

**Java:**
```java
String url = "jdbc:postgresql://localhost:5432/industrial_safety_db";
Properties props = new Properties();
props.setProperty("user", "app_user");
props.setProperty("password", "your_password");
Connection conn = DriverManager.getConnection(url, props);
```

### 8.2. Пулы подключений

**Node.js (pg pool):**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  database: 'industrial_safety_db',
  user: 'app_user',
  password: 'your_password',
  port: 5432,
  max: 20, // максимум подключений
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Python (psycopg2 pool):**
```python
from psycopg2 import pool

connection_pool = pool.SimpleConnectionPool(
    1, 20,  # мин и макс подключений
    host="localhost",
    database="industrial_safety_db",
    user="app_user",
    password="your_password",
    port=5432
)
```

---

## 🔍 Шаг 9: Мониторинг

### 9.1. Включение расширения pg_stat_statements
```sql
-- В postgresql.conf добавить:
shared_preload_libraries = 'pg_stat_statements'

-- Перезапустить PostgreSQL, затем:
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### 9.2. Мониторинг активных подключений
```sql
-- Текущие подключения
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'industrial_safety_db';

-- Количество подключений по базе
SELECT 
    datname,
    COUNT(*) as connections
FROM pg_stat_activity
GROUP BY datname;
```

### 9.3. Мониторинг размера базы
```sql
-- Размер базы данных
SELECT 
    pg_size_pretty(pg_database_size('industrial_safety_db')) as db_size;

-- Размеры таблиц
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

---

## 📅 Шаг 10: Регулярное обслуживание

### 10.1. Настройка автоматического VACUUM
```sql
-- Проверка настроек autovacuum
SHOW autovacuum;

-- В postgresql.conf:
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
```

### 10.2. Скрипт для регулярного бэкапа (cron)
```bash
#!/bin/bash
# /usr/local/bin/backup_db.sh

BACKUP_DIR="/var/backups/postgresql"
DB_NAME="industrial_safety_db"
DB_USER="app_user"
DATE=$(date +%Y%m%d_%H%M%S)

# Создание бэкапа
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/backup_$DATE.dump

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete

echo "Backup completed: backup_$DATE.dump"
```

Добавить в crontab:
```bash
# Запускать каждый день в 2:00 ночи
0 2 * * * /usr/local/bin/backup_db.sh
```

### 10.3. Мониторинг здоровья базы
```sql
-- Вздутие таблиц (bloat)
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    n_dead_tup,
    n_live_tup,
    ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

---

## 🆘 Устранение проблем

### Проблема: "FATAL: Peer authentication failed"
**Решение:**
Измените метод аутентификации в `pg_hba.conf`:
```
# Было:
local   all   all   peer

# Стало:
local   all   all   md5
```

### Проблема: "Connection refused"
**Решение:**
Проверьте, запущен ли PostgreSQL:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Проблема: "Too many connections"
**Решение:**
Увеличьте `max_connections` в `postgresql.conf`:
```ini
max_connections = 200
```
Перезапустите PostgreSQL.

### Проблема: Медленные запросы
**Решение:**
1. Обновите статистику: `VACUUM ANALYZE;`
2. Проверьте отсутствующие индексы
3. Проанализируйте план выполнения: `EXPLAIN ANALYZE <ваш_запрос>;`

---

## 📚 Дополнительные ресурсы

### Документация:
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/security.html)

### Инструменты:
- **pgAdmin** - GUI для управления PostgreSQL
- **DBeaver** - универсальный клиент баз данных
- **pg_stat_statements** - анализ производительности запросов
- **pgBadger** - анализ логов PostgreSQL

### Полезные команды psql:
```sql
\l              -- Список баз данных
\dt             -- Список таблиц
\d table_name   -- Структура таблицы
\di             -- Список индексов
\du             -- Список пользователей
\timing on      -- Включить измерение времени выполнения
\x              -- Расширенный вывод (вертикальный)
\q              -- Выход
```

---

## ✅ Чеклист развертывания

- [ ] PostgreSQL 14+ установлен и запущен
- [ ] База данных `industrial_safety_db` создана
- [ ] Пользователь `app_user` создан с правами
- [ ] Схема базы данных развернута (`DATABASE_SCHEMA.sql`)
- [ ] Тестовые данные загружены (`SAMPLE_DATA.sql`) - опционально
- [ ] Индексы созданы и проанализированы (`VACUUM ANALYZE`)
- [ ] Параметры производительности настроены (`postgresql.conf`)
- [ ] Роль для чтения создана (если нужна)
- [ ] Скрипт бэкапа настроен (cron)
- [ ] Приложение успешно подключается к БД
- [ ] Тестовые запросы выполнены успешно
- [ ] Мониторинг настроен (pg_stat_statements)

---

## 🎉 Готово!

База данных успешно развернута и готова к работе. 

Для вопросов и поддержки обращайтесь к документации проекта.
