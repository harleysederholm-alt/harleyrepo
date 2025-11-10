# Autonomous Recruitment Agent - Complete Implementation Guide

## 🎯 Project Overview

The **Autonomous Recruitment Agent** is a complete end-to-end recruitment automation system that eliminates the need for recruitment agencies or HR consultants for SMEs. It uses Claude AI as the "brain" and n8n workflows as the "hands" to automate:

1. **Job posting generation** (AI-written professional job descriptions)
2. **CV screening** (AI-powered candidate ranking)
3. **Interview scheduling** (Automatic calendar management with Google Calendar)
4. **Decision notifications** (Automated rejection & offer emails)

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React/Next.js)                  │
│         ├─ Recruitment Dashboard (Kanban board)             │
│         ├─ Job management                                    │
│         └─ Real-time candidate tracking                     │
└────────────────┬────────────────────────────────────────────┘
                 │ (HTTP Webhooks)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              API ENDPOINTS (Next.js Routes)                 │
│         ├─ /api/recruitment/webhook                         │
│         ├─ /api/recruitment/schedule-interview              │
│         └─ /api/recruitment/decision                        │
└────────────────┬────────────────────────────────────────────┘
                 │ (Trigger)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              N8N ORCHESTRATION LAYER                        │
│    ├─ Workflow A: Job Creation & Claude AI Writing          │
│    ├─ Workflow B: Email & CV Extraction (Claude Vision)     │
│    ├─ Workflow C: Interview Scheduling (Google Calendar)    │
│    └─ Workflow D: Decision Emails (Claude)                  │
└────────────────┬────────────────────────────────────────────┘
                 │ (Read/Write)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)                 │
│    ├─ jobs (job postings)                                   │
│    ├─ candidates (applicants)                               │
│    ├─ interviews (scheduled interviews)                     │
│    └─ Real-time subscriptions for Kanban updates            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Components & Files

### Frontend Components

**Main Pages:**
- `/app/recruitment/page.tsx` - Recruitment dashboard with Kanban board

**Components:**
- `components/recruitment/NewRecruitmentModal.tsx` - Modal to create new recruitment
- `components/recruitment/RecruitmentKanban.tsx` - Kanban board with drag-and-drop
- `components/ui/button.tsx` - Reusable button component
- `components/ui/card.tsx` - Reusable card component

**Hooks:**
- `lib/hooks/useToast.ts` - Toast notifications
- `lib/auth/useAuth.ts` - Authentication hook

### Backend Routes

**API Endpoints:**
- `POST /api/recruitment/webhook` - Main trigger for n8n workflows
- `POST /api/recruitment/schedule-interview` - Interview scheduling webhook
- `POST /api/recruitment/decision` - Decision notification webhook

### Database

**Migration File:**
- `supabase/migrations/003_recruitment_system.sql`

**Tables:**
- `jobs` - Job postings
- `candidates` - Applicants
- `interviews` - Scheduled interviews

### Documentation

- `docs/n8n-workflows.md` - Detailed n8n workflow specifications
- `docs/RECRUITMENT_AGENT_GUIDE.md` - This file

---

## 🚀 Getting Started

### Prerequisites

1. **Supabase Project**
   - PostgreSQL database
   - Auth configured
   - Storage bucket for CVs

2. **Claude API Key**
   - From https://console.anthropic.com/

3. **Google Calendar API Credentials**
   - OAuth 2.0 client credentials
   - Calendar read/write permissions

4. **Gmail Account**
   - For sending recruitment emails
   - Less secure app password or OAuth credentials

5. **n8n Instance**
   - Self-hosted or n8n Cloud
   - API access

