# Autonomous Recruitment Agent - n8n Workflows

Tämä dokumentti kuvaa neljä n8n-työnkulkua, jotka muodostavat rekrytointi-agentin ytimen.

## Arkkitehtuuri

```
[Frontend Dashboard]
    ↓ (Webhook trigger)
    ├→ [Workflow A: Rekrytoinnin Aloitus]
    ├→ [Workflow B: Hakemusten Seulonta] (IMAP listener)
    ├→ [Workflow C: Haastattelun Ajoitus]
    └→ [Workflow D: Päätöksenteko]
        ↓
    [Supabase Database]
    [Claude API (AI-powered decisions)]
    [Google Calendar API (Interview scheduling)]
    [Email Service (Gmail/SMTP)]
```

---

## Workflow A: "Rekrytoinnin Aloitus" (Job Creation)

**Trigger:** Webhook POST `/api/recruitment/webhook`

**Syöte (Input):**
```json
{
  "trigger": "JOB_CREATION",
  "job_id": "uuid",
  "title": "Python Developer",
  "description_prompt": "5 years experience, Django expert, PostgreSQL, team lead experience preferred, must speak Finnish",
  "location": "Turku, Finland"
}
```

### Vaiheet:

1. **Webhook Trigger** (n8n Webhook node)
   - Vastaanottaa kehitysliittymän pyyntöä

2. **Claude - Job Description Generator** (n8n HTTP node → Claude API)
   - **Prompt:**
     ```
     You are a professional recruitment specialist. Create a professional, engaging job posting in Finnish based on this requirement:

     Title: {title}
     Location: {location}
     Requirements: {description_prompt}

     Generate:
     1. A compelling job title (if different from input)
     2. A 200-300 word job description highlighting key responsibilities
     3. Requirements section with bullet points
     4. Benefits and what we offer
     5. Application instructions

     Format as professional HTML email-ready content.
     ```
   - **Temperature:** 0.7
   - **Model:** claude-3-5-sonnet-20241022
   - **Max tokens:** 1500
   - **Note:** Enable web search to find current salary expectations in Finland for this role

3. **Supabase - Update Job Description** (n8n Postgres node)
   - SQL:
     ```sql
     UPDATE jobs
     SET generated_description = $1, status = 'draft'
     WHERE id = $2;
     ```
   - Parametrit: [ai_generated_description, job_id]

4. **Supabase - Get User Email** (n8n Postgres node)
   - Hae managerien sähköpostiosoite:
     ```sql
     SELECT email FROM auth.users WHERE id = (
       SELECT user_id FROM jobs WHERE id = $1
     );
     ```

5. **Email - Notify Manager** (n8n Gmail node)
   - **Subject:** "AI-Generated Job Posting Ready for Review - {title}"
   - **Body:** Include generated job description with approval/edit links
   - **Muut:** HTML format, include preview button to dashboard

6. **Wait For Approval** (n8n Wait node)
   - Odota webhookia managerista: `POST /api/recruitment/approve-job`
   - Timeout: 48 tuntia
   - Jos kellonaika umpeutunut → archivoi draft-job

7. **Update Job Status** (n8n Postgres node)
   - Jos hyväksytty:
     ```sql
     UPDATE jobs
     SET status = 'published', published_at = NOW()
     WHERE id = $1;
     ```

8. **Trigger Workflow B** (n8n HTTP node)
   - POST `{n8n-webhook-url}/email-listener`
   - Payload: `{ "job_id": job_id, "action": "start_listening" }`

**Output:**
- Job tallennettu Supabaseen status='published'
- Manager saa notifikaation
- Workflow B alkaa kuunnella sähköposteja

---

## Workflow B: "Hakemusten Seulonta" (Email + CV Analysis)

**Trigger:** IMAP Email listener (kuuntele `recruitment+{job_id}@company.com`)

**Syöte (Input):**
```
Sähköpostilla CV-tiedosto (PDF tai DOCX):
- From: candidate_email
- To: recruitment+python-dev-001@company.com
- Attachments: [CV.pdf]
```

### Vaiheet:

1. **IMAP Email Trigger** (n8n Gmail/IMAP node)
   - Kuuntele inboxia `[email protected]`
   - Filtteri: `from:*@* has:attachment`
   - Käsittele uudet viestit reaaliajassa

