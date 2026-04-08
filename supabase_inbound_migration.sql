-- ============================================================
-- Yobbu — Inbound WhatsApp Verification Migration
-- Adds support for inbound verification (users send code TO us)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Add inbound verification columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_inbound_code TEXT,           -- The code user must send
  ADD COLUMN IF NOT EXISTS whatsapp_inbound_expires_at TIMESTAMPTZ,  -- Code expiry
  ADD COLUMN IF NOT EXISTS whatsapp_inbound_attempts INTEGER DEFAULT 0,  -- Rate limiting
  ADD COLUMN IF NOT EXISTS whatsapp_inbound_verified_from TEXT;  -- Source phone number

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_profiles_inbound_code 
  ON public.profiles(whatsapp_inbound_code) 
  WHERE whatsapp_inbound_code IS NOT NULL;

-- Create table to log inbound verification attempts (for security/auditing)
CREATE TABLE IF NOT EXISTS public.whatsapp_inbound_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  from_number       TEXT,
  message_body      TEXT,
  code_attempted    TEXT,
  status            TEXT,  -- 'success' | 'invalid_code' | 'expired' | 'no_code'
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on logs
ALTER TABLE public.whatsapp_inbound_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access logs
CREATE POLICY "inbound_logs_service" ON public.whatsapp_inbound_logs
  FOR ALL USING (false) WITH CHECK (false);

-- Function to cleanup expired codes (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_inbound_codes()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET whatsapp_inbound_code = NULL,
      whatsapp_inbound_expires_at = NULL
  WHERE whatsapp_inbound_expires_at < now()
    AND whatsapp_inbound_code IS NOT NULL;
END;
$$;

-- Note: Set up a cron job to run cleanup every hour:
-- SELECT cron.schedule('cleanup-expired-codes', '0 * * * *', 
--   'SELECT public.cleanup_expired_inbound_codes()');
