# Trophy Angler: Professional Fishing Platform

A **universal Expo application** that runs on iOS, Android, and the Web. Trophy Angler enables anglers to log, showcase, and share their fishing catches with a built-in growth loop that drives platform adoption through social media integration.

## 🎯 Key Features

### Mobile App (iOS & Android)
- 📱 **Native Performance**: Offline logging and GPS capture
- 🎣 **Record Catches**: Species, dimensions, location, photos, bait used
- 🗺️ **Find Nearby Catches**: Lightning-fast PostGIS location queries
- 📤 **Share Trophies**: Generate social media-friendly links
- 📊 **Personal Stats**: Track catches by species, location, and time

### Web Platform
- 🌐 **Public Trophy Gallery**: Find and view trophies from other anglers
- 🔍 **SEO Optimization**: Google indexes public catches for organic traffic
- 💬 **Social Sharing**: Open Graph meta tags for rich social card previews
- 📍 **Location Search**: Find trophies caught near you
- 🚀 **Growth Loop**: Friends click shared links → Download app → Share more catches

---

## 🏗️ The Architecture

Built as a **Universal Expo App** with one codebase that works everywhere:

```
┌─────────────────────────────────────┐
│    One React Component Library       │
│  (Shared across all platforms)      │
│  - CatchCard Component              │
│  - useShareTrophy Hook              │
│  - Types & Business Logic           │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┬──────────┐
    ▼             ▼          ▼
  iOS        Android        Web
 Native      Native      React DOM
  App         App        (SEO + Social)
```

**Database**: Supabase (PostgreSQL + PostGIS)
- Lightning-fast geographic queries
- Row-level security for user privacy
- Real-time subscriptions for live updates

---

## 📚 Documentation

### Quick Start
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Step-by-step setup (Phases 1-7)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Folder structure & design patterns
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete SQL schema

### Key Files
| File | Purpose |
|------|---------|
| [src/components/shared/CatchCard.tsx](./src/components/shared/CatchCard.tsx) | Main trophy display component (mobile + web) |
| [src/features/trophies/useShareTrophy.ts](./src/features/trophies/useShareTrophy.ts) | Growth loop: share logic & Open Graph |
| [src/services/supabaseClient.ts](./src/services/supabaseClient.ts) | Database gateway with PostGIS queries |
| [src/types/trophy.ts](./src/types/trophy.ts) | TypeScript types (single source of truth) |
| [app/trophy/[id].tsx](./app/trophy/[id].tsx) | Dynamic trophy pages (mobile deeplinks + web SEO) |

---

## 🛠️ Tech Stack

