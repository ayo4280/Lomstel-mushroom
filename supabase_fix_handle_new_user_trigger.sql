-- Fix: handle_new_user trigger was inserting into non-existent column 'full_name'.
-- The profiles table uses 'display_name'. This caused "Database error creating new user"
-- every time any user account was created via the admin API.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Lomstel Member'),
    COALESCE(new.raw_user_meta_data->>'role', 'BUYER')
  );
  RETURN NEW;
END;
$$;
