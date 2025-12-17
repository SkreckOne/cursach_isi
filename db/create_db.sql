-- Очистка старого (если нужно пересоздать с нуля)
DROP TABLE IF EXISTS messages, attachments, disputes, transactions, reviews, orders, collector_work_methods, work_methods, customer_profiles, collector_profiles, users, roles CASCADE;
DROP TYPE IF EXISTS user_role, verification_status, order_status, transaction_type, dispute_status;

-- 1. Создание ENUM типов (Важно: user_role маленькими буквами!)
CREATE TYPE user_role AS ENUM ('customer', 'collector', 'admin');
CREATE TYPE verification_status AS ENUM ('not_verified', 'pending', 'verified', 'rejected');
-- Добавили новые статусы заказа
CREATE TYPE order_status AS ENUM ('PENDING_MODERATION', 'REJECTED', 'OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED', 'IN_DISPUTE');
CREATE TYPE transaction_type AS ENUM ('payment', 'withdrawal', 'refund');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved');

-- 2. Таблица Ролей
CREATE TABLE roles (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name user_role NOT NULL UNIQUE
);

-- 3. Таблица Пользователей
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role_id UUID NOT NULL REFERENCES roles(id),
                       phone VARCHAR(50), -- Добавили телефон (на всякий случай, если захотите включить в Java)
                       verification_status verification_status NOT NULL DEFAULT 'not_verified',
                       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                       is_blocked BOOLEAN NOT NULL DEFAULT false
);

-- 4. Профили
CREATE TABLE collector_profiles (
                                    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                    description TEXT,
                                    hourly_rate NUMERIC(10, 2) CHECK (hourly_rate >= 0),
                                    success_rate NUMERIC(5, 2) CHECK (success_rate >= 0 AND success_rate <= 100),
                                    region VARCHAR(100),
                                    average_rating NUMERIC(3, 2) DEFAULT 0.00
);

CREATE TABLE customer_profiles (
                                   user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                   company_name VARCHAR(255) NOT NULL,
                                   inn VARCHAR(32) UNIQUE -- Увеличили длину для избежания ошибки value too long
);

-- 5. Методы работы (справочники)
CREATE TABLE work_methods (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE collector_work_methods (
                                        collector_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                        method_id UUID NOT NULL REFERENCES work_methods(id) ON DELETE CASCADE,
                                        PRIMARY KEY (collector_id, method_id)
);

-- 6. Заказы (с новыми полями для модерации и отчетов)
CREATE TABLE orders (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
                        collector_id UUID REFERENCES users(id) ON DELETE SET NULL,
    -- status теперь хранится как VARCHAR, так как Java шлет строки (PENDING_MODERATION и т.д.)
    -- Если хотите строгую типизацию, используйте order_status, но тогда и в Java нужно настроить EnumType
                        status VARCHAR(50) NOT NULL DEFAULT 'PENDING_MODERATION',
                        description TEXT NOT NULL,
                        price NUMERIC(12, 2) NOT NULL CHECK (price > 0),

    -- Новые поля для бизнес-процесса
                        moderation_comment TEXT,      -- Причина отказа админом
                        proof_description TEXT,       -- Текст отчета коллектора
                        proof_file_path VARCHAR(512), -- Ссылка на файл-отчет

                        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                        completed_at TIMESTAMPTZ
);

-- 7. Отзывы
CREATE TABLE reviews (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
                         customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
                         collector_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
                         rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                         comment TEXT,
                         created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Транзакции
CREATE TABLE transactions (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
                              user_id UUID NOT NULL REFERENCES users(id),
                              type transaction_type NOT NULL,
                              amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
                              created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Споры
CREATE TABLE disputes (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
                          initiator_id UUID REFERENCES users(id) ON DELETE SET NULL,
                          status dispute_status NOT NULL DEFAULT 'open',
                          description TEXT NOT NULL,
                          resolution TEXT,
                          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Вложения (исходные документы к заказу)
CREATE TABLE attachments (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
                             dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
                             uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
                             file_path VARCHAR(512) NOT NULL UNIQUE,
                             file_name VARCHAR(255) NOT NULL,
                             created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                             CONSTRAINT chk_attachment_parent CHECK (order_id IS NOT NULL OR dispute_id IS NOT NULL)
);

-- 11. Сообщения (чат)
CREATE TABLE messages (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                          sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
                          content TEXT NOT NULL,
                          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);