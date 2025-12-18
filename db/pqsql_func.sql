CREATE OR REPLACE FUNCTION create_new_order(
    p_customer_id UUID,
    p_collector_id UUID,
    p_description TEXT,
    p_price NUMERIC
)
    RETURNS UUID AS $$
DECLARE
    new_order_id UUID;
BEGIN
    IF p_customer_id = p_collector_id THEN
        RAISE EXCEPTION 'Customer and collector cannot be the same user.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_customer_id AND verification_status = 'verified') THEN
        RAISE EXCEPTION 'Customer is not found or not verified.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_collector_id AND verification_status = 'verified') THEN
        RAISE EXCEPTION 'Collector is not found or not verified.';
    END IF;


    INSERT INTO orders (customer_id, collector_id, description, price, status)
    VALUES (p_customer_id, p_collector_id, p_description, p_price, 'IN_PROGRESS')
    RETURNING id INTO new_order_id;

    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE PROCEDURE complete_order_and_process_payment(
    p_order_id UUID,
    p_customer_id UUID
)
AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_commission_rate NUMERIC := 0.10;
    v_commission NUMERIC;
    v_amount_to_collector NUMERIC;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

    IF v_order IS NULL THEN
        RAISE EXCEPTION 'Order not found.';
    END IF;

    IF v_order.customer_id != p_customer_id THEN
        RAISE EXCEPTION 'Access denied. You are not the customer for this order.';
    END IF;

    IF v_order.status != 'completed' THEN
        RAISE EXCEPTION 'Order status is not completed.';
    END IF;

    v_commission := v_order.price * v_commission_rate;
    v_amount_to_collector := v_order.price - v_commission;

    INSERT INTO transactions (order_id, user_id, type, amount)
    VALUES (p_order_id, p_customer_id, 'payment', v_order.price);

    INSERT INTO transactions (order_id, user_id, type, amount)
    VALUES (p_order_id, v_order.collector_id, 'withdrawal', v_amount_to_collector);

END;
$$ LANGUAGE plpgsql;