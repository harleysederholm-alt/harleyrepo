# PienHankinta-Vahti - Deployment Checklist

## 🚀 NOPEA KÄYTTÖÖNOTTO (5 min)

Seuraa näitä vaiheita järjestyksessä:

### ✅ Vaihe 1: Supabase Migration (2 min)

1. [ ] Avaa: https://supabase.com/dashboard/project/evpgnjvrvfqbtjxojtit/sql/new
2. [ ] Kopioi sisältö: `supabase/migrations/002_add_stripe_and_freemium.sql`
3. [ ] Liitä SQL Editoriin ja klikkaa **RUN**
4. [ ] Varmista: ✅ Success-viesti

**Ohje:** Katso `SUPABASE_MIGRATION.md`

### ✅ Vaihe 2: Vercel Environment Variables (2 min)

1. [ ] Avaa: https://vercel.com/harleysederholm-alts-projects/pienhankinta-vahti/settings/environment-variables
2. [ ] Lisää **KAIKKI** muuttujat `VERCEL_SETUP.md`-tiedostosta
3. [ ] Valitse **All Environments** jokaiselle
4. [ ] Klikkaa **Save** jokaiselle

**PAKOLLINEN MINIMI (kopioi .env.local-tiedostosta):**
```
NEXT_PUBLIC_SUPABASE_URL=<katso .env.local>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<katso .env.local>
SUPABASE_SERVICE_ROLE_KEY=<katso .env.local>
GROQ_API_KEY=<katso .env.local>
NEXT_PUBLIC_APP_URL=https://pienhankinta-vahti.vercel.app
```

**Ohje:** Katso `VERCEL_SETUP.md`

### ✅ Vaihe 3: Redeploy (1 min)

**Vaihtoehto A: Manuaalinen**
1. [ ] Mene: https://vercel.com/harleysederholm-alts-projects/pienhankinta-vahti/deployments
2. [ ] Valitse viimeisin "Failed" deployment
3. [ ] Klikkaa **⋮** → **Redeploy**

**Vaihtoehto B: Git Push (SUOSITELTU)**
```bash
cd harleyrepo
git add .
git commit -m "docs: Add deployment guides"
git push
```

Vercel deployaa automaattisesti!

### ✅ Vaihe 4: Testaa (1 min)

1. [ ] Avaa: https://pienhankinta-vahti.vercel.app
2. [ ] Rekisteröidy uusi käyttäjä
3. [ ] Täytä onboarding
4. [ ] Tarkista että dashboard latautuu
5. [ ] **KRIITTINEN:** Tarkista että näet "24h viive"-bannerin (= Freemium toimii!)

## 🎯 Mitä on nyt toiminnassa

### ✅ Toimii heti:
- ✅ Kirjautuminen (Supabase Auth)
- ✅ Onboarding (profiilin luonti)
- ✅ Dashboard (hankintojen listaus)
- ✅ **FREEMIUM:** 24h viive Free-käyttäjille
- ✅ **FREEMIUM:** Premium-banneri näkyy
- ✅ Hinnoittelusivu (`/hinnasto`)
- ✅ AI-osuvuuslaskenta (mock-data)

### ⚠️ Tarvitsee Stripe-tuotteet:
- ⏸️ Stripe Checkout (tarvitsee `STRIPE_PRICE_ID_PRO` ja `STRIPE_PRICE_ID_AGENT`)
- ⏸️ Maksujen käsittely
- ⏸️ Tilausten hallinta

### 📝 Toteutus keskeneräinen (valinnainen):
- ⏸️ Tallenna hankinta (frontend puuttuu)
- ⏸️ Sähköposti-ilmoitukset (email-service puuttuu)
- ⏸️ Tarjousapuri (AI-generaattori toimii, UI puuttuu)

## 🔒 Stripe-tuotteiden luonti (valinnainen nyt)

### Kun haluat ottaa maksut käyttöön:

1. **Luo Stripe-tili:** https://dashboard.stripe.com/register

2. **Luo tuotteet:**
   - **Pro:** 29€/kk recurring
   - **Agent:** 99€/kk recurring

3. **Kopioi Price ID:t:**
   - Pro: `price_xxxxxxxxxxxxx`
   - Agent: `price_xxxxxxxxxxxxx`

4. **Päivitä Vercel:**
   ```
   STRIPE_SECRET_KEY=sk_test_xxxxx (Stripe Dashboard → Developers → API keys)
   STRIPE_PRICE_ID_PRO=price_xxxxx
   STRIPE_PRICE_ID_AGENT=price_xxxxx
   ```

5. **Luo Webhook:**
   - URL: `https://pienhankinta-vahti.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Kopioi `STRIPE_WEBHOOK_SECRET` Verceliin

## 🧪 Testaussuunnitelma

### Free-käyttäjä:
1. [ ] Rekisteröidy
2. [ ] Täytä onboarding
3. [ ] Tarkista että näet "24h viive"-bannerin
4. [ ] Tarkista että näet max 20 hankintaa
5. [ ] Klikkaa "Päivitä Pro-tasolle" → ohjautuu `/hinnasto`

### Pro-käyttäjä (kun Stripe toimii):
1. [ ] Maksa Pro-tilaus
2. [ ] Tarkista että banneria EI näy
3. [ ] Tarkista että näet max 500 hankintaa
4. [ ] Tarkista että näet AI-osuvuusprosentin

## 📊 Seuranta

### Vercel:
- **URL:** https://vercel.com/harleysederholm-alts-projects/pienhankinta-vahti
- **Deployments:** Katso status ja logit
- **Analytics:** Käyttäjämäärät ja latausajat

### Supabase:
- **URL:** https://supabase.com/dashboard/project/evpgnjvrvfqbtjxojtit
- **Auth:** Käyttäjät
- **Database:** Hankinnat ja profiilit
- **Logs:** Virheet ja queryt

### Groq:
- **URL:** https://console.groq.com
- **Usage:** API-kutsut ja tokenit

## ❓ Ongelmat?

### Build failaa Vercelissä
- ✅ Tarkista että **KAIKKI** Supabase-muuttujat on lisätty
- ✅ Redeploy

### Dashboard ei lataudu
- ✅ Tarkista että migraatio on ajettu Supabasessa
- ✅ Tarkista että `hankinnat`-taulussa on dataa

### "24h viive"-banneria ei näy
- ✅ Tarkista että käyttäjän `plan = 'free'` Supabasessa
- ✅ Tyhjennä selaimen cache

### Stripe-maksut eivät toimi
- ✅ Tarkista että `STRIPE_PRICE_ID_PRO` ja `STRIPE_PRICE_ID_AGENT` on asetettu
- ✅ Tarkista että ne ovat oikeita Price ID:tä (alkavat `price_`)

## 🎉 Onneksi olkoon!

Jos kaikki yllä on ✅, sovelluksesi on LIVE:
**https://pienhankinta-vahti.vercel.app**

---

**Seuraavat päivitykset:**
1. Lisää oikeita kuntia n8n-workflow'hun
2. Toteuta "Tallenna hankinta" -toiminto
3. Toteuta email-ilmoitukset
4. Aktivoi Stripe-maksut

**Kehitetty ❤️ Claude Coden avulla**
