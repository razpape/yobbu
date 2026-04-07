-- ============================================================
-- Yobbu — WhatsApp Verification Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create profiles table (if it doesn't exist yet)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Add WhatsApp verification columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_verified          BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_number            TEXT,          -- masked display e.g. "+221 77****123"
  ADD COLUMN IF NOT EXISTS whatsapp_number_hash       TEXT UNIQUE,   -- SHA-256 of normalised number
  ADD COLUMN IF NOT EXISTS whatsapp_verified_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_verified_by_admin BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_otp_hash          TEXT,          -- SHA-256 of current OTP
  ADD COLUMN IF NOT EXISTS whatsapp_otp_expires_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_otp_last_sent_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_verification_notes   TEXT,
  ADD COLUMN IF NOT EXISTS verification_revoked_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_revoked_reason TEXT;

-- 3. Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill profiles for users who signed up before this migration
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Admin audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email      TEXT        NOT NULL,
  action           TEXT        NOT NULL,  -- 'verify' | 'revoke'
  target_user_id   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_email TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 6. Row Level Security
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (idempotent)
DROP POLICY IF EXISTS "profiles_self_select"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_all"   ON public.profiles;
DROP POLICY IF EXISTS "audit_log_admin"        ON public.admin_audit_log;

-- Users can read and update their own profile
CREATE POLICY "profiles_self_select"  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admin can read and update all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'papamamadous@outlook.com');
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE
  USING ((auth.jwt() ->> 'email') = 'papamamadous@outlook.com');

-- Admin can read/write audit log
CREATE POLICY "audit_log_admin" ON public.admin_audit_log FOR ALL
  USING ((auth.jwt() ->> 'email') = 'papamamadous@outlook.com');
