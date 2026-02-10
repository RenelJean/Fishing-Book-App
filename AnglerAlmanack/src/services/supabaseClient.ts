/**
 * @file supabaseClient.ts
 * @description Supabase client initialization and configuration.
 * 
 * This is the gateway to our PostgreSQL + PostGIS database.
 * Supabase provides:
 * - Lightning-fast location queries via PostGIS
 * - Built-in authentication
 * - Real-time subscriptions
 * - Row-level security
 * 
 * Setup Instructions:
 * 1. Go to https://supabase.com and create an account
 * 2. Create a new project
 * 3. Copy your SUPABASE_URL and SUPABASE_ANON_KEY
 * 4. Create a .env.local file with these values
 */

import { createClient } from '@supabase/supabase-js';
import type { Trophy, User } from '../types/trophy';

// Environment variables - set these in .env.local
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Missing Supabase environment variables. ' +
    'Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env.local file'
  );
}

console.log("URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("KEY:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

/**
 * @type {SupabaseClient}
 * Singleton Supabase client instance
 * Use this throughout the app for all database operations
 */

export type Database = {
  app: {
    Tables: {
      trophies: {
        Row: Trophy;
        Insert: Omit<Trophy, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Trophy>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<User>;
      };
    };
  };
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Type definitions for our database schema
 * Mirrors the actual Supabase tables
 
export type Database = {
  public: {
    Tables: {
      trophies: {
        Row: Trophy;
        Insert: Omit<Trophy, 'id' | 'created_at'>;
        Update: Partial<Trophy>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<User>;
      };
    };
  };
};
*/
/**
 * Helper function to fetch a single trophy by ID
 * Includes PostGIS distance calculations if needed
 * 
 * @param {string} trophyId - The trophy UUID
 * @returns {Promise<Trophy | null>} The trophy or null if not found
 */
export async function fetchTrophyById(trophyId: string): Promise<Trophy | null> {
  try {
    const { data, error } = await supabase
      .from('app.trophies')
      .select('*')
      .eq('id', trophyId)
      .eq('is_public', true) // Only return public trophies for web
      .single();

    if (error) {
      console.error('Error fetching trophy:', error);
      return null;
    }

    return data as Trophy;
  } catch (error) {
    console.error('Unexpected error fetching trophy:', error);
    return null;
  }
}

/**
 * Fetch all public trophies from a user
 * Used for user profile pages on the web
 * 
 * @param {string} userId - The user UUID
 * @param {number} limit - Max results (default 50)
 * @returns {Promise<Trophy[]>} Array of public trophies
 */
export async function fetchUserPublicTrophies(
  userId: string,
  limit: number = 50
): Promise<Trophy[]> {
  try {
    const { data, error } = await supabase
      .from('app.trophies')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('caught_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user trophies:', error);
      return [];
    }

    return (data as Trophy[]) || [];
  } catch (error) {
    console.error('Unexpected error fetching user trophies:', error);
    return [];
  }
}

/**
 * Find nearby trophies using PostGIS
 * This is the "lightning-fast location queries" feature
 * 
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<Trophy[]>} Trophies within radius
 * 
 * Note: This requires a PostGIS function in your Supabase database.
 * See the SQL schema at the bottom of this file for setup.
 */
export async function findNearbyTrophies(
  latitude: number,
  longitude: number,
  radiusKm: number = 50
): Promise<Trophy[]> {
  try {
    const { data, error } = await supabase
      .rpc('app.find_nearby_trophies', {
        lat: latitude,
        lon: longitude,
        radius_km: radiusKm
      });

    if (error) {
      console.error('Error finding nearby trophies:', error);
      return [];
    }

    return (data as Trophy[]) || [];
  } catch (error) {
    console.error('Unexpected error finding nearby trophies:', error);
    return [];
  }
}

/**
 * SQL Schema Setup
 * Run these commands in your Supabase SQL editor:
 * 
 * -- Enable PostGIS extension
 * CREATE EXTENSION IF NOT EXISTS "postgis";
 * 
 * -- Create users table
 * CREATE TABLE public.users (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   email TEXT UNIQUE NOT NULL,
 *   username TEXT UNIQUE NOT NULL,
 *   avatar_url TEXT,
 *   bio TEXT,
 *   is_premium BOOLEAN DEFAULT false,
 *   created_at TIMESTAMP DEFAULT now(),
 *   updated_at TIMESTAMP DEFAULT now()
 * );
 * 
 * -- Create trophies table
 * CREATE TABLE public.trophies (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 *   species TEXT NOT NULL,
 *   length NUMERIC NOT NULL,
 *   width NUMERIC NOT NULL,
 *   weight NUMERIC,
 *   photo_url TEXT NOT NULL,
 *   location_name TEXT NOT NULL,
 *   latitude NUMERIC NOT NULL,
 *   longitude NUMERIC NOT NULL,
 *   location_geom GEOGRAPHY NOT NULL,
 *   bait TEXT,
 *   caught_at TIMESTAMP NOT NULL,
 *   created_at TIMESTAMP DEFAULT now(),
 *   is_public BOOLEAN DEFAULT false,
 *   notes TEXT,
 *   water_temp NUMERIC,
 *   CONSTRAINT trophies_dimensions_positive CHECK (length > 0 AND width > 0)
 * );
 * 
 * -- Create indexes
 * CREATE INDEX idx_trophies_user_id ON trophies(user_id);
 * CREATE INDEX idx_trophies_is_public ON trophies(is_public);
 * CREATE INDEX idx_trophies_location ON trophies USING GIST(location_geom);
 * 
 * -- Enable RLS (Row Level Security)
 * ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create policies for trophies
 * CREATE POLICY "Public trophies are viewable by everyone"
 *   ON trophies FOR SELECT
 *   USING (is_public = true);
 * 
 * CREATE POLICY "Users can see their own trophies"
 *   ON trophies FOR SELECT
 *   USING (auth.uid() = user_id);
 * 
 * CREATE POLICY "Users can insert their own trophies"
 *   ON trophies FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 * 
 * CREATE POLICY "Users can update their own trophies"
 *   ON trophies FOR UPDATE
 *   USING (auth.uid() = user_id);
 * 
 * -- PostGIS function for nearby trophies
 * CREATE OR REPLACE FUNCTION find_nearby_trophies(
 *   lat NUMERIC,
 *   lon NUMERIC,
 *   radius_km NUMERIC DEFAULT 50
 * ) RETURNS TABLE (
 *   id UUID,
 *   user_id UUID,
 *   species TEXT,
 *   length NUMERIC,
 *   width NUMERIC,
 *   weight NUMERIC,
 *   photo_url TEXT,
 *   location_name TEXT,
 *   latitude NUMERIC,
 *   longitude NUMERIC,
 *   bait TEXT,
 *   caught_at TIMESTAMP,
 *   created_at TIMESTAMP,
 *   is_public BOOLEAN,
 *   notes TEXT,
 *   water_temp NUMERIC
 * ) AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT t.id, t.user_id, t.species, t.length, t.width, t.weight,
 *          t.photo_url, t.location_name, t.latitude, t.longitude,
 *          t.bait, t.caught_at, t.created_at, t.is_public, t.notes, t.water_temp
 *   FROM trophies t
 *   WHERE t.is_public = true
 *   AND ST_DWithin(
 *     t.location_geom::geography,
 *     ST_Point(lon, lat)::geography,
 *     radius_km * 1000
 *   )
 *   ORDER BY t.caught_at DESC;
 * END;
 * $$ LANGUAGE plpgsql;
 */

export default supabase;
