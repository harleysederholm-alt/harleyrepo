# 🚀 NexusBoard - Quick Start (5 Minutes)

## ⚡ TL;DR

```bash
# 1. Get API keys
# - Supabase: https://supabase.com (Settings → API)
# - Claude: https://console.anthropic.com/

# 2. Copy environment file
cp .env.nexusboard.example .env.local

# 3. Edit .env.local with your keys

# 4. Run migrations in Supabase dashboard:
# SQL Editor → paste supabase/migrations/004_nexusboard_schema.sql → Run

# 5. Start development
npm install  # Only needed if you haven't already
npm run dev

# 6. Visit http://localhost:3000
# Sign up → Create organization → Create project → Done!
```

---

## 📋 Prerequisites

- Node.js 18+ (`node --version`)
- npm or yarn
- Supabase account (free at https://supabase.com)
- Anthropic API key (free tier at https://console.anthropic.com/)

---

## 🎯 Step-by-Step Setup

### Step 1: Create Supabase Project (2 minutes)

1. Go to https://app.supabase.com
2. Click "New project"
3. Name it `nexusboard`
4. Choose region closest to you
5. Create strong password
6. Wait for initialization (~1 minute)

### Step 2: Get Credentials (1 minute)

In Supabase dashboard:
1. Go to **Settings** → **API**
2. Copy these 3 values:
   - `Project URL`
   - `anon public key`
   - `service_role secret` (⚠️ Keep secret!)

### Step 3: Configure Environment (1 minute)

```bash
cp .env.nexusboard.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=[Your Project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon public key]
SUPABASE_SERVICE_ROLE_KEY=[service_role secret]
ANTHROPIC_API_KEY=[Your Claude API key]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Run Database Migration (1 minute)

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/004_nexusboard_schema.sql`
4. Copy entire content → Paste in Supabase
5. Click **Run**
6. Wait for success message

### Step 5: Start Development (0 minutes)

```bash
npm install
npm run dev
```

Visit http://localhost:3000/signup

### Step 6: Test It! (1 minute)

```
1. Sign up: testuser / test@example.com / password
2. Click "New Organization" → Name: "My Team"
3. Click "New Project" → Name: "My Project"
4. You should see Kanban board with 3 columns!
5. Click "Add Task" → Create a task
6. Drag task between columns
7. Click task → Add comments
8. Click "Summarize with AI" → Works!
```

---

## ✅ Verification Checklist

After setup:

- [ ] Sign up page works
- [ ] Login page works
- [ ] Can create organization
- [ ] Can create project
- [ ] Kanban board displays
- [ ] Can create tasks
- [ ] Can drag tasks between columns
- [ ] Can add comments to tasks
- [ ] AI summarizer works

---

## 🚀 Deploy to Production (5 minutes)

### Option A: Vercel (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Add NexusBoard"
git push origin main

# 2. Go to vercel.com → Import Git Repo

# 3. Add environment variables in Vercel:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
#    SUPABASE_SERVICE_ROLE_KEY
#    ANTHROPIC_API_KEY

# 4. Deploy!
# Vercel automatically builds and deploys

# 5. Update Supabase Settings:
#    Authentication → URL Configuration →
#    Site URL: https://your-app.vercel.app
#    Redirect URLs: https://your-app.vercel.app/auth/callback
```

### Option B: Self-Hosted

```bash
npm run build
npm start
# App runs on port 3000
```

---

## 🆘 Quick Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is missing"
→ Check `.env.local` exists in root and has all 3 keys

### "RLS policy preventing access"
→ Ensure you ran the SQL migration successfully
→ Check in Supabase: all RLS policies should be enabled

### "Drag-drop not working"
→ Clear cache: `rm -rf .next && npm run dev`

### "Claude API 401 error"
→ Verify API key in Supabase environment variables
→ Check key is valid at console.anthropic.com

### "Can't drag tasks"
→ Ensure `react-beautiful-dnd` is installed: `npm install react-beautiful-dnd`

---

## 📚 Next Steps

After setup works:

1. **Customize UI**: Edit Tailwind colors in `tailwind.config.ts`
2. **Add Team Members**: Extend `org_members` table
3. **Add Features**: See "Future Enhancements" in main README
4. **Host Database**: Supabase has built-in hosting
5. **Add Webhook**: Integrate with Slack, Discord, etc.

---

## 📞 Help

- Full guide: `NEXUSBOARD_SETUP.md`
- Architecture: `NEXUSBOARD_README.md`
- Code: See comments in `/components/kanban-board.tsx`

---

**You should be able to see a working Kanban board in 5 minutes!** 🎉
