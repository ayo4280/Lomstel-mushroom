-- Migration: Connect Orders to Logistics
-- When a payment_order is marked as 'paid', automatically create a delivery record.

-- Step 1: Add order-context columns to deliveries table
ALTER TABLE public.deliveries 
  ADD COLUMN IF NOT EXISTS product_type text,
  ADD COLUMN IF NOT EXISTS quantity_kg numeric,
  ADD COLUMN IF NOT EXISTS buyer_email text,
  ADD COLUMN IF NOT EXISTS total_amount numeric,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'NGN';

-- Step 2: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_paid_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when payment_status changes TO 'paid'
  IF (NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid')) THEN
    -- Prevent duplicate deliveries for the same order
    IF NOT EXISTS (SELECT 1 FROM public.deliveries WHERE order_id = NEW.id) THEN
      INSERT INTO public.deliveries (
        order_id, buyer_name, buyer_email, delivery_address,
        product_type, quantity_kg, total_amount, currency, status
      ) VALUES (
        NEW.id,
        COALESCE(NEW.buyer_name, 'Unknown Buyer'),
        NEW.buyer_email,
        'Pending — Buyer to confirm address',
        NEW.product_type,
        NEW.quantity_kg,
        NEW.total_amount,
        COALESCE(NEW.currency, 'NGN'),
        'Processing'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Step 3: Attach trigger to payment_orders
DROP TRIGGER IF EXISTS on_order_paid ON public.payment_orders;
CREATE TRIGGER on_order_paid
  AFTER UPDATE ON public.payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paid_order();

-- Step 4: Backfill existing paid orders that have no delivery record yet
INSERT INTO public.deliveries (
  order_id, buyer_name, buyer_email, delivery_address,
  product_type, quantity_kg, total_amount, currency, status
)
SELECT 
  po.id, COALESCE(po.buyer_name, 'Unknown Buyer'), po.buyer_email,
  'Pending — Buyer to confirm address',
  po.product_type, po.quantity_kg, po.total_amount, COALESCE(po.currency, 'NGN'), 'Processing'
FROM public.payment_orders po
WHERE po.payment_status = 'paid'
  AND NOT EXISTS (SELECT 1 FROM public.deliveries d WHERE d.order_id = po.id);
