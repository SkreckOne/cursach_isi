-- Очистка таблиц перед заполнением (чтобы не было дублей)
TRUNCATE TABLE messages, attachments, disputes, transactions, reviews, orders, collector_work_methods, customer_profiles, collector_profiles, users, roles RESTART IDENTITY CASCADE;



INSERT INTO work_methods (id, name) VALUES
                                        (gen_random_uuid(), 'Phone Calls'),
                                        (gen_random_uuid(), 'Field Visits'),
                                        (gen_random_uuid(), 'Legal Action'),
                                        (gen_random_uuid(), 'Skip Tracing'),
                                        (gen_random_uuid(), 'Negotiation'),
                                        (gen_random_uuid(), 'Asset Search')
ON CONFLICT (name) DO NOTHING;
-- ==========================================
-- 1. РОЛИ
-- ==========================================
INSERT INTO roles (id, name) VALUES
                                 ('a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a1', 'customer'),
                                 ('a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'collector'),
                                 ('a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a3', 'admin');

-- ==========================================
-- 2. ПОЛЬЗОВАТЕЛИ (Пароль: password)
-- ==========================================

-- --- 2 АДМИНИСТРАТОРА ---
INSERT INTO users (id, email, password_hash, role_id, verification_status, phone, is_blocked) VALUES
                                                                                                  ('aa111111-1111-1111-1111-111111111111', 'admin1@market.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a3', 'verified', '+79000000001', false),
                                                                                                  ('aa222222-2222-2222-2222-222222222222', 'admin2@market.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a3', 'verified', '+79000000002', false);

-- --- 10 КОЛЛЕКТОРОВ ---
INSERT INTO users (id, email, password_hash, role_id, verification_status, phone, is_blocked) VALUES
                                                                                                  ('cc000000-0000-0000-0000-000000000001', 'coll1@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111111', false),
                                                                                                  ('cc000000-0000-0000-0000-000000000002', 'coll2@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111112', false),
                                                                                                  ('cc000000-0000-0000-0000-000000000003', 'coll3@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111113', false),
                                                                                                  ('cc000000-0000-0000-0000-000000000004', 'coll4@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111114', false),
                                                                                                  ('cc000000-0000-0000-0000-000000000005', 'coll5@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111115', false),
                                                                                                  ('cc000000-0000-0000-0000-000000000006', 'coll6@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111116', false),
                                                                                                  ('cc000000-0000-0000-0000-000000000007', 'coll7@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111117', false),
                                                                                                  ('cc000000-0000-0000-0000-000000000008', 'coll8@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111118', false),
                                                                                                  ('cc000000-0000-0000-0000-000000000009', 'coll9@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111119', false),
                                                                                                  ('cc000000-0000-0000-0000-000000000010', 'coll10@mail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified', '+79161111120', false);

-- --- 5 ЗАКАЗЧИКОВ ---
INSERT INTO users (id, email, password_hash, role_id, verification_status, phone, is_blocked) VALUES
                                                                                                  ('bb000000-0000-0000-0000-000000000001', 'cust1@bank.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a1', 'verified', '+79260000001', false),
                                                                                                  ('bb000000-0000-0000-0000-000000000002', 'cust2@mfo.ru', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a1', 'verified', '+79260000002', false),
                                                                                                  ('bb000000-0000-0000-0000-000000000003', 'cust3@retail.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a1', 'verified', '+79260000003', false),
                                                                                                  ('bb000000-0000-0000-0000-000000000004', 'cust4@invest.com', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a1', 'verified', '+79260000004', false),
                                                                                                  ('bb000000-0000-0000-0000-000000000005', 'cust5@auto.ru', '$2a$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a1', 'verified', '+79260000005', false);

-- ==========================================
-- 3. ПРОФИЛИ
-- ==========================================

-- Профили коллекторов (10 шт)
INSERT INTO collector_profiles (user_id, description, hourly_rate, region) VALUES
                                                                               ('cc000000-0000-0000-0000-000000000001', 'Эксперт по банковским долгам', 1500.00, 'Москва'),
                                                                               ('cc000000-0000-0000-0000-000000000002', 'Работа с МФО', 1200.00, 'Санкт-Петербург'),
                                                                               ('cc000000-0000-0000-0000-000000000003', 'Судебный пристав в отставке', 2000.00, 'Казань'),
                                                                               ('cc000000-0000-0000-0000-000000000004', 'Досудебное урегулирование', 1000.00, 'Новосибирск'),
                                                                               ('cc000000-0000-0000-0000-000000000005', 'Работа с юрлицами', 2500.00, 'Москва'),
                                                                               ('cc000000-0000-0000-0000-000000000006', 'Частный детектив', 3000.00, 'Екатеринбург'),
                                                                               ('cc000000-0000-0000-0000-000000000007', 'Быстрый выезд', 1800.00, 'Сочи'),
                                                                               ('cc000000-0000-0000-0000-000000000008', 'Переговоры любой сложности', 1600.00, 'Краснодар'),
                                                                               ('cc000000-0000-0000-0000-000000000009', 'Юридическое сопровождение', 2200.00, 'Москва'),
                                                                               ('cc000000-0000-0000-0000-000000000010', 'Начинающий специалист', 500.00, 'Самара');

-- Профили заказчиков (5 шт)
INSERT INTO customer_profiles (user_id, company_name, inn) VALUES
                                                               ('bb000000-0000-0000-0000-000000000001', 'СберБанк', '7707083893'),
                                                               ('bb000000-0000-0000-0000-000000000002', 'ДеньгиМигом', '7707083894'),
                                                               ('bb000000-0000-0000-0000-000000000003', 'М.Видео Ритейл', '7707083895'),
                                                               ('bb000000-0000-0000-0000-000000000004', 'Инвест Групп', '7707083896'),
                                                               ('bb000000-0000-0000-0000-000000000005', 'АвтоЛизинг', '7707083897');

-- ==========================================
-- 4. ЗАКАЗЫ (20 штук)
-- ==========================================

-- 1. PENDING_MODERATION (Ждут одобрения админа) - 5 шт
INSERT INTO orders (customer_id, status, description, price, created_at) VALUES
                                                                             ('bb000000-0000-0000-0000-000000000001', 'PENDING_MODERATION', 'Взыскание по кредитной карте #1', 25000.00, now() - interval '1 hour'),
                                                                             ('bb000000-0000-0000-0000-000000000002', 'PENDING_MODERATION', 'Долг по микрозайму Иванов И.И.', 15000.00, now() - interval '2 hours'),
                                                                             ('bb000000-0000-0000-0000-000000000003', 'PENDING_MODERATION', 'Неоплата товара ООО Вектор', 100000.00, now() - interval '3 hours'),
                                                                             ('bb000000-0000-0000-0000-000000000004', 'PENDING_MODERATION', 'Инвестиционный договор, просрочка', 500000.00, now() - interval '30 minutes'),
                                                                             ('bb000000-0000-0000-0000-000000000005', 'PENDING_MODERATION', 'Лизинг авто, поиск машины', 75000.00, now() - interval '10 minutes');

-- 2. OPEN (Одобрены, висят на бирже) - 5 шт
INSERT INTO orders (customer_id, status, description, price, created_at) VALUES
                                                                             ('bb000000-0000-0000-0000-000000000001', 'OPEN', 'Ипотечный долг, переговоры', 150000.00, now() - interval '1 day'),
                                                                             ('bb000000-0000-0000-0000-000000000002', 'OPEN', 'Займ до зарплаты Петров П.П.', 5000.00, now() - interval '2 days'),
                                                                             ('bb000000-0000-0000-0000-000000000003', 'OPEN', 'Кража оборудования, гражданский иск', 200000.00, now() - interval '5 hours'),
                                                                             ('bb000000-0000-0000-0000-000000000001', 'OPEN', 'Потребительский кредит Сидоров', 45000.00, now() - interval '6 hours'),
                                                                             ('bb000000-0000-0000-0000-000000000002', 'OPEN', 'Просрочка платежей, 3 месяца', 12000.00, now() - interval '7 hours');

-- 3. IN_PROGRESS (Взяты коллекторами) - 5 шт
INSERT INTO orders (customer_id, collector_id, status, description, price, created_at) VALUES
                                                                                           ('bb000000-0000-0000-0000-000000000004', 'cc000000-0000-0000-0000-000000000001', 'IN_PROGRESS', 'Долг VIP клиента', 1000000.00, now() - interval '3 days'),
                                                                                           ('bb000000-0000-0000-0000-000000000005', 'cc000000-0000-0000-0000-000000000002', 'IN_PROGRESS', 'Угон лизингового авто', 80000.00, now() - interval '4 days'),
                                                                                           ('bb000000-0000-0000-0000-000000000001', 'cc000000-0000-0000-0000-000000000003', 'IN_PROGRESS', 'Кредит наличными, сложный случай', 60000.00, now() - interval '2 days'),
                                                                                           ('bb000000-0000-0000-0000-000000000003', 'cc000000-0000-0000-0000-000000000004', 'IN_PROGRESS', 'Дебиторка магазина Электроника', 300000.00, now() - interval '1 week'),
                                                                                           ('bb000000-0000-0000-0000-000000000002', 'cc000000-0000-0000-0000-000000000005', 'IN_PROGRESS', 'Микрозайм "До получки"', 3000.00, now() - interval '1 day');

-- 4. PENDING_REVIEW (Выполнены коллектором, ждут подтверждения заказчика/админа) - 3 шт
INSERT INTO orders (customer_id, collector_id, status, description, price, created_at, proof_description) VALUES
                                                                                                              ('bb000000-0000-0000-0000-000000000001', 'cc000000-0000-0000-0000-000000000001', 'PENDING_REVIEW', 'Автокредит BMW X5', 120000.00, now() - interval '1 month', 'Автомобиль найден и возвращен на стоянку банка. Акт приема-передачи приложен.'),
                                                                                                              ('bb000000-0000-0000-0000-000000000002', 'cc000000-0000-0000-0000-000000000006', 'PENDING_REVIEW', 'Займ, должник скрывался', 20000.00, now() - interval '2 weeks', 'Должник найден, подписал график платежей.'),
                                                                                                              ('bb000000-0000-0000-0000-000000000003', 'cc000000-0000-0000-0000-000000000007', 'PENDING_REVIEW', 'Поставка товара, неоплата', 450000.00, now() - interval '3 weeks', 'Долг погашен в полном объеме на счет заказчика.');

-- 5. COMPLETED (Полностью закрыты) - 2 шт
INSERT INTO orders (customer_id, collector_id, status, description, price, created_at, completed_at) VALUES
                                                                                                         ('bb000000-0000-0000-0000-000000000001', 'cc000000-0000-0000-0000-000000000001', 'COMPLETED', 'Старый архивный долг', 10000.00, now() - interval '2 months', now()),
                                                                                                         ('bb000000-0000-0000-0000-000000000004', 'cc000000-0000-0000-0000-000000000008', 'COMPLETED', 'Консультация по взысканию', 5000.00, now() - interval '1 month', now());