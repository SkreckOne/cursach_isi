INSERT INTO roles (id, name) VALUES
('a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a1', 'customer'),
('a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'collector'),
('a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a3', 'admin');


INSERT INTO users (id, email, password_hash, role_id, verification_status) VALUES
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5b1', 'customer1@bank.com', '$2b$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a1', 'verified'),
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5b2', 'customer2@mfo.ru', '$2b$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a1', 'verified'),
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c1', 'collector.ivanov@mail.com', '$2b$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified'),
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c2', 'petrov.collector@gmail.com', '$2b$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a2', 'verified'),
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5d1', 'admin@marketplace.com', '$2b$10$D.Zl.N7.zUbv3eL6C1f/a.t7wJzY5Z.Z6Z.t6Z.t7wJzY5Z.Z6Z.t', 'a1b2c3d4-e5f6-7788-99a0-b1c2d3e4f5a3', 'verified');


INSERT INTO customer_profiles (user_id, company_name, inn) VALUES
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5b1', 'АО "Надежный Банк"', '7707083893'),
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5b2', 'ООО "Быстрые Деньги"', '7727782729');


INSERT INTO collector_profiles (user_id, description, hourly_rate, success_rate, region) VALUES
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c1', 'Опытный специалист по досудебному взысканию долгов с физических лиц. Более 10 лет в профессии.', 1500.00, 85.50, 'Москва'),
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c2', 'Юрист, специализируюсь на судебном взыскании задолженностей с юридических лиц.', 2500.00, 92.00, 'Санкт-Петербург');


INSERT INTO work_methods (id, name) VALUES
('d1e2f3a4-b5c6-7788-99a0-b1c2d3e4f5f1', 'Досудебное взыскание'),
('d1e2f3a4-b5c6-7788-99a0-b1c2d3e4f5f2', 'Судебное взыскание'),
('d1e2f3a4-b5c6-7788-99a0-b1c2d3e4f5f3', 'Работа с физическими лицами'),
('d1e2f3a4-b5c6-7788-99a0-b1c2d3e4f5f4', 'Работа с юридическими лицами');


INSERT INTO collector_work_methods (collector_id, method_id) VALUES
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c1', 'd1e2f3a4-b5c6-7788-99a0-b1c2d3e4f5f1'),
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c1', 'd1e2f3a4-b5c6-7788-99a0-b1c2d3e4f5f3'),
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c2', 'd1e2f3a4-b5c6-7788-99a0-b1c2d3e4f5f2'),
('c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c2', 'd1e2f3a4-b5c6-7788-99a0-b1c2d3e4f5f4');


INSERT INTO orders (id, customer_id, collector_id, status, description, price, completed_at) VALUES
('e1f2a3b4-c5d6-7788-99a0-b1c2d3e4f5e1', 'c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5b1', 'c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c1', 'completed', 'Взыскание задолженности по кредитному договору №123', 50000.00, now() - interval '1 day'),
('e1f2a3b4-c5d6-7788-99a0-b1c2d3e4f5e2', 'c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5b2', 'c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c2', 'in_progress', 'Взыскание дебиторской задолженности с ООО "Рога и Копыта"', 120000.00, NULL),
('e1f2a3b4-c5d6-7788-99a0-b1c2d3e4f5e3', 'c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5b1', 'c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c2', 'in_dispute', 'Подготовка иска к должнику Иванову И.И.', 35000.00, NULL);


INSERT INTO reviews (order_id, customer_id, collector_id, rating, comment) VALUES
('e1f2a3b4-c5d6-7788-99a0-b1c2d3e4f5e1', 'c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5b1', 'c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5c1', 5, 'Отличная работа! Долг был взыскан в кратчайшие сроки.');


INSERT INTO disputes (order_id, initiator_id, description) VALUES
('e1f2a3b4-c5d6-7788-99a0-b1c2d3e4f5e3', 'c1d2e3f4-a5b6-7788-99a0-b1c2d3e4f5b1', 'Исполнитель не выходит на связь, сроки подготовки иска сорваны.');


не меньше 20 заказов разных
разных коллекторов 10
админов 2
