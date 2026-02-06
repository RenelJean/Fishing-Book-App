# Trophy Angler: Universal Expo Architecture Guide

## Overview

Trophy Angler is a professional fishing platform built with a **Universal Expo Architecture**. One codebase runs on:
- 📱 **iOS**: Native app with offline logging and GPS
- 📱 **Android**: Native app with offline logging and GPS  
- 🌐 **Web**: SEO-optimized platform for public trophy sharing

<!--This architecture enables you to build and scale a complete platform as a solo developer.

---

## Architecture Philosophy

### The Growth Loop
When users share their catches, they generate links to the website version. Google indexes public trophies, bringing free organic traffic. Friends click links, download the app, and repeat the cycle.

### Shared Business Logic
Instead of duplicating code across platforms, we define features once in a platform-agnostic way:
- **Components** live in `/src/components/shared` → used on mobile AND web
- **Business Logic** lives in `/src/features` and `/src/services` → consumed by all platforms
- **Types** live in `/src/types` → single source of truth for data structures

---
-->
## Folder Structure

```
AnglerAlmanack/
├── app/                          # Expo Router (routing layer)
│   ├── _layout.tsx              # Root layout
│   ├── home.js                  # Home screen
│   ├── login.js                 # Auth screens
│   ├── register.js
│   └── trophy/
│       └── [id].tsx              # 🎯 Dynamic route: individual trophy pages
│                                 #   Handles mobile deeplinks AND web SEO
│
├── src/                          # Core application code
│   ├── types/                    # TypeScript types (shared across platforms)
│   │   ├── trophy.ts             # Trophy, User, CreateTrophyInput types
│   │   └── index.ts              # Central export point
│   │
│   ├── components/               # React components
│   │   ├── shared/               # Platform-agnostic components
│   │   │   └── CatchCard.tsx      # 🎯 Main trophy display component
│   │   │                         #   Works on mobile and web
│   │   └── ui/                   # UI primitives
│   │
│   ├── features/                 # Business logic hooks and utilities
│   │   └── trophies/
│   │       └── useShareTrophy.ts  # 🎯 Growth loop: share trophy logic
│   │                             #   Generates web links from mobile app
│   │
│   ├── services/                 # External integrations
│   │   └── supabaseClient.ts      # 🎯 Database service
│   │                             #   PostgreSQL + PostGIS for locations
│   │
│   ├── hooks/                    # Custom React hooks
│   └── constants/                # App constants
│
├── assets/                       # Images, fonts, etc.
├── .env.example                  # 🎯 Configuration template
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies

```

### Key Implementation Files (🎯)

1. **`app/trophy/[id].tsx`** - SEO + Deep Linking Hub
   - Renders trophy details on mobile (via deep links)
   - Renders SEO-rich pages on web (indexed by Google)
   - Shows meta tags, Open Graph, structured data

2. **`src/components/shared/CatchCard.tsx`** - Visual Centerpiece
   - Reusable component for displaying catches
   - Responsive: card on mobile, article on web
   - Variant prop for compact/full layouts

3. **`src/features/trophies/useShareTrophy.ts`** - Growth Loop
   - Platform-aware sharing (iOS, Android, Web)
   - Generates shareable URLs
   - OpenGraph utilities for social cards

4. **`src/services/supabaseClient.ts`** - Database Gateway
   - Supabase (PostgreSQL + PostGIS) integration
   - Query helpers: fetchTrophyById, findNearbyTrophies
   - Complete SQL schema with RLS policies

5. **`src/types/trophy.ts`** - Single Source of Truth
   - Trophy, User, CreateTrophyInput types
   - Used throughout mobile and web
   - Mirrors Supabase database schema

---

## The Technology Stack

### Frontend
- **Expo** (v53): Universal framework for iOS/Android/Web
- **Expo Router** (v5): File-based routing
- **React Native**: Mobile components
- **React Native Web**: Web support
- **TypeScript**: Type safety
- **Lucide React**: Icons (cross-platform)

### Backend
- **Supabase**: PostgreSQL + PostGIS + Auth + Real-time
  - PostGIS: Lightning-fast location queries
  - Row Level Security: User privacy
  - Real-time Subscriptions: Live updates

### State Management
- React Hooks: Built-in state management
- Expo AsyncStorage: Offline persistence

---

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Supabase account (free tier available)

### 2. Clone and Install
```bash
cd AnglerAlmanack
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials.

### 4. Set Up Supabase
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Copy your **Project URL** and **Anon Key**
- Run the SQL schema (see `src/services/supabaseClient.ts` comments) in Supabase SQL editor
- Enable PostGIS extension

### 5. Run Development Servers
```bash
# Mobile (iOS or Android)
npm run ios          # or: npm run android

