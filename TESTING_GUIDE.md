# PienHankinta-Vahti: Complete Testing Guide

**Purpose**: Verify all features work correctly for all plan types before production launch.

**Production URL**: https://pienhankinta-vahti.vercel.app

---

## 🎯 Pre-Testing Setup

### 1. Create Test Accounts

You need THREE test accounts (one for each plan):

```bash
# Account 1: Free Plan
Email: test-free@example.com
Password: TestPassword123!

# Account 2: Pro Plan
Email: test-pro@example.com
Password: TestPassword123!

# Account 3: Agent Plan
Email: test-agent@example.com
Password: TestPassword123!
```

### 2. Update Plans in Supabase

After creating accounts, manually update their plans in Supabase:

```sql
-- Find your test user IDs
SELECT id, email, plan FROM profiles;

-- Update to Pro
UPDATE profiles SET plan = 'pro' WHERE email = 'test-pro@example.com';

-- Update to Agent
UPDATE profiles SET plan = 'agent' WHERE email = 'test-agent@example.com';
```

### 3. Complete Onboarding

For each account, complete onboarding with AI profile:

**Free Account**:
```
Company: Test Maalaus Oy (Free)
AI Description: Olemme pieni maalausliike Helsingistä. Teemme julkisivumaalauksia ja pienehköjä sisämaalauksia. Meillä on 2 työntekijää ja 5 vuoden kokemus.
```

**Pro Account**:
```
Company: Test Rakennus Oy (Pro)
AI Description: Olemme keskikokoinen rakennusliike Espoosta. Teemme julkisia rakennushankkeita, korjausrakentamista ja saneerauksia. Meillä on 10 työntekijää ja 15 vuoden kokemus.
```

**Agent Account**:
```
Company: Test Infra Oy (Agent)
AI Description: Olemme suuri infrarakentamisen yritys. Teemme teiden, siltojen ja julkisen infrastruktuurin rakentamista ja ylläpitoa. Meillä on 50+ työntekijää ja 25 vuoden kokemus. Erikoisosaamisemme on suuret infraprojektit.
```

---

## 📋 Test Cases

### Test Suite 1: FREE PLAN

#### T1.1: Login & Dashboard Access ✓
- [ ] Login with free account
- [ ] Dashboard loads successfully
- [ ] No errors in browser console

#### T1.2: Procurement Count Limit ✓
- [ ] Dashboard shows maximum 20 procurements
- [ ] Count procurements in feed
- [ ] Verify limit is enforced

**Expected**: Max 20 procurements displayed

#### T1.3: 24-Hour Delay ✓
- [ ] Check oldest procurement's published_at date
- [ ] Should be at least 24 hours old
- [ ] No procurements from last 24h visible

**Expected**: All procurements older than 24h

#### T1.4: AI Match Percentage LOCKED ✓
- [ ] Procurement cards show lock icon (🔒)
- [ ] Badge says "Pro+"
- [ ] No percentage number displayed
- [ ] Background is gray

**Expected**: Lock icon instead of match %

#### T1.5: Procurement Detail Modal ✓
- [ ] Click any procurement card
- [ ] Modal opens
- [ ] AI summary visible (blue box)
- [ ] AI risk analysis visible (yellow box)
- [ ] Original link works
- [ ] Close button works

**Expected**: All basic info visible

#### T1.6: AI Proposal Generator LOCKED ✓
- [ ] Scroll to "AI-Tarjousapuri" section
- [ ] See badge "Agent" (purple)
- [ ] See lock message: "🔒 AI-Tarjousapuri on saatavilla vain Agent-tilassa"
- [ ] See button "Päivitä Agent-tilaan →"
- [ ] Click button → redirects to /hinnasto

**Expected**: Upgrade prompt shown

#### T1.7: Profile Settings ✓
- [ ] Click "Profiiliasetukset" button
- [ ] Page loads
- [ ] Plan badge shows "FREE"
- [ ] See upgrade prompt (blue box)
- [ ] Can edit company name
- [ ] Can edit AI description
- [ ] Save works

**Expected**: All editable, upgrade prompt visible

