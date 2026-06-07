-- Fix: add INSERT policies for harvests and mushroom_products
-- Both tables previously only had SELECT policies, meaning client-side inserts failed silently.

CREATE POLICY "Enable insert for authenticated users" ON public.harvests 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users" ON public.mushroom_products 
FOR INSERT TO authenticated WITH CHECK (true);
