-- Add RLS policy to allow service role to insert/update profiles
-- This is needed for phone auth verification to work

-- If profiles table doesn't have RLS enabled yet, enable it first
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role to perform all operations on profiles
CREATE POLICY "service_role_all" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- If profiles doesn't have basic user policies, add them:
-- (Comment these out if they already exist)
/*
CREATE POLICY "users_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
*/
