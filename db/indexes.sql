-- Ускоряет поиск пользователя по email при входе в систему.
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Ускоряет фильтрацию коллекторов по региону на странице поиска.
CREATE INDEX IF NOT EXISTS idx_collector_profiles_region ON collector_profiles(region);
-- Обеспечивает быструю сортировку коллекторов по их рейтингу.
CREATE INDEX IF NOT EXISTS idx_collector_profiles_average_rating ON collector_profiles(average_rating DESC);


-- Позволяет быстро загрузить все отзывы на странице публичного профиля коллектора.
CREATE INDEX IF NOT EXISTS idx_reviews_collector_id ON reviews(collector_id);
