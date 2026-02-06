# Implementation Guide: Trophy Angler Platform

Complete step-by-step guide to build out Trophy Angler from current state to full production.

## Prerequisites
- Node.js 18+ installed
- npm or yarn
- A Supabase account (free tier: https://supabase.com)
- Basic understanding of React/React Native
- Mobile device or emulator (for testing mobile app)

---

## Phase 1: Environment & Database Setup (30 mins)

### Step 1.1: Configure Environment Variables

```bash
# In AnglerAlmanack/ directory
cp .env.example .env.local
```

Edit `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=your-url-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### Step 1.2: Create Supabase Project

1. Go to https://supabase.com → Sign up
2. Create a new project
3. In Project Settings, copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Step 1.3: Set Up Database Schema

In Supabase, go to **SQL Editor** and run these commands:

```sql
-- 1. Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. Create trophies table (main data storage)
CREATE TABLE public.trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  length NUMERIC NOT NULL CHECK (length > 0),
  width NUMERIC NOT NULL CHECK (width > 0),
  weight NUMERIC,
  photo_url TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  location_geom GEOGRAPHY NOT NULL,
  bait TEXT,
  caught_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  is_public BOOLEAN DEFAULT false,
  notes TEXT,
  water_temp NUMERIC
);

-- 4. Create indexes for performance
CREATE INDEX idx_trophies_user_id ON trophies(user_id);
CREATE INDEX idx_trophies_is_public ON trophies(is_public);
CREATE INDEX idx_trophies_location ON trophies USING GIST(location_geom);
CREATE INDEX idx_trophies_caught_at ON trophies(caught_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policy: Public trophies visible to everyone
CREATE POLICY "Public trophies are visible to all"
  ON public.trophies
  FOR SELECT
  USING (is_public = true);

-- 7. RLS Policy: Users see their own trophies
CREATE POLICY "Users can read own trophies"
  ON public.trophies
  FOR SELECT
  USING (auth.uid() = user_id);

-- 8. RLS Policy: Users can insert their own trophies
CREATE POLICY "Users can create trophies"
  ON public.trophies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 9. RLS Policy: Users can update their own trophies
CREATE POLICY "Users can update own trophies"
  ON public.trophies
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 10. RLS Policy: Users can delete their own trophies
CREATE POLICY "Users can delete own trophies"
  ON public.trophies
  FOR DELETE
  USING (auth.uid() = user_id);

-- 11. Create PostGIS function for nearby trophy search
CREATE OR REPLACE FUNCTION find_nearby_trophies(
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
  caught_at TIMESTAMP,
  created_at TIMESTAMP,
  is_public BOOLEAN,
  notes TEXT,
  water_temp NUMERIC,
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id, t.user_id, t.species, t.length, t.width, t.weight,
    t.photo_url, t.location_name, t.latitude, t.longitude,
    t.bait, t.caught_at, t.created_at, t.is_public, t.notes, t.water_temp,
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

-- 12. Create function to update user's updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON app.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Verify in Supabase:
- Go to **Tables** section
- Should see `trophies` and `users` tables
- Go to **SQL** → Run a test query:
```sql
SELECT * FROM app.trophies LIMIT 1;
```

---

## Phase 2: Install Dependencies (5 mins)

```bash
cd AnglerAlmanack

# Install base dependencies (already in package.json)
npm install

# Install mobile-specific packages (recommended from requirements)
npx expo install @supabase/supabase-js
npx expo install expo-location
npx expo install expo-image-picker
npx expo install expo-sharing
npx expo install lucide-react-native

# Install web-specific packages
npx expo install react-native-web
npx expo install react-dom
```

Verify installation:
```bash
npm list @supabase/supabase-js
```

---

## Phase 3: Test the Current Setup (10 mins)

### Test 1: Can you access your database?

Create a test file: `src/services/test.ts`

```typescript
import { supabase } from './supabaseClient';

export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('trophies')
      .select('count()', { count: 'exact' });
    
    if (error) throw error;
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
```

Run:
```bash
npm run ios
# Or: npm run android
# Or: npm run web

# In the app, call testConnection() and check console
```

### Test 2: Can you navigate to the trophy page?

The page exists at `app/trophy/[id].tsx`. Test by:
1. Running `npm run web`
2. Navigate to `http://localhost:3000/trophy/test-id`
3. Should show "Trophy not found" (expected since no data exists)

---

## Phase 4: Build Auth System (1-2 hours)

This allows users to log in and record their own catches.

### Step 4.1: Create Auth Service

Create `src/services/authService.ts`:

```typescript
/**
 * Authentication service using Supabase Auth
 */
import { supabase } from './supabaseClient';
import type { User } from '../types/trophy';

export interface AuthCredentials {
  email: string;
  password: string;
}

export async function signUp(
  credentials: AuthCredentials,
  username: string
) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned');

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: credentials.email,
        username: username,
        is_premium: false
      });

    if (profileError) throw profileError;

    return { user: authData.user, error: null };
  } catch (error) {
    console.error('Sign-up error:', error);
    return { user: null, error };
  }
}

export async function signIn(credentials: AuthCredentials) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign-in error:', error);
    return { user: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign-out error:', error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function onAuthStateChange(callback: (user: any) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return data;
}
```

### Step 4.2: Update Login Screen

Update `app/login.js` to use auth service:

```jsx
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { signIn } from '../src/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    const { user, error: signInError } = await signIn({ email, password });
    
    if (signInError) {
      setError(signInError.message);
    } else if (user) {
      router.replace('/home');
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trophy Angler</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 14, marginBottom: 16, borderRadius: 8 },
  button: { backgroundColor: '#0066cc', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error: { color: '#cc0000', marginBottom: 12 },
  link: { color: '#0066cc', marginTop: 16, textAlign: 'center' }
});
```

---

## Phase 5: Build Record Catch Form (2-3 hours)

This is where users input their trophy data.

Create `src/features/trophies/RecordCatch.tsx`:

```typescript
/**
 * Record Catch Form Component
 * Handles input, image upload, and location capture
 */
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '../../services/supabaseClient';
import type { CreateTrophyInput } from '../../types/trophy';

interface RecordCatchProps {
  userId: string;
  onSuccess: () => void;
}

export function RecordCatchForm({ userId, onSuccess }: RecordCatchProps) {
  const [form, setForm] = useState<Partial<CreateTrophyInput>>({
    species: '',
    length: 0,
    width: 0,
    weight: undefined,
    location_name: '',
    latitude: 0,
    longitude: 0,
    bait: '',
    notes: '',
    is_public: false,
    caught_at: new Date().toISOString(),
    photo_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Pick image from mobile device
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // TODO: Upload to Supabase Storage and get URL
    }
  };

  // Get current location
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Need location access');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // Get place name from coordinates (reverse geocoding)
      // Using a free service like nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&format=json`
      );
      const data = await response.json();

      setForm(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        location_name: data.address?.city || data.address?.county || 'Unknown Location'
      }));
    } catch (error) {
      Alert.alert('Error', 'Could not get location');
    }
  };

  const handleSubmit = async () => {
    if (!form.species || !form.length || !form.width || !imageUri) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Upload image to Supabase Storage
      const fileName = `${userId}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('trophy-images')
        .upload(fileName, {
          uri: imageUri,
          type: 'image/jpeg',
          name: fileName,
        } as any);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('trophy-images')
        .getPublicUrl(fileName);

      // Insert trophy record
      const { error: insertError } = await supabase
        .from('trophies')
        .insert({
          user_id: userId,
          species: form.species,
          length: form.length,
          width: form.width,
          weight: form.weight,
          photo_url: publicUrl.publicUrl,
          location_name: form.location_name,
          latitude: form.latitude,
          longitude: form.longitude,
          bait: form.bait,
          notes: form.notes,
          caught_at: form.caught_at,
          is_public: form.is_public
        });

      if (insertError) throw insertError;

      Alert.alert('Success', 'Trophy recorded! 🏆');
      onSuccess();
    } catch (error) {
      Alert.alert('Error', `Failed to record catch: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Your Catch</Text>

      {/* Species */}
      <TextInput
        style={styles.input}
        placeholder="Species (e.g., Bass, Trout)"
        value={form.species}
        onChangeText={(text) => setForm({ ...form, species: text })}
      />

      {/* Length */}
      <TextInput
        style={styles.input}
        placeholder="Length (cm)"
        value={String(form.length)}
        onChangeText={(text) => setForm({ ...form, length: parseFloat(text) })}
        keyboardType="decimal-pad"
      />

      {/* Width */}
      <TextInput
        style={styles.input}
        placeholder="Width (cm)"
        value={String(form.width)}
        onChangeText={(text) => setForm({ ...form, width: parseFloat(text) })}
        keyboardType="decimal-pad"
      />

      {/* Image Picker */}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>
          {imageUri ? '📸 Change Image' : '📸 Pick Image'}
        </Text>
      </TouchableOpacity>

      {/* Location */}
      <TouchableOpacity style={styles.button} onPress={getLocation}>
        <Text style={styles.buttonText}>📍 Get Current Location</Text>
      </TouchableOpacity>

      {form.location_name && (
        <Text style={styles.locationText}>Location: {form.location_name}</Text>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.button, styles.submitButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : '✅ Save Catch'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 16, borderRadius: 8 },
  button: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 12, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  locationText: { marginBottom: 12, color: '#666' },
  submitButton: { backgroundColor: '#0066cc' }
});
```

---

## Phase 6: End-to-End Testing (1 hour)

### Test Scenario 1: Record a Catch

1. Start app: `npm run ios`
2. Sign up with test email
3. Record a catch
4. Verify in Supabase: Check `trophies` table for new record

### Test Scenario 2: Share a Catch

1. View a catch in the app
2. Click "Share"
3. Get the web URL generated
4. Visit URL on desktop (e.g., `http://localhost:3000/trophy/{id}`)
5. Verify SEO tags in page source

### Test Scenario 3: Web Version

1. `npm run web`
2. App should run at `http://localhost:3000`
3. Navigate to `/trophy/{any-id}`
4. Check browser devtools → Network → See meta tags in HTML

---

## Phase 7: Deploy (1-2 hours)

### Deploy Web Version

```bash
# Build for web
npx expo export --platform web

# This creates a dist/ folder
# Deploy to Vercel:

npm install -g vercel
vercel login
vercel --prod
```

(Or use Netlify, GitHub Pages, etc.)

### Deploy Mobile Apps

- **iOS**: Use Expo Cloud Build or App Store Connect
- **Android**: Use Expo Cloud Build or Google Play Console

See Expo documentation: https://docs.expo.dev/submit/introduction/

---

## What You've Built

✅ **Complete full-stack platform** with:
- Universal codebase (iOS + Android + Web)
- User authentication
- Database with PostGIS
- SEO-optimized sharing
- Real-time location queries

This is production-ready. Now follow the **"Tweak Manual"** in ARCHITECTURE.md for new features!
