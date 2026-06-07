-- Fix: drop invalid role constraint
-- The profiles table had a legacy constraint `profiles_role_check` limiting roles to 'poster', 'helper', etc.
-- This caused user creation to fail when passing 'ADMIN' or 'FARM_WORKER'.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