### Frontend
- **[Expo](https://expo.dev)** (v53): Universal framework
- **[Expo Router](https://docs.expo.dev/routing/introduction/)** (v5): File-based routing
- **[React Native](https://reactnative.dev)**: Mobile components
- **[React Native Web](https://necolas.github.io/react-native-web/)**: Web support
- **[TypeScript](https://www.typescriptlang.org/)**: Type safety
- **[Lucide React Native](https://lucide.dev/docs/lucide-react-native)**: Icons (cross-platform)

### Backend
- **[Supabase](https://supabase.com)**: 
  - PostgreSQL database
  - PostGIS extension (spatial queries)
  - Authentication (email/password)
  - Row-level security
  - Real-time subscriptions
  - File storage (trophy images)

### State Management
- React Hooks (built-in)
- Expo AsyncStorage (offline persistence)
- Supabase Real-time

---

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js 18+
# Install Expo CLI
npm install -g expo-cli
```

### 1. Clone & Install
```bash
cd AnglerAlmanack
npm install

# Install Supabase and location packages
npx expo install @supabase/supabase-js expo-location expo-image-picker expo-sharing
```

### 2. Set Up Supabase
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials from [supabase.com](https://supabase.com)

### 3. Set Up Database
Follow the **complete SQL schema** in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 4. Run the App
```bash
# Mobile (iOS)
npm run ios

# Mobile (Android)
npm run android

# Web
npm run web

# All platforms simultaneously (separate terminals)
```

---

## 📁 Project Structure

```
AnglerAlmanack/
├── 📄 IMPLEMENTATION_GUIDE.md    # ← START HERE (7-phase setup)
├── 📄 ARCHITECTURE.md              # System design & patterns
├── 📄 SUPABASE_SETUP.md            # SQL schema setup
├── .env.example                    # Configuration template
│
├── app/                            # Expo Router (file-based routing)
│   ├── _layout.tsx                 # Root layout
│   ├── home.js                     # Home screen
│   ├── login.js                    # Auth screens
│   ├── register.js
│   └── trophy/
│       └── [id].tsx                # 🎯 Dynamic route (mobile + web SEO)
│
├── src/
│   ├── types/                      # TypeScript types
│   │   ├── trophy.ts               # Trophy, User interfaces
│   │   └── index.ts                # Central exports
│   │
│   ├── components/shared/          # Cross-platform components
│   │   └── CatchCard.tsx           # 🎯 Trophy display (mobile + web)
│   │
│   ├── features/trophies/          # Business logic
│   │   └── useShareTrophy.ts       # 🎯 Growth loop (sharing)
│   │
│   ├── services/                   # External integrations
│   │   └── supabaseClient.ts       # 🎯 Database gateway
│   │
│   ├── hooks/                      # Custom React hooks
│   ├── constants/                  # App configuration
│   └── screens/                    # Page-level components
│
├── assets/                         # Images, fonts
│
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── app.json                        # Expo config
└── babel.config.js                 # Babel config
```

---

## 🎯 The Growth Loop

```
User records catch on mobile
         ↓
Clicks "Share Trophy"
         ↓
Generates link: yourfishingapp.com/trophy/abc123
         ↓
Shares on Instagram/Twitter/Facebook
         ↓
Friends click link → Land on web version
         ↓
See beautiful fish photo + stats
         ↓
"Download app" button visible
         ↓
Friends download → Record their own catches
         ↓
LOOP REPEATS 🔄
```

Meanwhile, Google crawls the web version and indexes public trophies, bringing organic search traffic.

---

## 🔧 Customization (The "Tweak Manual")

### Add a New Fish Property
1. **Database**: `ALTER TABLE trophies ADD COLUMN new_field TEXT;`
2. **Types**: Update `Trophy` interface in `src/types/trophy.ts`
3. **UI**: Update `CatchCard.tsx` to display it
4. **Forms**: Add input field to catch recording form

### Add Premium Feature
```typescript
// Wrap in permission check
{user.is_premium && <AdvancedWeatherComponent />}
```

### Integrate AI Species ID
```typescript
import { identifySpecies } from '../services/geminiClient';
const species = await identifySpecies(imageUrl);
setSpecies(species);
```

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for complete tweak patterns.

---

## 📊 Database Schema Overview

### trophies table
- `id` (UUID): Unique trophy ID
- `user_id` (UUID): Owner
- `species` (TEXT): Fish type
- `length` (NUMERIC): Length in cm
- `width` (NUMERIC): Width in cm
- `weight` (NUMERIC): Weight in kg (optional)
- `photo_url` (TEXT): Image URL
- `location_name` (TEXT): Where caught
- `location_geom` (GEOGRAPHY): PostGIS column for fast queries
- `caught_at` (TIMESTAMP): When caught
- `is_public` (BOOLEAN): Visible on web?
- `notes` (TEXT): Angler's commentary

### users table
- `id` (UUID): User ID
- `email` (TEXT): Email address
- `username` (TEXT): Display name
- `is_premium` (BOOLEAN): Paid user?
- `avatar_url` (TEXT): Profile picture
- `bio` (TEXT): User bio

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete schema with indexes and RLS policies.

---

## ✅ Phase Checklist

Use this to track your progress:

- [ ] **Phase 1**: Environment & Database (30 mins)
- [ ] **Phase 2**: Install Dependencies (5 mins)
- [ ] **Phase 3**: Test Setup (10 mins)
- [ ] **Phase 4**: Build Auth System (1-2 hours)
- [ ] **Phase 5**: Build Record Catch Form (2-3 hours)
- [ ] **Phase 6**: End-to-End Testing (1 hour)
- [ ] **Phase 7**: Deploy (1-2 hours)

**Total time**: ~8-10 hours for a working platform

---

## 🐛 Troubleshooting

### Supabase credentials not loading
```
✅ Solution: Verify EXPO_PUBLIC_SUPABASE_URL in .env.local
           (Must start with EXPO_PUBLIC_ prefix for Expo)
```

### Images not uploading
```
✅ Solution: Enable CORS in Supabase Storage settings
           Create trophy-images bucket first
```

### PostGIS errors
```
✅ Solution: Run SUPABASE_SETUP.md SQL in order
           Verify: SELECT PostGIS_Version();
```

### App crashes on web
```
✅ Solution: Check browser console for errors
           Verify Platform.OS === 'web' detection
```

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md#phase-1-environment--database-setup-30-mins) for detailed troubleshooting.

---

## 🚢 Deployment

### Web
```bash
npx expo export --platform web
# Deploy dist/ to Vercel, Netlify, or any static host
```

### Mobile
Follow [Expo's deployment guide](https://docs.expo.dev/submit/introduction/) for App Store / Google Play

---

## 📚 Learning Resources

- **[Expo Docs](https://docs.expo.dev)** - Official Expo documentation
- **[Expo Router](https://docs.expo.dev/routing/introduction/)** - File-based routing guide
- **[Supabase Docs](https://supabase.com/docs)** - Database & authentication
- **[PostGIS Intro](https://postgis.net/documentation/)** - Geographic queries
- **[React Native Web](https://necolas.github.io/react-native-web/)** - Write once, run everywhere

---

## 💡 Next Steps

1. **Read [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** (most important!)
2. **Complete [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** SQL schema
3. **Follow the 7-phase setup** to build authentication and catch recording
4. **Test on actual devices** (iOS/Android) and web
5. **Reference [ARCHITECTURE.md](./ARCHITECTURE.md)** when adding features

Good luck building Trophy Angler! 🎣