### Environment Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables** (`.env.local`)
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...

   # Claude API
   ANTHROPIC_API_KEY=sk-ant-...

   # Google APIs
   GOOGLE_CALENDAR_API_KEY=AIza...
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSP-...

   # Gmail
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

   # n8n Webhooks
   N8N_BASE_URL=https://n8n-instance.com
   N8N_API_KEY=xxx

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run Database Migrations**
   ```bash
   # Option 1: Via Supabase Dashboard
   # Go to SQL Editor → paste contents of 003_recruitment_system.sql

   # Option 2: Via CLI
   supabase db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 🔄 Workflow Overview

### User Journey

#### Manager (Admin) Perspective:

1. **Create Recruitment**
   - Click "New Recruitment" button
   - Enter: Job Title, Location, Requirements
   - Submit

2. **AI Generates Job Description**
   - (Workflow A triggered via webhook)
   - Manager receives email with AI-generated job posting
   - Manager reviews and clicks "Approve"

3. **Monitor Applications**
   - CVs arrive via email to `recruitment+{job_id}@company.com`
   - (Workflow B runs automatically)
   - Candidates appear in Kanban "New Applications" column
   - Ranked by AI score (0-100%)

4. **Schedule Interviews**
   - Drag candidate to "Scheduled Interviews" column
   - (Workflow C triggered)
   - Candidate receives invitation with time options
   - Candidate confirms → Calendar event created automatically

5. **Make Decision**
   - Drag candidate to "Hired" or "Rejected" column
   - (Workflow D triggered)
   - Automated decision email sent
   - If hired: Employment contract generated and sent

#### Candidate Perspective:

1. **Apply**
   - Find job posting
   - Send CV to `recruitment+{job_id}@company.com`

2. **Receive Confirmation**
   - Auto-reply: "Thank you for applying"

3. **Get Interview Invitation** (if screened positively)
   - Personalized email with 5 suggested times
   - Click to confirm + add to calendar

4. **Receive Outcome**
   - If hired: Congratulations email + contract
   - If rejected: Professional, respectful rejection email

---

## 💾 Database Schema

### `jobs` Table
```sql
- id (UUID) - Primary key
- user_id (UUID) - Foreign key to auth.users
- title (VARCHAR) - Job title
- description_prompt (TEXT) - Original prompt
- generated_description (TEXT) - AI-generated description
- location (VARCHAR) - Job location
- salary_range (VARCHAR) - Optional salary info
- requirements (TEXT[]) - Array of requirements
- status (VARCHAR) - 'draft', 'published', 'closed', 'archived'
- published_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### `candidates` Table
```sql
- id (UUID) - Primary key
- job_id (UUID) - Foreign key to jobs
- user_id (UUID) - Foreign key to auth.users
- name (VARCHAR) - Candidate name
- email (VARCHAR) - Candidate email
- phone (VARCHAR) - Optional phone
- cv_text (TEXT) - Extracted CV text
- cv_url (VARCHAR) - URL to original file in Storage
- ai_score (INTEGER 0-100) - Screening score
- ai_summary (TEXT) - 3-sentence fit summary
- ai_reasoning (TEXT) - Detailed analysis
- status (VARCHAR) - 'new', 'screened', 'interviewing', 'rejected', 'hired'
- rejection_email_sent (BOOLEAN)
- offer_email_sent (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### `interviews` Table
```sql
- id (UUID) - Primary key
- candidate_id (UUID) - Foreign key to candidates
- job_id (UUID) - Foreign key to jobs
- user_id (UUID) - Foreign key to auth.users
- google_calendar_event_id (VARCHAR) - Calendar event ID
- scheduled_at (TIMESTAMP) - Interview time
- meeting_link (VARCHAR) - Google Meet link
- manager_feedback (TEXT) - Notes after interview
- status (VARCHAR) - 'scheduled', 'completed', 'cancelled'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🤖 n8n Workflow Configuration

### Workflow A: Job Creation
**File:** See `docs/n8n-workflows.md` - Workflow A section

**Summary:**
1. Receive job creation request from frontend
2. Call Claude API to generate professional job description in Finnish
3. Save to database
4. Email manager for approval
5. Wait for approval webhook
6. If approved: publish job and trigger email listener

### Workflow B: CV Screening
**File:** See `docs/n8n-workflows.md` - Workflow B section

**Summary:**
1. Listen to `recruitment@company.com` inbox (IMAP)
2. Extract CV from email attachment
3. Use Claude Vision to extract CV text
4. Query database for job description
5. Use Claude to score candidate (0-100)
6. Save candidate with score and summary
7. Send thank you email to candidate
8. Update Kanban board in real-time

### Workflow C: Interview Scheduling
**File:** See `docs/n8n-workflows.md` - Workflow C section

**Summary:**
1. Receive schedule interview request
2. Check manager's Google Calendar for free slots
3. Generate personalized interview invitation (Claude)
4. Send email with 5 time suggestions
5. Wait for candidate response
6. Create Google Calendar event with Google Meet
7. Send confirmation to both parties

### Workflow D: Decision Handling
**File:** See `docs/n8n-workflows.md` - Workflow D section

**Summary:**

**REJECTION PATH:**
1. Generate professional rejection email (Claude)
2. Send to candidate
3. Update status

**OFFER PATH:**
1. Generate congratulations email (Claude)
2. Generate employment contract draft (Claude)
3. Convert to PDF
4. Send to candidate + manager
5. Set reminder to follow up

---

## 🔑 Key Features

### 1. AI-Powered Job Description Generation
- Claude generates professional job postings in Finnish
- Based on manager's brief requirements
- Can be edited before publishing

### 2. Intelligent CV Screening
- Claude Vision extracts text from PDF/DOCX CVs
- AI compares CV to job requirements
- Scores candidates 0-100%
- Provides 3-sentence summary

### 3. Automatic Interview Scheduling
- Reads manager's Google Calendar
- Suggests available time slots
- Candidate selects preferred time
- Automatically creates calendar event + Google Meet link
- Sends calendar invitations

### 4. Personalized Communication
- All candidate emails are AI-generated
- Personalized based on candidate name and role
- Professional, warm tone in Finnish/English
- Includes next steps and contact info

### 5. Real-time Dashboard
- Kanban board with drag-and-drop
- Real-time updates via Supabase subscriptions
- Candidate details, scores, and summaries
- Interview schedule integration

### 6. Employment Contract Generation
- Claude generates standard Finnish employment contracts
- Includes candidate details
- Ready for manager to add salary/benefits
- Automatically sent to candidate

