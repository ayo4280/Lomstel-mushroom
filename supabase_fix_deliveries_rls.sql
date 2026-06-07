-- Fix deliveries RLS policies
-- deliveries table had RLS enabled but no policies, meaning all operations were silently blocked.

CREATE POLICY "Enable all operations for authenticated users" ON public.deliveries 
FOR ALL TO authenticated USING (true) WITH CHECK (true);