#### T1.8: Alerts Page ✓
- [ ] Click "Hälytykset" button
- [ ] Page loads
- [ ] Can create new alert
- [ ] Can toggle alert on/off
- [ ] Can delete alert
- [ ] Email shown correctly

**Expected**: All UI works (not persisted yet)

#### T1.9: Pricing Page ✓
- [ ] Click "Hinnasto" link
- [ ] Page loads
- [ ] Free card shows "Nykyinen tilaus"
- [ ] Pro card shows "Valitse tilaus" button
- [ ] Agent card shows "Valitse tilaus" button

**Expected**: Current plan highlighted

---

### Test Suite 2: PRO PLAN

#### T2.1: Login & Dashboard Access ✓
- [ ] Login with pro account
- [ ] Dashboard loads
- [ ] No errors in console

#### T2.2: Procurement Count Limit ✓
- [ ] Dashboard shows up to 500 procurements
- [ ] More than Free plan (20)
- [ ] Count should be higher

**Expected**: Max 500 procurements

#### T2.3: NO 24-Hour Delay ✓
- [ ] Check newest procurement's published_at
- [ ] Should include recent procurements
- [ ] May include today's procurements

**Expected**: Real-time data

#### T2.4: AI Match Percentage SHOWN ✓
- [ ] Procurement cards show percentage (e.g., 85%)
- [ ] Badge says "osuvuus"
- [ ] Color coded:
  - Green: >75%
  - Yellow: 50-75%
  - Red: <50%
- [ ] Different % on different cards

**Expected**: AI match % displayed

#### T2.5: Match Calculation Works ✓
- [ ] Open browser DevTools → Console
- [ ] Refresh dashboard
- [ ] Look for "[calculate-match]" logs
- [ ] Should see API calls being made
- [ ] Should see match scores calculated

**Expected**: API calls successful in logs

#### T2.6: Procurement Detail Modal ✓
- [ ] Click procurement with high match %
- [ ] Modal opens
- [ ] All info visible (same as Free)
- [ ] AI summary and risks visible

**Expected**: Full modal content

#### T2.7: AI Proposal Generator LOCKED ✓
- [ ] Scroll to "AI-Tarjousapuri" section
- [ ] Should still see lock message
- [ ] Button "Päivitä Agent-tilaan →"
- [ ] Pro plan can't generate proposals

**Expected**: Agent-only feature

#### T2.8: Profile Settings ✓
- [ ] Go to /profile
- [ ] Plan badge shows "PRO"
- [ ] No upgrade prompt shown
- [ ] Can edit profile

**Expected**: Pro badge displayed

#### T2.9: All Free Features Work ✓
- [ ] Alerts page works
- [ ] Can create/toggle/delete alerts
- [ ] Profile editing works
- [ ] Filters work

**Expected**: Everything Free has + more

---

### Test Suite 3: AGENT PLAN

#### T3.1: Login & Dashboard Access ✓
- [ ] Login with agent account
- [ ] Dashboard loads
- [ ] No errors

#### T3.2: UNLIMITED Procurements ✓
- [ ] Dashboard shows all available procurements
- [ ] Should be more than Pro (500)
- [ ] No artificial limit

**Expected**: All procurements visible

#### T3.3: Real-Time Data ✓
- [ ] Same as Pro: No 24h delay
- [ ] Recent procurements visible

**Expected**: Real-time access

#### T3.4: AI Match Percentage SHOWN ✓
- [ ] Same as Pro: % displayed
- [ ] Color coded
- [ ] Different scores per card

**Expected**: AI match % works

#### T3.5: AI Proposal Generator UNLOCKED ✓
- [ ] Click any procurement
- [ ] Scroll to "AI-Tarjousapuri"
- [ ] Badge says "Agent" (purple)
- [ ] See button "Luo tarjousluonnos"
- [ ] No lock icon/message
- [ ] Button is enabled (not grayed out)

**Expected**: Generator available

