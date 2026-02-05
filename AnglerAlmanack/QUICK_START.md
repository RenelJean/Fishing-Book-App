# 🚀 Quick Start Checklist

Use this checklist to get Trophy Angler running in 10 minutes.

---

## ✅ Before You Start

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created (free at https://supabase.com)
- [ ] VS Code or favorite editor open

---

## ✅ Step 1: Configure Environment (5 mins)

```bash
cd AnglerAlmanack

# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

**How to get these values:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" and "Anon Key"

---

## ✅ Step 2: Install Dependencies (3 mins)

```bash
npm install
```

---

## ✅ Step 3: Set Up Database (2 mins)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy the SQL from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
5. Paste into the query editor
6. Click **Run**

You should see: `Query successful!`

---

## ✅ Step 4: Test It Works (2 mins)

```bash
# Start the web version (easiest to test first)
npm run web
```

Open browser to: `http://localhost:3000`

You should see your Expo app running!

---

## ✅ Next Steps

Choose your path:

### 🎯 Path A: Continue Setup (Read Next)
Follow **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** for complete 7-phase setup:
- Phase 1-3: ✅ You're complete (5 mins)
- Phase 4: Build auth system (1-2 hours)
- Phase 5: Build catch form (2-3 hours)
- Phase 6: Test everything (1 hour)
- Phase 7: Deploy (1-2 hours)

### 🎯 Path B: Understand Architecture (Read Next)
Start with **[ARCHITECTURE.md](./ARCHITECTURE.md)** to understand:
- How folders are organized
- Why each file exists
- How components connect
- "Tweak Manual" for future features

### 🎯 Path C: Deploy ASAP (Advanced)
Run on your device:
```bash
npm install -g expo-cli
npm run ios      # iOS device/simulator
npm run android  # Android device/emulator
```

---

## 🆘 Troubleshooting

### ❌ Error: "Cannot find module @supabase/supabase-js"
```bash
✅ Solution:
npm install @supabase/supabase-js expo-location expo-image-picker expo-sharing
```

### ❌ Error: "EXPO_PUBLIC_SUPABASE_URL is not set"
```
✅ Solution: 
- Create .env.local file
- Copy from .env.example
- Fill in your Supabase credentials
- Restart the dev server
```

### ❌ Error: "Cannot enable PostGIS on this database"
```
✅ Solution:
PostGIS is pre-enabled on some Supabase projects.
In the SQL editor, run:
SELECT PostGIS_Version();

If you see a version, you're good!
```

### ❌ App loads but shows blank screen
```
✅ Solution:
- Check browser console (DevTools → Console tab)
- Look for red errors
- Verify .env.local has correct URLs
- Try: ctrl+shift+r (hard refresh)
```

---

## 📚 Learning Resources

| Topic | Resource | Time |
|-------|----------|------|
| What is Expo? | [Expo Intro](https://docs.expo.dev/get-started/introduction/) | 10 mins |
| How routing works | [Expo Router Guide](https://docs.expo.dev/routing/introduction/) | 15 mins |
| Database setup | [Supabase Docs](https://supabase.com/docs) | 20 mins |
| Geographic queries | [PostGIS Guide](https://postgis.net/documentation/) | 30 mins |

---

## 🎯 Success Indicators

You're on the right track when:

- ✅ App loads at `http://localhost:3000`
- ✅ You can navigate between screens
- ✅ Supabase shows "Query successful" for SQL
- ✅ You can view [ARCHITECTURE.md](./ARCHITECTURE.md) and understand folder structure
- ✅ You understand the "growth loop" (friends share → friends download → friends share)

---

## 💡 Pro Tips

1. **Keep terminals organized**: Use separate terminal tabs for dev server
2. **Save often**: Use Ctrl+S after every change
3. **Frontend first**: Build on web first (faster iteration), then test on mobile
4. **Check the docs**: Every error usually has a solution in [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
5. **Join Expo Community**: https://forums.expo.dev/ for help

---

## 🎬 Ready to Go?

1. **For setup guidance**: Start with [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
2. **For architecture questions**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **For database setup**: Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
4. **For overview**: Read [README.md](./README.md)

---

## 🏁 Final Checklist

- [ ] .env.local created with Supabase credentials
- [ ] `npm install` completed
- [ ] SQL schema run in Supabase
- [ ] `npm run web` starts without errors
- [ ] App loads in browser
- [ ] Understand the growth loop concept
- [ ] Ready to follow IMPLEMENTATION_GUIDE.md

You're ready to build Trophy Angler! 🎣

---

**Need help?** Check the [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) troubleshooting section or Expo forums.
