# Supabase SQL Schema & Setup

Complete SQL code for setting up Trophy Angler's database in Supabase.
Copy and paste this into your Supabase SQL editor.

## Quick Start

1. Go to your Supabase Project → SQL Editor
2. Create a new query
3. Copy all SQL below and run it

---

## Complete SQL Schema

```sql
-- ============================================================================
-- SPATIAL DATABASE SETUP FOR TROPHY ANGLER
-- Enables PostGIS for lightning-fast location queries
-- ============================================================================

-- Step 1: Enable PostGIS extension
-- Required for ST_Distance, ST_DWithin, and geographic calculations
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comment on users table
COMMENT ON TABLE public.users IS 'User profiles linked to Supabase auth.users table';
COMMENT ON COLUMN public.users.is_premium IS 'Premium users unlock advanced features (AI ID, weather data, etc)';

-- ============================================================================
-- TROPHIES (CATCHES) TABLE
-- Core data structure for recorded fish catches
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.trophies (
  -- Identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Fish Information
  species TEXT NOT NULL,
  length NUMERIC NOT NULL CHECK (length > 0),
  width NUMERIC NOT NULL CHECK (width > 0),
  weight NUMERIC CHECK (weight > 0),
  
  -- Image Storage
  photo_url TEXT NOT NULL,
  
  -- Location Information
  location_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude NUMERIC NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  location_geom GEOGRAPHY NOT NULL,  -- PostGIS column for spatial queries
  
  -- Catch Details (Optional)
  bait TEXT,
  water_temp NUMERIC CHECK (water_temp >= -10 AND water_temp <= 40),
  caught_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata
  notes TEXT,
  
  -- Privacy Control
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comments on trophies table
COMMENT ON TABLE public.trophies IS 'Recorded fish catches with geographic data';
COMMENT ON COLUMN public.trophies.location_geom IS 'PostGIS geography column for spatial queries (e.g., find nearby catches)';
COMMENT ON COLUMN public.trophies.is_public IS 'When true, visible on web and indexed by Google robots';

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- User queries
CREATE INDEX IF NOT EXISTS idx_trophies_user_id ON public.trophies(user_id);

-- Public feed queries
CREATE INDEX IF NOT EXISTS idx_trophies_is_public ON public.trophies(is_public);

-- Spatial index for PostGIS (required for fast distance queries)
CREATE INDEX IF NOT EXISTS idx_trophies_location ON public.trophies USING GIST(location_geom);

-- Timeline queries
CREATE INDEX IF NOT EXISTS idx_trophies_caught_at ON public.trophies(caught_at DESC);
CREATE INDEX IF NOT EXISTS idx_trophies_created_at ON public.trophies(created_at DESC);

-- Combined queries (user's public trophies)
CREATE INDEX IF NOT EXISTS idx_trophies_user_public ON public.trophies(user_id, is_public);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforces privacy at the database layer
-- ============================================================================

-- Enable RLS
ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- TROPHIES - RLS Policies

-- Policy 1: Public trophies visible to everyone
CREATE POLICY "Public trophies are viewable by everyone"
  ON public.trophies
  FOR SELECT
  USING (is_public = true);

-- Policy 2: Users can see their own trophies
CREATE POLICY "Users can view their own trophies"
  ON public.trophies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 3: Users can insert their own trophies
CREATE POLICY "Users can create their own trophies"
  ON public.trophies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own trophies
CREATE POLICY "Users can update their own trophies"
  ON public.trophies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own trophies
CREATE POLICY "Users can delete their own trophies"
  ON public.trophies
  FOR DELETE
  USING (auth.uid() = user_id);

-- USERS - RLS Policies

-- Public profiles visible to all (for web leaderboards)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function 1: Update timestamp columns automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trophies_updated_at
  BEFORE UPDATE ON public.trophies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function 2: Find nearby trophies (PostGIS spatial query)
-- Usage: SELECT * FROM find_nearby_trophies(lat, lon, radius_km);
CREATE OR REPLACE FUNCTION public.find_nearby_trophies(
  lat NUMERIC,
  lon NUMERIC,
  radius_km NUMERIC DEFAULT 50
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  species TEXT,
  length NUMERIC,
  width NUMERIC,
  weight NUMERIC,
  photo_url TEXT,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  bait TEXT,
  caught_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN,
  notes TEXT,
  water_temp NUMERIC,
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.user_id,
    t.species,
    t.length,
    t.width,
    t.weight,
    t.photo_url,
    t.location_name,
    t.latitude,
    t.longitude,
    t.bait,
    t.caught_at,
    t.created_at,
    t.is_public,
    t.notes,
    t.water_temp,
    ROUND((ST_Distance(t.location_geom::geography, ST_Point(lon, lat)::geography) / 1000)::NUMERIC, 2) as distance_km
  FROM public.trophies t
  WHERE t.is_public = true
  AND ST_DWithin(
    t.location_geom::geography,
    ST_Point(lon, lat)::geography,
    radius_km * 1000
  )
  ORDER BY t.caught_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.find_nearby_trophies IS 
'Find public trophies within a radius using PostGIS spatial indexing. Fast even with millions of records.';

-- Function 3: Get user leaderboard stats
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id UUID)
RETURNS TABLE (
  total_catches BIGINT,
  public_catches BIGINT,
  largest_by_length NUMERIC,
  largest_by_weight NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE is_public = true)::BIGINT,
    MAX(length),
    MAX(weight)
  FROM public.trophies
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STORAGE (for images)
-- ============================================================================

-- Create a bucket for trophy images (if not exists)
-- Note: You may need to do this via Supabase UI instead of SQL

-- In Supabase Dashboard → Storage:
-- 1. Create new bucket named "trophy-images"
-- 2. Set to Public
-- 3. Copy the bucket name to your app's image upload code

-- ============================================================================
-- TEST DATA (Optional)
-- Useful for developing before users sign up
-- ============================================================================

-- Uncomment below to insert test data
/*
-- Create test user
INSERT INTO public.users (id, email, username, bio, is_premium)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'testuser@example.com', 'TestAngler', 'Learning to fish', false)
ON CONFLICT(id) DO NOTHING;

-- Create test trophies
INSERT INTO public.trophies (
  user_id, species, length, width, weight, 
  photo_url, location_name, latitude, longitude, location_geom,
  bait, caught_at, is_public, notes
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Largemouth Bass',
  42.5,
  18.0,
  2.5,
  'https://example.com/fish.jpg',
  'Lake Michigan',
  42.8781,
  -87.0133,
  ST_GeogFromText('POINT(-87.0133 42.8781)'),
  'Live shiners',
  now() - interval '2 days',
  true,
  'Caught from a kayak near the rocky point. Great day on the water!'
);
*/

-- ============================================================================
-- HELPFUL QUERIES
-- ============================================================================

-- View all trophies (admin)
-- SELECT * FROM public.trophies ORDER BY caught_at DESC LIMIT 10;

-- Find trophies near a location
-- SELECT * FROM find_nearby_trophies(42.3601, -71.0589, 25); -- Boston, 25km radius

-- Get user stats
-- SELECT * FROM get_user_stats('550e8400-e29b-41d4-a716-446655440000');

-- Count public catches by species
-- SELECT species, COUNT(*) as count FROM public.trophies WHERE is_public = true GROUP BY species ORDER BY count DESC;

-- ============================================================================
-- VERIFY YOUR SETUP
-- ============================================================================

-- Run this to confirm PostGIS is enabled
-- SELECT PostGIS_Version();

-- Confirm your tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

```

