/**
 * @file trophy.ts
 * @description Core TypeScript types for the Trophy Angler application.
 * These types are shared across mobile and web platforms.
 */

/**
 * @interface Trophy
 * @description Represents a caught fish record in the system.
 * Maps directly to the Supabase trophies table.
 */
export interface Trophy {
  id: string;
  user_id: string;
  species: string;
  length: number; // in cm
  width: number; // in cm
  weight?: number; // in kg, optional
  photo_url: string;
  location_name: string;
  latitude: number;
  longitude: number;
  bait?: string;
  caught_at: string; // ISO 8601 timestamp
  created_at: string;
  is_public: boolean;
  notes: string;
  water_temp?: number; // Celsius, for future expansion
}

/**
 * @interface User
 * @description Represents a user profile in the system.
 * Used for authentication and public profile displays.
 */
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * @interface CreateTrophyInput
 * @description Input shape for creating a new trophy record.
 * Omits auto-generated fields like id and timestamps.
 */
export interface CreateTrophyInput {
  species: string;
  length: number;
  width: number;
  weight?: number;
  photo_url: string;
  location_name: string;
  latitude: number;
  longitude: number;
  bait?: string;
  caught_at: string;
  is_public: boolean;
  notes: string;
  water_temp?: number;
}

/**
 * @interface ShareTrophyPayload
 * @description Data passed when sharing a trophy.
 * Used to generate social media friendly share links.
 */
export interface ShareTrophyPayload {
  trophyId: string;
  species: string;
  location_name: string;
  photo_url: string;
  caught_at: string;
}
