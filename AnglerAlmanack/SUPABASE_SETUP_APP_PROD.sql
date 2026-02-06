-- ================================================================
-- TROPHY ANGLER — Production-ready SQL (app schema, secure defaults)
-- - Uses `app` schema (keeps app objects separate)
-- - Enables PostGIS + pgcrypto
-- - Strong RLS, auth sync, audit logging, least-privilege grants
-- - Limits on analytic functions to avoid large responses
-- ================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS common;
CREATE SCHEMA IF NOT EXISTS app;

-- Ensure UTC timestamps
SET timezone = 'UTC';

-- ----------------------------------------------------------------
-- Common utilities
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION common.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------
-- Users table (profiles) in app schema
-- Use auth.users as source of truth for auth; we'll sync profiles on sign-up
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE app.users IS 'User profiles linked to auth.users (synced via trigger)';

-- functional index for case-insensitive username lookups
CREATE INDEX IF NOT EXISTS idx_app_users_username_lower ON app.users (LOWER(username));

-- ----------------------------------------------------------------
-- Trophies table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app.trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,

  species TEXT NOT NULL,
  length NUMERIC NOT NULL CHECK (length > 0),
  width NUMERIC NOT NULL CHECK (width > 0),
  weight NUMERIC CHECK (weight > 0),

  photo_url TEXT NOT NULL,

  location_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  location_geom GEOGRAPHY(Point, 4326) NOT NULL,

  bait TEXT,
  water_temp NUMERIC CHECK (water_temp BETWEEN -50 AND 60),
  caught_at TIMESTAMPTZ NOT NULL,

  notes TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE app.trophies IS 'Recorded fish catches with geographic data (app schema)';
COMMENT ON COLUMN app.trophies.location_geom IS 'PostGIS geography column (EPSG:4326)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_trophies_user_id ON app.trophies (user_id);
CREATE INDEX IF NOT EXISTS idx_app_trophies_public_recent ON app.trophies (caught_at DESC) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_app_trophies_user_public ON app.trophies (user_id, caught_at DESC) WHERE is_public = TRUE;
-- GIST spatial index
CREATE INDEX IF NOT EXISTS idx_app_trophies_location_geom ON app.trophies USING GIST (location_geom);

-- ----------------------------------------------------------------
-- Row Level Security (RLS)
-- ----------------------------------------------------------------
ALTER TABLE app.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.trophies ENABLE ROW LEVEL SECURITY;

-- users: everyone can read public profile info (adjust as desired)
CREATE POLICY IF NOT EXISTS users_public_read ON app.users
  FOR SELECT USING (TRUE);

-- users: owner can update their profile
CREATE POLICY IF NOT EXISTS users_update_own ON app.users
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- trophies: public reads
CREATE POLICY IF NOT EXISTS trophies_public_read ON app.trophies
  FOR SELECT USING (is_public = TRUE);

-- trophies: owner read
CREATE POLICY IF NOT EXISTS trophies_owner_read ON app.trophies
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- trophies: owner insert/update/delete
CREATE POLICY IF NOT EXISTS trophies_owner_insert ON app.trophies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS trophies_owner_update ON app.trophies
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS trophies_owner_delete ON app.trophies
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ----------------------------------------------------------------
-- Triggers to set updated_at
-- ----------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_app_users_updated_at
  BEFORE UPDATE ON app.users
  FOR EACH ROW EXECUTE FUNCTION common.update_updated_at();

CREATE TRIGGER IF NOT EXISTS trg_app_trophies_updated_at
  BEFORE UPDATE ON app.trophies
  FOR EACH ROW EXECUTE FUNCTION common.update_updated_at();

-- ----------------------------------------------------------------
-- Audit logging for trophies (basic)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app.trophies_audit (
  id BIGSERIAL PRIMARY KEY,
  trophy_id UUID,
  operation TEXT NOT NULL,
  changed_by UUID,
  old_row JSONB,
  new_row JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION app.trophies_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO app.trophies_audit (trophy_id, operation, changed_by, old_row)
      VALUES (OLD.id, 'DELETE', auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO app.trophies_audit (trophy_id, operation, changed_by, old_row, new_row)
      VALUES (NEW.id, 'UPDATE', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO app.trophies_audit (trophy_id, operation, changed_by, new_row)
      VALUES (NEW.id, 'INSERT', auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trg_app_trophies_audit
  AFTER INSERT OR UPDATE OR DELETE ON app.trophies
  FOR EACH ROW EXECUTE FUNCTION app.trophies_audit_trigger();

-- ----------------------------------------------------------------
-- Auth => Profile sync: create app.users row when a new auth user signs up
-- Note: Supabase creates users in auth.users; triggers on that table are supported.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.sync_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Avoid overwriting existing profile
  INSERT INTO app.users (id, email, username, created_at, updated_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta->>'username', split_part(NEW.email, '@', 1)), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users (this requires the migration to be run as a superuser or owner)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid WHERE t.tgname = 'sync_auth_user_trigger'
  ) THEN
    EXECUTE 'CREATE TRIGGER sync_auth_user_trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION app.sync_auth_user();';
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- auth schema or table may not be accessible in some environments; fail gracefully
  RAISE NOTICE 'auth.users table not available; create profile rows via your app backend.';
END
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------
-- Spatial & analytics functions (schema-qualified)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.find_nearby_trophies(
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
  caught_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  is_public BOOLEAN,
  notes TEXT,
  water_temp NUMERIC,
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.user_id, t.species, t.length, t.width, t.weight,
         t.photo_url, t.location_name, t.latitude, t.longitude,
         t.bait, t.caught_at, t.created_at, t.is_public, t.notes, t.water_temp,
         ROUND(ST_Distance(t.location_geom, ST_MakePoint(lon, lat)::geography) / 1000.0, 2) AS distance_km
  FROM app.trophies t
  WHERE t.is_public = TRUE
    AND ST_DWithin(t.location_geom, ST_MakePoint(lon, lat)::geography, radius_km * 1000)
  ORDER BY t.caught_at DESC
  LIMIT 500; -- safety cap
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.get_user_stats(target_user_id UUID)
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
    COUNT(*) FILTER (WHERE is_public = TRUE)::BIGINT,
    COALESCE(MAX(length), 0),
    COALESCE(MAX(weight), 0)
  FROM app.trophies
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant minimal privileges to the authenticated role and remove public access
REVOKE ALL ON SCHEMA app FROM public;
GRANT USAGE ON SCHEMA app TO authenticated;

REVOKE ALL ON ALL TABLES IN SCHEMA app FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO authenticated;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA app FROM public;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO authenticated;

-- Grant execute on functions to authenticated
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO authenticated;

-- =====================================================================
-- Notes:
-- - Run this migration as a project owner (Supabase SQL editor running as DB owner).
-- - If the auth.users trigger creation fails due to permissions, create profiles from your backend on sign-up.
-- - Create the `trophy-images` storage bucket in Supabase Storage UI and set appropriate CORS and policies.
-- =====================================================================