#### T3.6: Generate Proposal ✓
- [ ] Click "Luo tarjousluonnos"
- [ ] Button shows "Generoidaan..." with spinner
- [ ] Wait ~5-10 seconds
- [ ] Proposal appears in green box
- [ ] Starts with "Hyvä..." (greeting)
- [ ] Mentions company skills
- [ ] References procurement
- [ ] Ends with signature

**Expected**: Professional Finnish proposal

#### T3.7: Proposal Actions ✓
- [ ] See "✅ Tarjousluonnos valmis!" message
- [ ] Click "Kopioi" button
- [ ] Alert: "Kopioitu leikepöydälle!"
- [ ] Paste somewhere → proposal text appears
- [ ] Click "Generoi uudelleen"
- [ ] New proposal generated (different text)

**Expected**: All actions work

#### T3.8: Check Proposal Quality ✓
- [ ] Proposal in Finnish ✓
- [ ] Professional tone ✓
- [ ] Mentions user's company/skills ✓
- [ ] References the procurement ✓
- [ ] Includes call-to-action ✓
- [ ] Proper greeting and signature ✓
- [ ] No placeholder text like [COMPANY] ✓

**Expected**: High-quality, ready-to-send

#### T3.9: Error Handling ✓
- [ ] Open profile settings
- [ ] Delete AI description (clear field)
- [ ] Save (should fail - min 50 chars)
- [ ] Add back AI description
- [ ] Try generate proposal again
- [ ] Should see error if no profile

**Expected**: Validation works

#### T3.10: All Pro Features Work ✓
- [ ] AI match % works
- [ ] Real-time data
- [ ] Profile settings
- [ ] Alerts
- [ ] All filters

**Expected**: Everything Pro has + proposals

---

### Test Suite 4: API & BACKEND

#### T4.1: Calculate Match API ✓
```bash
# Test manually with curl
curl -X POST https://pienhankinta-vahti.vercel.app/api/calculate-match \
  -H "Content-Type: application/json" \
  -d '{
    "profiili": "Olemme maalausliike",
    "ai_summary": "Julkisivumaalaus Helsingissä"
  }'

# Expected response:
# {"match": 85}  (or similar 0-100 number)
```

- [ ] Returns JSON with `match` field
- [ ] Match is number 0-100
- [ ] No error messages

#### T4.2: Check Vercel Logs ✓
```bash
# Run locally (or check Vercel dashboard)
cd harleyrepo
vercel logs --token YOUR_TOKEN
```

- [ ] Look for "[calculate-match]" entries
- [ ] Should see "Request received"
- [ ] Should see "Groq response status: 200"
- [ ] Should see "Final match score: XX"
- [ ] No error logs

**Expected**: Clean logs, successful API calls

#### T4.3: Proposal Generation Server Action ✓
- [ ] Check Vercel logs during proposal generation
- [ ] Look for "[generateTarjousluonnos]"
- [ ] Should see "Starting proposal generation"
- [ ] Should see "API key found"
- [ ] Should see "Success! Generated proposal length: XXXX"
- [ ] No errors

**Expected**: Successful generation logged

#### T4.4: Database Queries ✓
- [ ] Check Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Run: `SELECT COUNT(*) FROM hankinnat;`
- [ ] Should return number of procurements
- [ ] Run: `SELECT * FROM profiles LIMIT 5;`
- [ ] Should see test accounts

**Expected**: Data in database

---

### Test Suite 5: UI/UX & EDGE CASES

#### T5.1: Responsive Design ✓
- [ ] Open on mobile (or resize browser to 375px)
- [ ] Dashboard works
- [ ] Cards stack vertically
- [ ] Modal fits screen
- [ ] No horizontal scrolling
- [ ] All buttons accessible

**Expected**: Mobile-friendly

#### T5.2: Loading States ✓
- [ ] Refresh dashboard
- [ ] Should see skeleton loaders briefly
- [ ] Match % shows loading animation
- [ ] Dashboard shows loading spinner
- [ ] Then content appears

**Expected**: Smooth loading

#### T5.3: Empty State ✓
- [ ] Create new account
- [ ] Skip onboarding (if possible)
- [ ] Dashboard with no hankinnat data
- [ ] Should see empty state message
- [ ] No errors

