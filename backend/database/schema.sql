-- AgriAid.AI — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    crop_name TEXT,
    disease_name TEXT,
    severity TEXT,
    confidence NUMERIC(5,2),
    image_url TEXT,
    recommendation JSONB,
    weather_summary TEXT,
    district TEXT,
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES crop_scans(id) ON DELETE CASCADE,
    recommendation TEXT,
    weather_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sim_type TEXT DEFAULT 'impact' CHECK (sim_type IN ('impact', 'future_growth', 'disease_spread')),
    crop_type TEXT,
    soil_type TEXT,
    yield_prediction TEXT,
    risk_level TEXT,
    result_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_scans_user ON crop_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_scans_created ON crop_scans(created_at DESC);

-- Profiles table (for editable farmer profile data)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    location TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Storage Buckets Setup
-- 1. Create crop-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Read Access" ON storage.objects;

-- 3. Policy to allow anonymous uploads to the crop-images bucket
CREATE POLICY "Allow Public Uploads" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'crop-images');

-- 4. Policy to allow public read access to the crop-images bucket
CREATE POLICY "Allow Public Read Access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'crop-images');

