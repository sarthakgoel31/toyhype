-- Increment stock (reverse of decrement_stock) for cancellations, RTO, returns
CREATE OR REPLACE FUNCTION increment_stock(p_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET stock_quantity = stock_quantity + qty, updated_at = now() WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
