CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_collector_profiles_region ON collector_profiles(region);
CREATE INDEX IF NOT EXISTS idx_collector_profiles_average_rating ON collector_profiles(average_rating DESC);


CREATE INDEX IF NOT EXISTS idx_reviews_collector_id ON reviews(collector_id);
