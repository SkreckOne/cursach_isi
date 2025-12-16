DROP TABLE IF EXISTS messages, attachments, disputes, transactions, reviews, orders, collector_work_methods, work_methods, customer_profiles, collector_profiles, users, roles CASCADE;
DROP TYPE IF EXISTS user_role, verification_status, order_status, transaction_type, dispute_status;


CREATE TYPE user_role AS ENUM ('customer', 'collector', 'admin');
CREATE TYPE verification_status AS ENUM ('not_verified', 'pending', 'verified', 'rejected');
CREATE TYPE order_status AS ENUM ('pending_confirmation', 'in_progress', 'completed', 'cancelled', 'in_dispute');
CREATE TYPE transaction_type AS ENUM ('payment', 'withdrawal', 'refund');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved');


CREATE TABLE roles (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   name user_role NOT NULL UNIQUE
);


CREATE TABLE users (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   email VARCHAR(255) NOT NULL UNIQUE,
   password_hash VARCHAR(255) NOT NULL,
   role_id UUID NOT NULL REFERENCES roles(id),
   verification_status verification_status NOT NULL DEFAULT 'not_verified',
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   is_blocked BOOLEAN NOT NULL DEFAULT false
);


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
   inn VARCHAR(12) UNIQUE
);


CREATE TABLE work_methods (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   name VARCHAR(255) NOT NULL UNIQUE
);


CREATE TABLE collector_work_methods (
   collector_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   method_id UUID NOT NULL REFERENCES work_methods(id) ON DELETE CASCADE,
   PRIMARY KEY (collector_id, method_id)
);


CREATE TABLE orders (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
   collector_id UUID REFERENCES users(id) ON DELETE SET NULL,
   status order_status NOT NULL DEFAULT 'pending_confirmation',
   description TEXT NOT NULL,
   price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   completed_at TIMESTAMPTZ
);


CREATE TABLE reviews (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
   customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
   collector_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
   rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
   comment TEXT,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE transactions (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
   user_id UUID NOT NULL REFERENCES users(id),
   type transaction_type NOT NULL,
   amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE disputes (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
   initiator_id UUID REFERENCES users(id) ON DELETE SET NULL,
   status dispute_status NOT NULL DEFAULT 'open',
   description TEXT NOT NULL,
   resolution TEXT,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


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


CREATE TABLE messages (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
   sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
   content TEXT NOT NULL,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE OR REPLACE FUNCTION update_collector_average_rating()
RETURNS TRIGGER AS $$
BEGIN
   UPDATE collector_profiles
   SET average_rating = (
       SELECT AVG(rating)
       FROM reviews
       WHERE collector_id = NEW.collector_id
   )
   WHERE user_id = NEW.collector_id;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_collector_average_rating();