-- Trust & Verification System Migration
-- Run this in Supabase SQL Editor

-- Add new columns to profiles table for Trust & Verification System
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS id_verification_status TEXT DEFAULT NULL, -- 'pending', 'approved', 'rejected'
ADD COLUMN IF NOT EXISTS id_verification_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS completed_trips INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS super_traveler BOOLEAN DEFAULT FALSE;

-- Add flight_number to trips table (if not exists from earlier migration)
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS flight_number TEXT;

-- Create storage bucket for private documents (ID uploads)
-- Note: Run this in Supabase Dashboard > Storage > New Bucket
-- Bucket name: private-documents
-- Set to private with RLS policies

-- Create reviews table for rating system
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- sender who left review
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- traveler being reviewed
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for trips they booked" 
ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Function to update traveler stats when review is added
CREATE OR REPLACE FUNCTION update_traveler_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update avg_rating and review_count
  UPDATE profiles
  SET 
    avg_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1) 
      FROM reviews 
      WHERE reviewee_id = NEW.reviewee_id
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats after review insert
DROP TRIGGER IF EXISTS after_review_insert ON reviews;
CREATE TRIGGER after_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_traveler_stats();

-- Trigger to update stats after review update
DROP TRIGGER IF EXISTS after_review_update ON reviews;
CREATE TRIGGER after_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_traveler_stats();

-- Function to mark Super Traveler badge when 5+ completed trips
CREATE OR REPLACE FUNCTION check_super_traveler()
RETURNS TRIGGER AS $$
BEGIN
  -- Update completed_trips count from approved trips
  UPDATE profiles
  SET 
    completed_trips = (
      SELECT COUNT(*) 
      FROM trips 
      WHERE user_id = NEW.user_id AND approved = true
    ),
    super_traveler = (
      SELECT COUNT(*) >= 5
      FROM trips 
      WHERE user_id = NEW.user_id AND approved = true
    )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update super traveler status when trip is approved
DROP TRIGGER IF EXISTS after_trip_approved ON trips;
CREATE TRIGGER after_trip_approved
  AFTER UPDATE OF approved ON trips
  FOR EACH ROW 
  WHEN (NEW.approved = true)
  EXECUTE FUNCTION check_super_traveler();

-- Create index for faster reviews queries
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_trip_id ON reviews(trip_id);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN (
  'id_document_url', 
  'id_verification_status', 
  'facebook_url', 
  'linkedin_url', 
  'completed_trips', 
  'avg_rating', 
  'review_count', 
  'super_traveler'
);
