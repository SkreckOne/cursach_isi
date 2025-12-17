-- =========================================================
-- СКРИПТ ПОЛНОЙ ОЧИСТКИ БАЗЫ ДАННЫХ
-- Удаляет таблицы, типы, функции, процедуры и индексы
-- =========================================================

-- 1. Удаление таблиц
-- CASCADE автоматически удалит связанные с таблицами индексы и триггеры
DROP TABLE IF EXISTS
    messages,
    attachments,
    disputes,
    transactions,
    reviews,
    orders,
    collector_work_methods,
    work_methods,
    customer_profiles,
    collector_profiles,
    users,
    roles
    CASCADE;

-- 2. Удаление кастомных типов (ENUM)
DROP TYPE IF EXISTS
    user_role,
    verification_status,
    order_status,
    transaction_type,
    dispute_status
    CASCADE;

-- 3. Удаление функций (из pqsql_func.sql и triggers.sql)
-- CASCADE удалит триггеры, использующие эти функции
DROP FUNCTION IF EXISTS create_new_order(UUID, UUID, TEXT, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS update_collector_average_rating() CASCADE;

-- 4. Удаление процедур (из pqsql_func.sql)
DROP PROCEDURE IF EXISTS complete_order_and_process_payment(UUID, UUID) CASCADE;

-- 5. Удаление индексов (из indexes.sql)
-- Обычно они удаляются вместе с таблицами, но для гарантии пропишем явно
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_collector_profiles_region;
DROP INDEX IF EXISTS idx_collector_profiles_average_rating;
DROP INDEX IF EXISTS idx_reviews_collector_id;

-- 6. Очистка (опционально, если использовались расширения)
-- DROP EXTENSION IF EXISTS "uuid-ossp";