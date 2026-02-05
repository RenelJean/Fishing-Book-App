# 🆘 Getting Help & Support Guide

When you get stuck, use this guide to find the answer.

---

## 🎯 Problem Categories

### 📚 "I don't understand..."

| Question | Read This |
|----------|-----------|
| What is Trophy Angler? | [README.md](./README.md) |
| How does the code organize? | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| What files were created? | [FILE_TREE.md](./FILE_TREE.md) |
| How will users adopt it? | README.md → "The Growth Loop" |
| What's PostGIS? | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) (SQL section) |

---

### 🔧 "How do I setup/install..."

| Question | Read This |
|----------|-----------|
| Get it running in 10 mins? | [QUICK_START.md](./QUICK_START.md) |
| Full setup with all features? | [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) |
| Database tables and schema? | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) |
| Configure environment variables? | [QUICK_START.md](./QUICK_START.md) → Step 1 |
| Install Node.js/npm? | [Node.js official site](https://nodejs.org) |

---

### ❌ "I'm getting an error..."

| Error | Read This |
|-------|-----------|
| "Cannot find module @supabase/supabase-js" | [QUICK_START.md](./QUICK_START.md) → Troubleshooting |
| "EXPO_PUBLIC_SUPABASE_URL is not set" | [QUICK_START.md](./QUICK_START.md) → Step 1 |
| "Cannot enable PostGIS" | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) → Troubleshooting |
| App loads but blank screen | [QUICK_START.md](./QUICK_START.md) → Troubleshooting |
| "npm: command not found" | Install [Node.js](https://nodejs.org) first |
| RLS policy errors | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) → RLS Policies section |
| Location queries slow | [ARCHITECTURE.md](./ARCHITECTURE.md) → Scaling Considerations |
| Images won't upload | [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) → Phase 5 |

---

### 💡 "How do I add a feature..."

| Feature | Read This |
|---------|-----------|
| New field to catch record | [ARCHITECTURE.md](./ARCHITECTURE.md) → "Tweak Manual" |
| Premium features | [ARCHITECTURE.md](./ARCHITECTURE.md) → "Tweak Manual" → "Monetization" |
| AI species identification | [ARCHITECTURE.md](./ARCHITECTURE.md) → "Tweak Manual" → "AI Species ID" |
| Privacy controls | [ARCHITECTURE.md](./ARCHITECTURE.md) → "Tweak Manual" → "Privacy" |
| Custom component | [ARCHITECTURE.md](./ARCHITECTURE.md) → "File Organization Principle" |
| New API integration | [ARCHITECTURE.md](./ARCHITECTURE.md) → File Organization → `/src/services` |

---

### 🚀 "How do I deploy..."

