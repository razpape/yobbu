-- ============================================================
-- Yobbu — Phone Auth & Trust System Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add phone auth columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pin_hash TEXT,
  ADD COLUMN IF NOT EXISTS trusted_device_id TEXT,
  ADD COLUMN IF NOT EXISTS trusted_device_bound_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE,
  
  -- Optional identity
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS facebook_id TEXT,
  ADD COLUMN IF NOT EXISTS facebook_connected_at TIMESTAMPTZ,
  
  -- Profile
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('sender', 'traveler', 'both')),
  
  -- Verification Tiers (1-4)
  ADD COLUMN IF NOT EXISTS verification_tier INTEGER DEFAULT 1 CHECK (verification_tier BETWEEN 1 AND 4),
  
  -- Tier 3: ID Verification
  ADD COLUMN IF NOT EXISTS id_document_url TEXT,
  ADD COLUMN IF NOT EXISTS id_verification_status TEXT CHECK (id_verification_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS selfie_url TEXT,
  ADD COLUMN IF NOT EXISTS liveness_check_passed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS id_verified_at TIMESTAMPTZ,
  
  -- Tier 4: Premium
  ADD COLUMN IF NOT EXISTS flight_itinerary_url TEXT,
  ADD COLUMN IF NOT EXISTS premium_verified_at TIMESTAMPTZ,
  
  -- Trust Metrics
  ADD COLUMN IF NOT EXISTS completed_trips INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_sends INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS repeat_counterparties INTEGER DEFAULT 0,
  
  -- Safety
  ADD COLUMN IF NOT EXISTS reports_received INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS blocks_received INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned'));

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_role TEXT CHECK (reviewer_role IN ('sender', 'traveler')),
  stars INTEGER CHECK (stars BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT '{}',
  comment TEXT CHECK (LENGTH(comment) <= 500),
  response TEXT,
  responded_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT TRUE,
  moderated_at TIMESTAMPTZ,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id);

-- Create verification logs table for audit trail
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on verification logs
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access logs
CREATE POLICY "Verification logs service only"
  ON public.verification_logs FOR ALL USING (false);

-- Function to auto-update tier based on verification status
CREATE OR REPLACE FUNCTION update_verification_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate tier based on what user has verified
  IF NEW.premium_verified_at IS NOT NULL THEN
    NEW.verification_tier = 4;
  ELSIF NEW.id_verified_at IS NOT NULL THEN
    NEW.verification_tier = 3;
  ELSIF NEW.trusted_device_bound_at IS NOT NULL AND NEW.email_verified = TRUE THEN
    NEW.verification_tier = 2;
  ELSIF NEW.phone_verified_at IS NOT NULL THEN
    NEW.verification_tier = 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tier
DROP TRIGGER IF EXISTS update_tier_trigger ON public.profiles;
CREATE TRIGGER update_tier_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_tier();

-- Function to update average rating when review is added/updated
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    avg_rating = (
      SELECT ROUND(AVG(stars)::numeric, 1)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
      AND moderation_status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
      AND moderation_status = 'approved'
    )
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
DROP TRIGGER IF EXISTS update_rating_trigger ON public.reviews;
CREATE TRIGGER update_rating_trigger
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id ON public.verification_logs(user_id);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('phone', 'phone_verified_at', 'pin_hash', 'verification_tier', 
  'id_verification_status', 'completed_trips', 'avg_rating')
ORDER BY ordinal_position;