2. **Parse Email** (n8n Set node)
   - Pura:
     - Candidate name (from email header)
     - Candidate email (reply-to)
     - Subject (job reference if included)

3. **Extract Job ID** (n8n Function node)
   - Jäljitä `job_id` emailin header-tiedoista tai recipient-osoitteesta
   - Fallback: Etsi tuoreinta open-jobria Supabasesta

4. **Claude Vision - Extract CV Text** (n8n HTTP node → Claude API)
   - **API:** Claude Files API (multipart upload)
   - **Request:**
     ```
     POST https://api.anthropic.com/v1/messages
     {
       "model": "claude-3-5-sonnet-20241022",
       "max_tokens": 2000,
       "messages": [
         {
           "role": "user",
           "content": [
             {
               "type": "text",
               "text": "Extract all text content from this CV. Return structured data: name, email, phone, experience, education, skills."
             },
             {
               "type": "document",
               "source": {
                 "type": "base64",
                 "media_type": "application/pdf", // or "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                 "data": "{base64_encoded_file}"
               }
             }
           ]
         }
       ]
     }
     ```
   - **Output:** Structured CV text

5. **Supabase - Get Job Description** (n8n Postgres node)
   - Hae job-kuvaus:
     ```sql
     SELECT title, description_prompt, generated_description
     FROM jobs WHERE id = $1;
     ```

6. **Claude - Score & Analyze** (n8n HTTP node → Claude API)
   - **Prompt:**
     ```
     You are an expert recruitment analyst. Score this candidate based on the job requirements.

     JOB:
     Title: {job_title}
     Requirements: {job_description}

     CANDIDATE CV:
     {cv_text}

     Provide:
     1. Score 0-100 (how well candidate matches requirements)
     2. A 3-sentence summary of candidate fit
     3. Detailed reasoning (300-400 words):
        - Strengths matching job requirements
        - Potential gaps or concerns
        - Overall recommendation

     Return JSON:
     {
       "score": 85,
       "summary": "Strong technical background with 7 years Python experience. Perfect match for senior developer role. Team lead experience is a plus.",
       "reasoning": "..."
     }
     ```
   - **Model:** claude-3-5-sonnet-20241022
   - **Temp:** 0.5
   - **Tokens:** 1000

7. **Parse Claude Response** (n8n Set node)
   - Extract: score, summary, reasoning

8. **Supabase - Store Candidate** (n8n Postgres node)
   - Insert tai update candidates-taulua:
     ```sql
     INSERT INTO candidates (job_id, name, email, phone, cv_text, ai_score, ai_summary, ai_reasoning, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new')
     ON CONFLICT (job_id, email) DO UPDATE SET
       cv_text = $5,
       ai_score = $6,
       ai_summary = $7,
       ai_reasoning = $8,
       updated_at = NOW();
     ```

9. **Upload CV to Storage** (n8n Supabase node)
   - Lataa PDF/DOCX Supabase Storage-verkkoon:
     - Bucket: `resumes`
     - Path: `{job_id}/{candidate_id}/{filename}`

10. **Update Candidate with CV URL** (n8n Postgres node)
    - Päivitä `candidates.cv_url`

11. **Email - Thank You Message** (n8n Gmail node)
    - **To:** candidate_email
    - **Subject:** "Kiitos hakemuksestasi - {job_title}"
    - **Body (in Finnish):**
      ```
      Hei {candidate_name},

      Kiitos kiinnostuksestasi ja hakemuksestasi {job_title} -tehtävään!

      Käymme läpi hakemuksesi huolellisesti ja otamme sinuun yhteyttä
      muutaman päivän kuluessa, mikäli se etenee seuraavalle kierrokselle.

      Ystävällisin terveisin,
      Rekrytointitiimi
      ```
    - Format: HTML

12. **Realtime Update to Dashboard** (n8n HTTP node)
    - POST `/api/recruitment/webhook`
    - Trigger: `CANDIDATE_SCREENED`
    - Frontend päivittyy Supabase realtime-subscriptioiden kautta

**Output:**
- Candidate tallennettu Supabaseen ai_score ja ai_summary
- CV tallennettu Storage-verkkoon
- Candidate näkyy Kanban-pöydällä "new" -sarakkeessa
- Thank you -sähköposti lähetetty

---

## Workflow C: "Haastattelun Ajoitus" (Interview Scheduling)

**Trigger:** Webhook POST `/api/recruitment/schedule-interview`

