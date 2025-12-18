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

DROP TYPE IF EXISTS
    user_role,
    verification_status,
    order_status,
    transaction_type,
    dispute_status
    CASCADE;


DROP FUNCTION IF EXISTS create_new_order(UUID, UUID, TEXT, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS update_collector_average_rating() CASCADE;


DROP PROCEDURE IF EXISTS complete_order_and_process_payment(UUID, UUID) CASCADE;


DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_collector_profiles_region;
DROP INDEX IF EXISTS idx_collector_profiles_average_rating;
DROP INDEX IF EXISTS idx_reviews_collector_id;

