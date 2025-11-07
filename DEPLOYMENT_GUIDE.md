# 🚀 PienHankinta-Vahti - Deployment-ohje

Tämä ohje opastaa PienHankinta-Vahdin julkaisemisessa Verceliin ja Supabaseen.

## 📋 Esivaatimukset

- [x] Supabase-tili ([supabase.com](https://supabase.com))
- [x] Vercel-tili ([vercel.com](https://vercel.com))
- [x] Groq API-avain ([console.groq.com](https://console.groq.com))
- [x] GitHub-repo projektille

## 1️⃣ Supabase-tietokannan setup

### 1.1 Luo Supabase-projekti

1. Kirjaudu [Supabase Dashboardiin](https://supabase.com/dashboard)
2. Klikkaa **"New Project"**
3. Täytä:
   - **Name**: `pienhankinta-vahti`
   - **Database Password**: Luo vahva salasana (tallenna turvalliseen paikkaan!)
   - **Region**: `Helsinki (eu-north-1)` (lähin Suomeen)
   - **Pricing Plan**: `Free` (alkuun riittää)

### 1.2 Aja migraatiot

1. Mene **SQL Editor** -välilehdelle
2. Klikkaa **"New Query"**
3. Kopioi `supabase/migrations/001_initial_schema.sql` sisältö
4. Klikkaa **"Run"**

✅ Tietokantaskeema on nyt valmis!

### 1.3 Ota API-avaimet talteen

Mene **Project Settings** → **API**

Tarvitset seuraavat:
- `Project URL` (esim. `https://xxxxx.supabase.co`)
- `anon public` key
- `service_role` key (piilota tämä hyvin!)

## 2️⃣ Vercel Deployment

### 2.1 Push koodi GitHubiin

```bash
cd harleyrepo
git add .
git commit -m "feat: PienHankinta-Vahti valmis deploymentille"
git push origin main
```

### 2.2 Luo Vercel-projekti

1. Kirjaudu [Vercel Dashboardiin](https://vercel.com/dashboard)
2. Klikkaa **"Add New..."** → **"Project"**
3. Valitse GitHub-reposi
4. Konfiguroi:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (tai `harleyrepo` jos monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.3 Aseta ympäristömuuttujat

Vercelissä, **Environment Variables** -osiossa, lisää:

| Avain | Arvo | Mistä löydät? |
|-------|------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Sama kuin yllä (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Sama kuin yllä (service_role) |
| `GROQ_API_KEY` | `gsk_...` | [console.groq.com/keys](https://console.groq.com/keys) |
| `NEXT_PUBLIC_APP_URL` | `https://pienhankinta-vahti.vercel.app` | Vercel-domain (täytä deployment jälkeen) |

**TÄRKEÄÄ:**
- Lisää ympäristömuuttujat **kaikkiin ympäristöihin**: Production, Preview, Development
- `SUPABASE_SERVICE_ROLE_KEY` on **erittäin salainen** - älä jaa sitä julkisesti!

### 2.4 Deploy

Klikkaa **"Deploy"**

⏳ Vercel buildaa sovellusta (~2-3 minuuttia)

✅ Kun valmis, saat linkin sovellukseen (esim. `https://pienhankinta-vahti.vercel.app`)

### 2.5 Päivitä `NEXT_PUBLIC_APP_URL`

Palaa **Environment Variables** -asetuksiin ja päivitä:

```
NEXT_PUBLIC_APP_URL=https://pienhankinta-vahti.vercel.app
```

Redeploy projekti (Vercel tekee tämän automaattisesti kun muutat muuttujia)

## 3️⃣ Custom Domain (valinnainen)

### 3.1 Lisää domain Verceliin

1. Mene **Settings** → **Domains**
2. Klikkaa **"Add"**
3. Kirjoita domainisi (esim. `pienhankintavahti.fi`)
4. Seuraa Vercelin DNS-ohjeita:
   - **A Record**: `76.76.21.21`
   - **CNAME (www)**: `cname.vercel-dns.com`

### 3.2 Päivitä Supabase Redirect URLs

Mene Supabase Dashboard → **Authentication** → **URL Configuration**

Lisää:
- **Site URL**: `https://pienhankintavahti.fi`
- **Redirect URLs**:
  - `https://pienhankintavahti.fi/dashboard`
  - `https://pienhankintavahti.fi/auth/callback`

## 4️⃣ n8n Automaatio (valinnainen)

PienHankinta-Vahti toimii ilman n8n:ää, mutta automaattinen hankintaseuranta vaatii sen.

### Vaihtoehto A: n8n Cloud (suositeltu)

1. Luo tili: [n8n.cloud](https://n8n.cloud)
2. Tuo workflow: `n8n/workflows/pienhankinta-skreippaus.json`
3. Konfiguroi Supabase-yhteys (tarvitset `SUPABASE_SERVICE_ROLE_KEY`)
4. Aktivoi workflow (ajetaan 30 min välein)

### Vaihtoehto B: Docker (lokaalisti/palvelimella)

```bash
cd n8n
cp .env.example .env
nano .env  # Täytä SUPABASE-avaimet
docker-compose up -d
```

n8n UI: [http://localhost:5678](http://localhost:5678)

## 5️⃣ Testaus

### 5.1 Testaa rekisteröityminen

1. Mene sovellukseesi: `https://pienhankinta-vahti.vercel.app`
2. Klikkaa **"Kirjaudu sisään"**
3. Rekisteröidy testisähköpostilla
4. Vahvista sähköposti (Supabase lähettää linkin)
5. Täytä onboarding-profiili

### 5.2 Testaa dashboard

- Dashboard pitäisi näyttää testihankintoja (jos ajoit migraation testidatalla)
- Filtterit ja haku toimivat
- Modal-ikkunat aukeavat

### 5.3 Testaa Supabase RLS

Avaa browser console ja yritä:

```javascript
// Tämän pitää epäonnistua (ei oikeuksia)
fetch('https://xxxxx.supabase.co/rest/v1/hankinnat', {
  method: 'POST',
  headers: {
    'apikey': 'ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ otsikko: 'Testi' })
})
```

Jos saat `403 Forbidden` → RLS toimii oikein! ✅

## 6️⃣ Monitorointi ja analytics

### Vercel Analytics

1. Mene Vercel Dashboard → **Analytics**
2. Ota **Web Analytics** käyttöön (ilmainen)
3. Näet:
   - Page views
   - Unique visitors
   - Performance (Core Web Vitals)

### Supabase Logs

Mene Supabase Dashboard → **Logs**

Näet:
- Database-kyselyt
- API-kutsut
- Auth-tapahtumat
- Virheet

## 7️⃣ Tuotantovalmiuden tarkistuslista

Ennen julkista lanseerausta:

- [ ] Poista testidataa tietokannasta (aja `DELETE FROM hankinnat WHERE linkki_lahteeseen LIKE '%/test-%'`)
- [ ] Vaihda Supabase database-salasana (jos se on jaettu julkisesti)
- [ ] Tarkista, että `.env.local` **EI OLE** GitHubissa
- [ ] Lisää `robots.txt` (jos et halua hakukoneiden indeksoivan)
- [ ] Lisää Google Analytics / Plausible
- [ ] Testaa kaikki sivut mobiilissa
- [ ] Tarkista Lighthouse-score (Performance, Accessibility, SEO)
- [ ] Lisää error tracking (esim. Sentry)
- [ ] Lisää rate limiting API-reitteihin (estää väärinkäyttö)
- [ ] Lisää GDPR-cookie banner (jos käytät analytiikkaa)

## 8️⃣ Jatkuva deployment

Vercel on nyt konfiguroitu automaattiseen deploymenttiin:

- **Push main-branchiin** → Automaattinen production deployment
- **Pull request** → Preview deployment (testattavissa ennen mergeä)

## 🆘 Yleisimmät ongelmat

### Ongelma 1: "Invalid API Key"

**Syy:** Supabase-avaimet väärin

**Ratkaisu:**
1. Tarkista Supabase Dashboard → API
2. Kopioi avaimet uudelleen Verceliin
3. Redeploy

### Ongelma 2: "Session not found" / Redirectaa takaisin loginiin

**Syy:** Redirect URLs puuttuvat Supabasesta

**Ratkaisu:**
1. Mene Supabase Dashboard → Authentication → URL Configuration
2. Lisää production-URL Redirect URLs -listaan
3. Testaa uudelleen

### Ongelma 3: Build epäonnistuu Vercelissä

**Syy:** TypeScript-virheet tai puuttuvat riippuvuudet

**Ratkaisu:**
1. Aja `npm run build` lokaalisti
2. Korjaa virheet
3. Push uudelleen

### Ongelma 4: Middleware aiheuttaa redirect-loopin

**Syy:** Middleware-konfiguraatio väärin

**Ratkaisu:**
1. Tarkista `middleware.ts` matcher-konfiguraatio
2. Varmista että staattiset tiedostot ovat excluded

## 📚 Hyödylliset linkit

- [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Groq API Docs](https://console.groq.com/docs/quickstart)

## ✅ Valmis!

Sovelluksesi on nyt livemäisenä Internetissä! 🎉

Seuraavat askeleet:
1. Kerää käyttäjäpalautetta
2. Lisää lisää kuntia n8n-workflow'hun
3. Implementoi maksu (Stripe)
4. Lanseeraus!

---

**Onnea projektillesi mestari! 🚀**