**Expected**: Graceful empty state

#### T5.4: Long Text Handling ✓
- [ ] Find procurement with long title
- [ ] Should be truncated with "..."
- [ ] Full text visible in modal
- [ ] No layout breaking

**Expected**: Text overflow handled

#### T5.5: Network Error Handling ✓
- [ ] Open DevTools → Network tab
- [ ] Set throttling to "Offline"
- [ ] Try to load dashboard
- [ ] Should see error message
- [ ] Not crash the app

**Expected**: Graceful error handling

---

### Test Suite 6: SECURITY & PERMISSIONS

#### T6.1: Unauthenticated Access ✓
- [ ] Logout
- [ ] Try to access /dashboard
- [ ] Should redirect to /login
- [ ] Try /profile → redirects
- [ ] Try /alerts → redirects

**Expected**: Auth required

#### T6.2: Cross-User Data Access ✓
- [ ] Login as Free user
- [ ] Note your profile data
- [ ] Logout
- [ ] Login as Pro user
- [ ] Check profile → different data
- [ ] No access to other user's profile

**Expected**: RLS works

#### T6.3: Plan Downgrade Check ✓
- [ ] Login as Pro user
- [ ] Manually update in Supabase:
  ```sql
  UPDATE profiles SET plan = 'free'
  WHERE email = 'test-pro@example.com';
  ```
- [ ] Refresh dashboard
- [ ] Should see Free restrictions
- [ ] Match % hidden
- [ ] Max 20 procurements

**Expected**: Restrictions apply immediately

---

## 📊 Test Results Template

Copy this for each test session:

```
Test Date: ____________
Tester: ____________
Environment: Production

FREE PLAN:
[ ] T1.1 - T1.9: _____ passed, _____ failed

PRO PLAN:
[ ] T2.1 - T2.9: _____ passed, _____ failed

AGENT PLAN:
[ ] T3.1 - T3.10: _____ passed, _____ failed

API & BACKEND:
[ ] T4.1 - T4.4: _____ passed, _____ failed

UI/UX:
[ ] T5.1 - T5.5: _____ passed, _____ failed

SECURITY:
[ ] T6.1 - T6.3: _____ passed, _____ failed

TOTAL: _____ passed, _____ failed

Critical Issues Found:
1.
2.
3.

Minor Issues Found:
1.
2.
3.

Notes:

```

---

## 🐛 Bug Reporting Template

If you find a bug, report it with this format:

```
## Bug: [Short Title]

**Severity**: Critical / High / Medium / Low

**Plan Affected**: Free / Pro / Agent / All

**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**:


**Actual Behavior**:


**Screenshots**: (if applicable)


**Browser/Device**:
- Browser:
- Version:
- OS:

**Console Errors**: (from DevTools)


**Additional Context**:

```

---

## ✅ Sign-Off Checklist

Before considering testing complete:

- [ ] All Free plan features tested and working
- [ ] All Pro plan features tested and working
- [ ] All Agent plan features tested and working
- [ ] API endpoints responding correctly
- [ ] No critical bugs found
- [ ] Security tests passed
- [ ] UI is responsive on mobile
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] Database queries working
- [ ] Vercel deployment successful
- [ ] All environment variables set correctly

**Approved by**: __________________
**Date**: __________________

---

## 🚀 Post-Testing Actions

After successful testing:

1. **Deploy to Production** ✓ (Already done via Vercel)
2. **Monitor Vercel Logs** for first real users
3. **Set up error tracking** (Sentry recommended)
4. **Enable email notifications** (when integrated)
5. **Run Python scraper** to populate real data
6. **Create user documentation**
7. **Set up customer support** email/chat

---

## 📞 Support During Testing

If you encounter issues during testing:

1. Check Vercel logs: `vercel logs --prod`
2. Check Supabase logs in dashboard
3. Check browser console for errors
4. Review `FEATURE_COMPLETE.md` for expected behavior
5. Check `STATUS_UPDATE.md` for known issues

---

**Testing Guide Version**: 1.0
**Last Updated**: 2025-11-14
**Status**: Ready for Testing ✅