---

## 📊 Kanban Board Statuses

```
┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌────────┐
│     NEW     │→ │   SCREENED   │→ │ INTERVIEWING │→ │ REJECTED │  │ HIRED  │
│Applications│  │ (Top Matches) │  │              │  │          │  │        │
└─────────────┘  └──────────────┘  └──────────────┘  └──────────┘  └────────┘
     ↓              ↓                   ↓               ↓             ↓
  Auto thank  Auto rank         Auto invite      Auto reject   Auto offer +
  you email   by AI score      with times       email          contract
```

**Status Details:**

- **NEW**: Just applied, CV auto-extracted
- **SCREENED**: Top candidates after AI analysis (typically 70%+ score)
- **INTERVIEWING**: Interview scheduled, pending
- **REJECTED**: Received professional rejection email
- **HIRED**: Made offer, contract sent

---

## 🔐 Security & Privacy

### Row-Level Security (RLS)
- All tables have RLS policies enabled
- Users can only see their own jobs and candidates
- Service role can access for n8n workflows

### Data Protection
- CVs stored in Supabase Storage (encrypted)
- Candidate emails encrypted in database
- No sensitive data in logs
- GDPR-compliant data retention policies

### Authentication
- Supabase Auth with email/password
- Session management
- Protected routes (middleware.ts)

---

## 📈 Performance & Scaling

### Optimization Tips

1. **Database Indexes**
   - Indexed on: job_id, user_id, status, ai_score
   - Regular ANALYZE for query optimization

2. **Real-time Updates**
   - Supabase real-time subscriptions (PostgreSQL LISTEN/NOTIFY)
   - Only subscribe to relevant tables/jobs

3. **API Rate Limiting**
   - Claude API: 10,000 requests/min (sufficient)
   - Google Calendar: 10,000 calls/day free (sufficient)
   - Gmail: 15M emails/day free

4. **Workflow Optimization**
   - Batch similar operations in n8n
   - Use PostgreSQL for heavy filtering
   - Cache frequently accessed data

### Scalability Path

```
Current (Single Job):     ~10-50 applications/day
Growth (10 Jobs):         ~100-500 applications/day
                          → Add n8n Cloud plan
                          → Increase Supabase CPU

Enterprise (100+ Jobs):   ~1000+ applications/day
                          → Self-hosted n8n
                          → Dedicated database
                          → Message queue (Redis)
```

---

## 🐛 Troubleshooting

### Common Issues

**1. CVs not being extracted**
- Check IMAP credentials in n8n
- Verify attachment is PDF/DOCX
- Check Claude API rate limits

**2. Interview not being scheduled**
- Verify Google Calendar OAuth token valid
- Check manager has calendar access
- Ensure "Interview" calendar exists

**3. Candidates not appearing in Kanban**
- Check Supabase real-time subscriptions enabled
- Verify RLS policies allow user access
- Check browser console for JS errors

**4. Emails not sending**
- Verify Gmail credentials/app password
- Check SPF/DKIM records
- Confirm email templates are valid

### Debug Steps

1. **Check n8n workflow logs**
   - Go to n8n dashboard → Execution history
   - Look for red X marks (failed steps)
   - Click step to see error details

2. **Check Supabase logs**
   - Go to Supabase dashboard → Logs
   - Filter by table name
   - Look for RLS policy violations

3. **Monitor API calls**
   - Use browser DevTools → Network tab
   - Check for 4xx/5xx responses
   - Verify webhook payloads

---

## 🚢 Deployment

### Vercel (Frontend)

```bash
vercel deploy
```

Set environment variables in Vercel dashboard.

### Supabase (Database)

Migrations already in place. Just ensure RLS is enabled.

### n8n (Workflows)

Option 1: **n8n Cloud** (recommended for SMEs)
- Sign up at n8n.cloud
- Create workflows from JSON/UI
- Webhook URLs auto-generated

Option 2: **Self-hosted n8n**
```bash
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

---

## 📞 Support & Documentation

- **Claude API Docs:** https://docs.anthropic.com/
- **n8n Docs:** https://docs.n8n.io/
- **Supabase Docs:** https://supabase.com/docs/
- **Google Calendar API:** https://developers.google.com/calendar

---

## 💰 Cost Estimation (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Claude API | $10-50 | Depends on CV volume |
| Supabase | $25-100 | Standard plan + storage |
| Google APIs | Free | Free tier sufficient |
| Gmail | Free | 15GB included |
| n8n Cloud | $20-100 | Depends on executions |
| Vercel | Free-50 | Free tier usually sufficient |
| **TOTAL** | **$75-300** | Per month for SME |

**Comparison:** Traditional recruitment agency charges 15-25% of first year salary. For a €50k role, that's €7,500-12,500. This system pays for itself in 1 hire!

---

## 🎓 Next Steps

1. Set up Supabase project and run migrations
2. Create n8n account and configure integrations
3. Set environment variables
4. Test end-to-end workflow with test job/CV
5. Deploy to Vercel
6. Go live!

---