# Web (with hot reload)
npm run web

# Both simultaneously (in separate terminals)
```

---
<!--
## The "Tweak Manual"

To maintain the codebase as a solo developer, follow this pattern for feature expansion:

### Adding a New Fish Species Property
1. **Database**: Add column to Supabase `trophies` table
2. **Types**: Update `Trophy` interface in `src/types/trophy.ts`
3. **Components**: Update `CatchCard.tsx` to display the property
4. **Forms**: Add input field to the catch form

**Example**: Adding water temperature
```bash
# 1. Supabase SQL
ALTER TABLE trophies ADD COLUMN water_temp NUMERIC;

# 2. Updated Trophy type
interface Trophy {
  water_temp?: number; // ✅ Added field
}

# 3. CatchCard shows it
{trophy.water_temp && (
  <Text>{trophy.water_temp}°C</Text>
)}
```

### Adding Monetization (Premium Features)
1. Add `is_premium` boolean to `users` table (already in schema)
2. Wrap premium components with permission check:
```typescript
{user.is_premium && <AdvancedWeatherComponent />}
```

### Integrating AI Species Identification
1. Add Gemini API key to `.env.local`
2. Create `src/services/geminiClient.ts`
3. Call it from `RecordCatch.tsx` when image is picked:
```typescript
const speciesGuess = await identifySpecies(imageUrl);
setSpecies(speciesGuess); // Auto-fill
```

### Implementing Privacy Controls
The `is_public` boolean in `trophies` table already controls visibility:
- `is_public = true`: Visible on web, indexed by Google
- `is_public = false`: Only visible to the user

RLS policies in Supabase enforce this automatically.

---

## Development Workflow

### File Organization Principle
- **If it's platform-agnostic** → put in `/src`
- **If it's routing/layout** → put in `/app`
- **If it's UI library stuff** → put in `/components`
- **If it's business logic** → put in `/features`
- **If it's external services** → put in `/services`

### Code Comments Standard
Every function should have a JSDoc comment:
```typescript
/**
 * @function myFunction
 * @description What it does
 * @param {string} param1 - Description
 * @returns {Promise<Trophy>} What it returns
 * @example
 * const result = await myFunction('valuehere');
 */
```

### Testing Strategy
1. **Mobile**: Test with Expo Go on real device
2. **Web**: Test at `localhost:3000` in browser
3. **Database**: Test queries in Supabase SQL editor first

---

## Scaling Considerations

### Current Limits
- Single Supabase free-tier instance: ~10K concurrent connections
- Image uploads: Use Supabase Storage (included)
- Real-time: Supabase realtime is efficient for live leaderboards

### Known Optimizations
- lazy-load CatchCard images with Expo Image
- Use PostGIS queries instead of fetching all trophies
- Implement server-side pagination in `fetchUserPublicTrophies`

### Future: Admin Dashboard
When you grow beyond solo dev, add:
```
app/
  admin/           # New route
    _layout.tsx
    dashboard.tsx  # moderation, analytics
```

---

## Troubleshooting

### Supabase Connection Fails
```
❌ Error: Supabase environment variables missing
✅ Solution: Copy .env.example → .env.local and fill in credentials
```

### Image Upload Not Working
```
❌ Error: CORS policy
✅ Solution: Enable CORS in Supabase Storage settings
```

### Web Version Doesn't Show Meta Tags
```
❌ Error: og:title not in page source
✅ Solution: Ensure Platform.OS === 'web' detection works
           Test on actual domain (not localhost for full crawl)
```

### PostGIS Distance Queries Slow
```
✅ Solution: Check that location_geom index exists:
           CREATE INDEX idx_trophies_location 
           ON trophies USING GIST(location_geom);
```

---

## Next Steps

1. **Immediate**: Follow "Setup Instructions" above
2. **Week 1**: Create user auth screens (use Supabase auth)
3. **Week 2**: Implement RecordCatch form
4. **Week 3**: Test sharing flow end-to-end
5. **Week 4**: Deploy web version to Vercel or Netlify
6. **Ongoing**: Reference "Tweak Manual" for new features

---

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/routing/introduction/)
- [Supabase Guides](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [React Native Web](https://necolas.github.io/react-native-web/)

---
-->
## Questions?

This architecture is designed for maximum flexibility as a solo developer. Each layer is decoupled:
- Change database → only update `src/services`
- Change UI → only update `/components` or `/app`
- Add feature → follows the "Tweak Manual" pattern

Good luck building Trophy Angler! 🎣
