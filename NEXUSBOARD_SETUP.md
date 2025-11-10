# NexusBoard - Complete Setup & Installation Guide

## 📋 Prerequisites

Before getting started, ensure you have:

- Node.js 18+ and npm/yarn installed
- A Supabase account (https://supabase.com)
- An Anthropic Claude API key (https://console.anthropic.com/)
- Git installed

---

## 🚀 Phase 1: Project Initialization

### Step 1.1: Create Next.js Project

```bash
npx create-next-app@latest nexusboard --typescript --tailwind --app
cd nexusboard
```

### Step 1.2: Install Dependencies

```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  @supabase/auth-ui-react \
  @supabase/auth-ui-shared \
  react-beautiful-dnd \
  @dnd-kit/sortable \
  @dnd-kit/core \
  lucide-react \
  @anthropic-ai/sdk \
  class-variance-authority \
  clsx \
  tailwind-merge \
  @radix-ui/react-slot

npm install --save-dev \
  @types/react-beautiful-dnd \
  typescript
```

### Step 1.3: Verify Installation

```bash
npm run build
```

---

## 🗄️ Phase 2: Supabase Setup

### Step 2.1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New project"
3. Enter project name: `nexusboard`
4. Choose a region close to you
5. Create a strong password for the database
6. Wait for project to initialize

### Step 2.2: Get Connection Details

1. Go to Project Settings → API
2. Copy and save:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2.3: Run Database Migrations

1. Go to SQL Editor in Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire content of `supabase/migrations/004_nexusboard_schema.sql`
4. Click "Run"
5. Wait for completion

### Step 2.4: Enable Realtime

1. Go to Database → Replication
2. Enable replication for:
   - `tasks`
   - `comments`
   - `columns`
   - `projects`

### Step 2.5: Configure Authentication

1. Go to Authentication → Providers
2. Email provider should be enabled by default
3. (Optional) Enable Google/GitHub OAuth if desired

### Step 2.6: Set Up Row Level Security (RLS)

The RLS policies are automatically created by the migration SQL. Verify:

1. Go to Database → Tables
2. For each table (profiles, organizations, projects, tasks, comments):
   - Click on the table
   - Go to "RLS" tab
   - Ensure all policies are enabled (toggle should be ON)

---

## 🔐 Phase 3: Environment Configuration

### Step 3.1: Create .env.local

```bash
cp .env.nexusboard.example .env.local
```

### Step 3.2: Fill in Environment Variables

Edit `.env.local`:

```env
# Get from Supabase Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Get from Anthropic Console
ANTHROPIC_API_KEY=sk-ant-v1-...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3.3: Verify Configuration

```bash
npm run dev
```

Visit http://localhost:3000/login - you should see the login page without errors.

---

## 🎨 Phase 4: Frontend Configuration

### Step 4.1: Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
      },
    },
  },
  plugins: [],
}
export default config
```

### Step 4.2: Configure Next.js

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
}

module.exports = nextConfig
```

---

## 🧪 Phase 5: Testing

### Step 5.1: Test Authentication Flow

```bash
npm run dev
```

1. Visit http://localhost:3000/signup
2. Create account with:
   - Full Name: `Test User`
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `SecurePassword123!`
3. Should redirect to dashboard

### Step 5.2: Test Organization & Project Creation

1. Click "New Organization"
2. Fill in name and description
3. Click "Create Organization"
4. Click "New Project"
5. Fill in project details
6. Should see default columns (To Do, In Progress, Done)

### Step 5.3: Test Kanban Board

1. Click on a project
2. Try dragging tasks between columns
3. Create a new task by clicking "Add Task"
4. Open task modal by clicking a task card
5. Add comments to the task

### Step 5.4: Test AI Summarizer

1. Add 2-3 comments to a task
2. Click "Summarize with AI" button
3. Should generate a one-sentence summary of comments

---

## 🌍 Phase 6: Deployment (Vercel)

### Step 6.1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: NexusBoard"
git branch -M main
git remote add origin https://github.com/yourusername/nexusboard.git
git push -u origin main
```

### Step 6.2: Deploy to Vercel

1. Go to https://vercel.com/import
2. Connect your GitHub repository
3. Vercel will auto-detect Next.js
4. Click "Deploy"

### Step 6.3: Configure Environment Variables

In Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`

### Step 6.4: Configure Supabase for Production

In Supabase dashboard:

1. Go to Authentication → URL Configuration
2. Add:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:**
     ```
     https://your-app.vercel.app/auth/callback
     https://your-app.vercel.app/dashboard
     ```

### Step 6.5: Deploy

```bash
git add .env.local  # If you updated NEXT_PUBLIC_APP_URL
git commit -m "Update production URLs"
git push origin main
```

Vercel will automatically redeploy. Visit your production URL!

---

## 🔒 Security Checklist

- [ ] All environment variables are configured in production
- [ ] Supabase RLS policies are enabled
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY is the public (anon) key, not service role
- [ ] SUPABASE_SERVICE_ROLE_KEY is kept secret (never commit to git)
- [ ] Authentication redirect URLs are configured in Supabase
- [ ] CORS is properly configured (Vercel handles this automatically)
- [ ] Anthropic API key is kept secret
- [ ] Database backups are enabled in Supabase

---

## 📦 Project Structure

```
nexusboard/
├── app/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard layout with auth check
│   │   ├── page.tsx              # Dashboard home (projects list)
│   │   ├── organizations/        # Organizations page
│   │   └── project/
│   │       └── [id]/             # Project Kanban board
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   ├── auth/
│   │   └── callback/             # OAuth callback
│   ├── logout/                   # Logout route
│   ├── api/
│   │   └── summarize/            # AI summarization API
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # Reusable UI components
│   ├── header.tsx                # Navigation header
│   ├── kanban-board.tsx          # Kanban board component
│   ├── task-modal.tsx            # Task details modal
│   ├── ai-summarizer.tsx         # AI comment summarizer
│   ├── new-organization-modal.tsx
│   └── new-project-modal.tsx
├── lib/
│   ├── supabase/
│   │   ├── browser.ts            # Client-side Supabase
│   │   └── server.ts             # Server-side Supabase
│   ├── types/                    # TypeScript type definitions
│   └── utils.ts
├── supabase/
│   └── migrations/
│       └── 004_nexusboard_schema.sql
├── .env.nexusboard.example       # Environment template
└── [configuration files]
```

---

## 🆘 Troubleshooting

### "Error: NEXT_PUBLIC_SUPABASE_URL is missing"

**Solution:** Check that `.env.local` is in the project root and contains all required variables.

### "Authentication fails after signup"

**Solution:**
1. Check that Supabase auth is enabled
2. Verify redirect URLs in Supabase dashboard
3. Check browser console for specific error

### "Kanban drag-and-drop not working"

**Solution:**
1. Ensure `react-beautiful-dnd` is installed: `npm install react-beautiful-dnd`
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server

### "RLS policy prevents data access"

**Solution:**
1. Go to Supabase SQL Editor
2. Run: `SELECT * FROM auth.users;` (should show your user)
3. Verify RLS policies are enabled on all tables
4. Check policy conditions reference correct auth.uid()

### "Claude API returns 401 error"

**Solution:**
1. Verify API key in Supabase environment variables
2. Go to https://console.anthropic.com/ and check API key is correct
3. Ensure API key has required permissions

---

## 📚 Key Endpoints & Pages

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/login` | User authentication |
| Signup | `/signup` | New account creation |
| Dashboard | `/dashboard` | Projects overview |
| Organizations | `/dashboard/organizations` | Organization management |
| Project Board | `/dashboard/project/[id]` | Kanban board |
| API Summarize | `/api/summarize` (POST) | AI comment summarization |

---

## 🎯 Core Features

### ✅ Implemented

- [x] User authentication (Supabase Auth)
- [x] Organizations & member management
- [x] Projects with Kanban boards
- [x] Real-time task updates (Supabase Realtime)
- [x] Drag-and-drop task management
- [x] Task comments
- [x] AI-powered comment summarization (Claude)
- [x] Responsive design (Tailwind CSS)
- [x] Row-level security (Supabase RLS)

### 🚀 Optional Enhancements

- [ ] Task assignments & mentions
- [ ] File attachments to tasks
- [ ] Activity timeline / audit log
- [ ] Dark mode toggle
- [ ] Email notifications
- [ ] Team notifications/activity feed
- [ ] Advanced search & filtering
- [ ] Task templates
- [ ] Custom fields
- [ ] Time tracking
- [ ] Mobile app

---

## 📞 Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Claude API Docs:** https://docs.anthropic.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Beautiful DND:** https://github.com/atlassian/react-beautiful-dnd

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🎉 You're Done!

NexusBoard is now fully set up and ready to use. Happy collaborating!