**Syöte (Input):**
```json
{
  "candidate_id": "uuid",
  "job_id": "uuid"
}
```

### Vaiheet:

1. **Webhook Trigger** (n8n Webhook node)
   - Vastaanottaa, kun candidate siirretään "interviewing" -sarakkeeseen Kanban-pöydällä

2. **Supabase - Get Candidate & Manager** (n8n Postgres node)
   - Hae tiedot:
     ```sql
     SELECT c.*, j.user_id as manager_id, j.title as job_title
     FROM candidates c
     JOIN jobs j ON c.job_id = j.id
     WHERE c.id = $1;
     ```

3. **Supabase - Get Manager Calendar Settings** (n8n Postgres node)
   - Hae Googlen OAuth token managerille (tallennettu profiles-tauluun)

4. **Google Calendar - Check Availability** (n8n HTTP node → Google Calendar API)
   - **Endpoint:** `GET https://www.googleapis.com/calendar/v3/calendars/primary/freebusy`
   - **Request Body:**
     ```json
     {
       "items": [
         { "id": "primary" }
       ],
       "timeMin": "2024-11-11T00:00:00Z",
       "timeMax": "2024-11-24T23:59:59Z"
     }
     ```
   - **Etsi:** 60 minuutin blokit, jotka on merkitty "Interview" -kalenterin slottiin
   - **Suodata:** Vain business hours (09:00-17:00 manager's timezone)

5. **Parse Calendar Response** (n8n Function node)
   - Muodosta lista 3-5 suggestion-ajoista (seuraava 2 viikkoa)
   - Esim:
     ```
     Maanantai 11.11 klo 14:00-15:00
     Tiistai 12.11 klo 10:00-11:00
     Keskiviikko 13.11 klo 15:00-16:00
     Torstai 14.11 klo 11:00-12:00
     Perjantai 15.11 klo 14:00-15:00
     ```

6. **Claude - Generate Personalized Email** (n8n HTTP node → Claude API)
   - **Prompt:**
     ```
     Write a personalized, professional interview invitation email in Finnish.

     Candidate: {candidate_name}
     Job: {job_title}
     Company: {company_name}

     Include:
     1. Warm greeting and congratulations (they passed initial screening)
     2. Brief description of interview process
     3. List of 5 suggested interview times with timezone
     4. Link to confirm (or Calendly link)
     5. Contact info if they have questions
     6. Professional closing

     Tone: Professional but friendly, in Finnish.
     Return plain text (no HTML).
     ```
   - **Model:** claude-3-5-sonnet-20241022
   - **Temp:** 0.6

7. **Create Calendly Link** (optional - n8n Calendly node)
   - Tai: Luo unique Calendly-linkkiä managerille päivinä/aikoina
   - **Alternative:** Käytä Google Forms vastauslinkkinä ja kuuntele vastausta

8. **Email - Interview Invitation** (n8n Gmail node)
   - **To:** candidate_email
   - **Subject:** "Tervetuloa haastatteluun - {job_title}"
   - **Body:** Claude-generated email + suggested times
   - **Attachments:** Lisää Calendly-linkki tai Google Forms -linkki vastausten keräämiseksi

9. **Create Interview Record (Pending)** (n8n Postgres node)
   - Insert preliminary interview record:
     ```sql
     INSERT INTO interviews (candidate_id, job_id, user_id, status)
     VALUES ($1, $2, $3, 'awaiting_confirmation');
     ```

10. **Wait for Candidate Response** (n8n Wait node)
    - Odota 5 päivää vastaus
    - **Webhook callback:** `POST /api/recruitment/confirm-interview`
    - Payload: `{ "interview_id": id, "selected_time": timestamp }`
    - Jos timeout: mark candidate as 'rejected' (no show)

11. **Google Calendar - Create Event** (n8n HTTP node → Google Calendar API)
    - **Endpoint:** `POST https://www.googleapis.com/calendar/v3/calendars/primary/events`
    - **Request:**
      ```json
      {
        "summary": "Interview: {candidate_name} - {job_title}",
        "description": "Candidate: {candidate_name}\nEmail: {candidate_email}\nScore: {ai_score}%\nSummary: {ai_summary}",
        "start": {
          "dateTime": "{confirmed_time}",
          "timeZone": "{manager_timezone}"
        },
        "end": {
          "dateTime": "{confirmed_time + 1 hour}",
          "timeZone": "{manager_timezone}"
        },
        "attendees": [
          { "email": "{manager_email}", "organizer": true },
          { "email": "{candidate_email}", "responseStatus": "needsAction" }
        ],
        "conferenceData": {
          "createRequest": {
            "requestId": "{unique_id}",
            "conferenceSolution": {
              "key": {
                "conferenceSolution": "hangoutsMeet"
              }
            }
          }
        }
      }
      ```
    - **Tulos:** Google Meet -linkki lisätään tapahtumaan

12. **Update Interview Record** (n8n Postgres node)
    - Päivitä interview-record:
      ```sql
      UPDATE interviews
      SET google_calendar_event_id = $1, scheduled_at = $2, meeting_link = $3, status = 'scheduled'
      WHERE id = $4;
      ```

13. **Email - Confirmation** (n8n Gmail node)
    - **To:** candidate_email + manager_email
    - **Subject:** "Interview Confirmation - {job_title}"
    - **Body:** Include Google Meet link and timezone info

**Output:**
- Interview scheduled in Google Calendar
- Candidate ja manager saavat kalenterikutsut
- Interview record tallennettu Supabaseen
- Kanban-pöydässä candidate näkyy "interviewing" -sarakkeessa

---

## Workflow D: "Päätöksenteko" (Decision: Rejection or Offer)

**Trigger:** Webhook POST `/api/recruitment/decision`

**Syöte (Input):**
```json
{
  "candidate_id": "uuid",
  "job_id": "uuid",
  "decision": "rejected" | "hired"
}
```

### Vaiheet:

#### A. REJECTION PATH

1. **Webhook Trigger** (n8n Webhook node)
   - Vastaanottaa kun candidate siirretään "rejected" -sarakkeeseen

2. **Supabase - Get Candidate Details** (n8n Postgres node)
   - Hae candidate ja job info

3. **Claude - Generate Rejection Email** (n8n HTTP node → Claude API)
   - **Prompt:**
     ```
     Write a professional, respectful rejection email in Finnish.

     Candidate: {candidate_name}
     Job: {job_title}
     Candidate Score: {ai_score}%

     The email should:
     1. Thank them for applying and interest in the role
     2. Acknowledge their qualifications and strengths
     3. Explain (generally) why they weren't selected for this round
     4. Encourage them to apply for future positions
     5. Provide contact for questions
     6. Professional, warm tone - they might apply again or refer someone

     Return plain text email.
     ```
   - **Model:** claude-3-5-sonnet-20241022
   - **Temp:** 0.5

4. **Email - Send Rejection** (n8n Gmail node)
   - **To:** candidate_email
   - **Subject:** "Kiitos hakemuksestasi"
   - **Body:** Claude-generated rejection email
   - **From:** `noreply+rejection@company.com`

5. **Update Candidate Status** (n8n Postgres node)
   - ```sql
     UPDATE candidates
     SET status = 'rejected', rejection_email_sent = TRUE, updated_at = NOW()
     WHERE id = $1;
     ```

6. **Dashboard Update** (n8n HTTP node)
   - Realtime update Kanban-pöydälle

#### B. OFFER PATH

1. **Webhook Trigger** (n8n Webhook node)
   - Vastaanottaa kun candidate siirretään "hired" -sarakkeeseen

2. **Supabase - Get Candidate Details** (n8n Postgres node)
   - Hae full candidate data, interview notes, manager info

3. **Claude - Generate Offer Email** (n8n HTTP node → Claude API)
   - **Prompt:**
     ```
     Write a professional offer/congratulations email in Finnish.

     Candidate: {candidate_name}
     Job: {job_title}
     Company: {company_name}
     Score: {ai_score}%

     The email should include:
     1. Sincere congratulations on being selected
     2. Brief recap of the role and why they're a great fit
     3. Next steps in hiring process:
        - Offer letter will be sent within 2 days
        - Employment contract review
        - Start date discussion
        - Any other next steps
     4. Contact person for questions
     5. Warmth and enthusiasm

     Return HTML-formatted email.
     ```
   - **Model:** claude-3-5-sonnet-20241022

4. **Create Employment Contract Draft** (n8n HTTP node → Claude API)
   - **Prompt:**
     ```
     Generate a Finnish employment contract template with candidate details.

     Candidate: {candidate_name}
     Email: {candidate_email}
     Job Title: {job_title}
     Manager: {manager_name}
     Company: {company_name}

     Include:
     - Standard employment terms
     - Role and responsibilities
     - Salary and benefits (to be filled by manager)
     - Trial period (3 months recommended)
     - Confidentiality clause
     - Probation period terms

     Format as PDF-ready template (return as markdown for PDF conversion).
     ```

5. **Convert Contract to PDF** (n8n LibreOffice/PDF node)
   - Muunna contract draft PDF:ks

6. **Upload Contract** (n8n Supabase node)
   - Lataa Storage-verkkoon:
     - Path: `contracts/{job_id}/{candidate_id}/offer_{date}.pdf`

7. **Email - Send Offer** (n8n Gmail node)
   - **To:** candidate_email (CC: manager_email)
   - **Subject:** "Virallinen tarjous - {job_title}"
   - **Body:** Offer email + Liite: draft contract (PDF)
   - **Note:** "Please review and contact us if you have questions"

8. **Create Offer Record** (n8n Postgres node - optional)
   - Insert/update offers-tauluun (jos olemassa)

9. **Update Candidate Status** (n8n Postgres node)
   - ```sql
     UPDATE candidates
     SET status = 'hired', offer_email_sent = TRUE, updated_at = NOW()
     WHERE id = $1;
     ```

10. **Notify Manager** (n8n Gmail node)
    - **To:** manager_email
    - **Subject:** "Offer Sent - {candidate_name} - {job_title}"
    - **Body:**
      ```
      Offer has been sent to {candidate_name}.
      Next steps:
      1. Await candidate's response (3-5 days typical)
      2. Follow up if no response
      3. Arrange start date and onboarding
      4. Update candidate to 'onboarding' status
      ```
    - **Attachments:** Draft contract PDF

11. **Create Task/Reminder** (n8n Notion/Todoist node - optional)
    - Set reminder 5 days to follow up if candidate hasn't responded

12. **Dashboard Update** (n8n HTTP node)
    - Realtime update Kanban-pöydälle

**Output:**
- Candidate status päivitetty Supabaseen
- Rejection tai offer email lähetetty
- Offer contract valmistettu ja lähetetty (if hired)
- Manager notifioitu
- Kanban-pöydä päivittyy realtime-subscriptioista

---

## Integrations Checklist

Required integrations to configure in n8n:

- [ ] **Claude API** (HTTP node with API key)
  - API Key: `sk-ant-...`
  - Base URL: `https://api.anthropic.com/v1`

- [ ] **Supabase PostgreSQL**
  - Connection string from Supabase dashboard
  - RLS policies configured for n8n service role

- [ ] **Gmail/SMTP**
  - OAuth 2.0 for Gmail node
  - or SMTP credentials for email sending

- [ ] **Google Calendar API**
  - OAuth 2.0 credentials
  - Calendar ID (usually "primary")

- [ ] **Google Drive** (optional, for document storage)
  - OAuth 2.0

---

## Error Handling & Retries

Each workflow should include:

1. **Try/Catch blocks** for Claude API calls (timeout, rate limit)
   - Retry: exponential backoff (1s, 2s, 4s)
   - Max retries: 3

2. **Email fallback** if primary email fails
   - Log to Supabase error table
   - Send admin notification

3. **Database transaction logging**
   - All DB updates logged for audit trail
   - Include `error_log` field in relevant tables

4. **Graceful degradation**
   - If Google Calendar unavailable → use email-based scheduling
   - If Claude API unavailable → use basic template emails

---

## Testing Workflow

Before going live:

1. **Test each workflow individually** in n8n sandbox
2. **End-to-end test:**
   - Create job → Manager approves → Email arrives → Run CV analysis → Schedule interview → Send decision
3. **Test error scenarios:**
   - Missing CV attachment
   - Invalid email format
   - Google Calendar API timeout
   - Claude API rate limiting
4. **Load test:** Simulate multiple applications for same job

---

## Monitoring & Alerting

Set up n8n monitoring:

- Workflow execution logs
- Failed step notifications
- Email delivery confirmation
- Database query performance

---

## Cost Estimation (Monthly)

- **Claude API:** ~$10-30/month (based on CV analysis volume)
- **Google Calendar API:** Free (100K requests/day free tier)
- **Gmail:** Free (15GB storage, 15M emails/day)
- **Supabase:** $25-100/month (standard plan)
- **n8n Cloud:** $20-50/month (depending on execution volume)

---