---

## Supabase Storage Setup (via Dashboard)

Since SQL can't create storage buckets directly, do this in the Supabase UI:

1. **Go to Supabase Dashboard** → Your Project
2. **Left sidebar** → Storage
3. **Click "Create new bucket"**
4. **Name it**: `trophy-images`
5. **Make it Public** (toggle switch)
6. **Create**

Your images will be stored at:
```
https://YOUR_PROJECT.supabase.co/storage/v1/object/public/trophy-images/{filename}
```

---

## Enable CORS for Image Uploads

In Supabase Dashboard → Storage → `trophy-images` bucket settings:

```json
{
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedOrigins": ["*"],
  "allowedHeaders": ["content-type"]
}
```

---

## Testing Your Schema

After running the SQL above, test it:

### Test 1: Insert a Trophy
```sql
INSERT INTO public.trophies (
  user_id,
  species,
  length,
  width,
  photo_url,
  location_name,
  latitude,
  longitude,
  location_geom,
  caught_at,
  is_public,
  notes
) VALUES (
  gen_random_uuid(),
  'Bass',
  50,
  20,
  'https://example.com/fish.jpg',
  'Test Lake',
  40.7128,
  -74.0060,
  ST_GeogFromText('POINT(-74.0060 40.7128)'),
  now(),
  true,
  'Test catch'
)
RETURNING *;
```

### Test 2: Query Nearby Trophies
```sql
SELECT * FROM find_nearby_trophies(40.7128, -74.0060, 100)
LIMIT 5;
```

### Test 3: Check Indexes
```sql
-- Verify indexes were created
SELECT indexname FROM pg_indexes 
WHERE tablename = 'trophies';
```

---

## Troubleshooting

### Issue: "Cannot enable PostGIS on this database"
**Solution**: Some Supabase projects have PostGIS pre-enabled. Check:
```sql
\dx postgis
```

If you see `postgis | installed`, you're good!

### Issue: RLS policies not working
**Solution**: Make sure `auth.uid()` returns the user's email. Enable:
- Supabase Dashboard → Authentication → Enable email signup

### Issue: Spatial queries are slow
**Solution**: Regenerate the GIST index:
```sql
REINDEX INDEX idx_trophies_location;
```

---

## Next Steps

1. ✅ Run the SQL above in your Supabase project
2. ✅ Create the `trophy-images` storage bucket
3. ✅ Create a test user in Supabase Auth dashboard
4. ✅ Insert a test trophy using the SQL above
5. ✅ Test the `find_nearby_trophies()` function
6. ✅ Proceed to Phase 5 of IMPLEMENTATION_GUIDE.md

Good luck! 🎣