| Platform | Read This |
|----------|-----------|
| Website (Vercel/Netlify) | [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) → Phase 7 → "Deploy Web Version" |
| iOS App Store | [Expo docs](https://docs.expo.dev/submit/ios/) or [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) → Phase 7 |
| Google Play Store | [Expo docs](https://docs.expo.dev/submit/android/) or [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) → Phase 7 |
| Local testing on device | [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) → Phase 3 |

---

### 🤔 "Why is this implemented this way..."

| Question | Read This |
|----------|-----------|
| One codebase for all platforms? | [README.md](./README.md) → Architecture |
| Why Supabase? | [README.md](./README.md) → Tech Stack |
| Why PostGIS? | [README.md](./README.md) → Key Features → "Find Nearby Catches" |
| Why this folder structure? | [ARCHITECTURE.md](./ARCHITECTURE.md) → Folder Structure |
| Why shared components? | [README.md](./README.md) → Architecture |
| Why RLS policies? | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) → RLS Policy section |

---

## 📖 Document Index

### For Quick Navigation
- **[README.md](./README.md)** - Start here! Project overview
- **[QUICK_START.md](./QUICK_START.md)** - 10-minute setup
- **[FILE_TREE.md](./FILE_TREE.md)** - What was created

### For Setup & Installation
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - 7-phase complete guide
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Database setup
- **[.env.example](./.env.example)** - Configuration template

### For Understanding the System
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design & patterns
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built

---

## 🔍 Search Tips

### In VS Code
```
Ctrl+P                 # Quick file open (type filename)
Ctrl+F                 # Find in current file
Ctrl+Shift+F           # Find across all files
Ctrl+H                 # Find and replace
```

### In Documentation
```
Ctrl+F in browser      # Find text on page
^L (Ctrl+L)            # Go to specific section
```

---

## 🌐 External Resources

### Official Documentation
- **[Expo Docs](https://docs.expo.dev)** - Comprehensive Expo guide
- **[Expo Router](https://docs.expo.dev/routing/introduction/)** - File-based routing
- **[Supabase Docs](https://supabase.com/docs)** - Database and auth
- **[PostGIS Manual](https://postgis.net/documentation/)** - Geographic queries
- **[React Native Web](https://necolas.github.io/react-native-web/)** - Web support
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Type safety

### Community Help
- **[Expo Forums](https://forums.expo.dev/)** - Official Expo community
- **[Supabase Docs Chat](https://supabase.com/docs)** - Get help
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/expo)** - Search tagged posts
- **[GitHub Discussions](https://github.com/)** - Ask in Expo repo

### Video Tutorials
- **[Expo YouTube Channel](https://youtube.com/@expo)** - Official videos
- **[Supabase YouTube](https://youtube.com/@supabase)** - Database tutorials
- **[React Native Web](https://www.youtube.com/results?search_query=react+native+web)** - Community videos

---

## 🛠️ Common Solutions

### My dev server won't start
```bash
# Kill any running servers
killall node

# Clear cache
rm -rf node_modules .expo
npm install

# Try again
npm run web
```

### Port already in use
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
npx expo start --web --port 3001
```

### Can't connect to Supabase
```bash
# Verify credentials
cat .env.local | grep SUPABASE

# Test connection with test query:
# Copy from IMPLEMENTATION_GUIDE.md Phase 1
```

### TypeScript errors
```bash
# Restart TS compiler
# In VS Code: Ctrl+Shift+P → "Restart TS server"

# Check tsconfig.json
cat tsconfig.json
```

---

## 📝 Quick Reference

### GitHub/Git Commands
```bash
# Clone the repo
git clone <url>
cd AnglerAlmanack

# Create a branch for features
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "Add feature description"

# Push to remote
git push origin feature/my-feature
```

### npm Commands
```bash
npm install            # Install dependencies
npm run web            # Start web dev server
npm run ios            # Start iOS dev server
npm run android         # Start Android dev server
npm run lint           # Run linter
npm test               # Run tests (when setup)
```

### Expo Commands
```bash
expo start             # Start Expo server
expo start --web       # Start web specifically
expo start --ios       # Start iOS specifically
expo start --android   # Start Android specifically
expo logout            # Clear login
expo login             # Login to Expo account
```

---

## 🎓 Learning Path

### Week 1: Getting Started
- [ ] Read README.md
- [ ] Complete QUICK_START.md
- [ ] Understand architecture from ARCHITECTURE.md
- [ ] Set up Supabase using SUPABASE_SETUP.md

### Week 2: Building Features
- [ ] Follow IMPLEMENTATION_GUIDE.md phases
- [ ] Phase 4: Build auth system
- [ ] Phase 5: Build record catch form
- [ ] Phase 6: Test everything

### Week 3: Expanding
- [ ] Review ARCHITECTURE.md "Tweak Manual"
- [ ] Add your own features
- [ ] Test comprehensively
- [ ] Prepare for Phase 7 deployment

### Week 4: Deployment
- [ ] Follow Phase 7: Deploy
- [ ] Deploy web version
- [ ] Build and submit mobile apps
- [ ] Monitor for issues

---

## 🆘 When All Else Fails

1. **Check the docs first**
   - Search your error message in [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
   - Look in [QUICK_START.md](./QUICK_START.md) troubleshooting

2. **Check Expo/Supabase official docs**
   - [Expo Docs](https://docs.expo.dev) (ctrl+F to search)
   - [Supabase Docs](https://supabase.com/docs) (most answers are there!)

3. **Ask in communities**
   - [Expo Forums](https://forums.expo.dev/) (fastest for Expo issues)
   - [Stack Overflow](https://stackoverflow.com) (tag your question properly)
   - [Supabase Discord](https://discord.supabase.com) (quick help)

4. **Debug systematically**
   - Browser console (F12) for web errors
   - `npm run web` to test on simple platform first
   - Read error messages carefully (they're usually helpful!)
   - Google the exact error message

5. **Check the code**
   - Look at similar files in the codebase
   - Search for patterns using Ctrl+Shift+F
   - Read comments (they explain the "why")

---

## 📞 Still Stuck?

Before asking for help, make sure you've:

- [ ] Read the relevant documentation from above
- [ ] Checked the troubleshooting section
- [ ] Searched online for your error message
- [ ] Restarted your terminal/computer
- [ ] Cleaned node_modules and reinstalled
- [ ] Checked your `.env.local` has correct values

Then provide:
1. **What you tried** (exact commands)
2. **What happened** (error message)
3. **What you expected** (intended outcome)
4. **Bonus:** Screenshot of error

Good luck! 🎣

---

**Remember:** The documentation is your friend. Most answers are in one of these files!
