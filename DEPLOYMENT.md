# PienHankinta-Vahti - Deployment Guide

## 🚀 Vercel Deployment

### 1. Ympäristömuuttujat (KRIITTINEN!)

Ennen deploymenttia, aseta seuraavat ympäristömuuttujat Vercel Dashboardissa:

**Settings → Environment Variables**

#### Supabase (Pakollinen)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Mistä löydän arvot?**
- Supabase Dashboard → Project Settings → API
- `anon key` = NEXT_PUBLIC_SUPABASE_ANON_KEY
- `service_role key` = SUPABASE_SERVICE_ROLE_KEY (⚠️ PIDÄ SALASSA!)

#### Groq API (AI-ominaisuuksille)
```bash
GROQ_API_KEY=gsk_...
```

**Mistä löydän?**
- https://console.groq.com/keys
- Luo uusi API-avain

#### Sovelluksen URL
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Huom:** Päivitä tämä deployment-URL:n mukaan!

#### Stripe (Maksut - Tulossa myöhemmin)
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 2. Build-korjaukset

#### Google Fonts -ongelma (Korjattu ✅)

**Ongelma:**
```
Failed to fetch font `Inter` from Google Fonts.
```

**Ratkaisu:**
Käytetään system-fontteja sen sijaan että ladataan Google Fonts build-aikana.

**Tehdyt muutokset:**
- `app/layout.tsx`: Poistettu `next/font/google` -import
- `tailwind.config.ts`: Päivitetty `fontFamily.sans` käyttämään system-fontteja

**System-fontit:**
```typescript
fontFamily: {
  sans: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ],
}
```

**Edut:**
- ✅ Nopeampi latausaika (ei verkkoyhteyttä Google Fontsiin)
- ✅ Ei build-virheitä
- ✅ Parempi suorituskyky
- ✅ Native-fontti jokaiselle alustalle

#### Supabase Auth Helpers -varoitukset

**Varoitus:**
```
@supabase/auth-helpers-nextjs is now deprecated
Use @supabase/ssr package instead
```

**Status:** ⚠️ Ei kriittinen, toimii vielä
**TODO:** Päivitä tulevaisuudessa `@supabase/ssr`-pakettiin

### 3. Build-prosessi

```bash
# 1. Asenna riippuvuudet
npm install

# 2. Tarkista lint-virheet
npm run lint

# 3. Buildaa projekti
npm run build

# 4. Testaa lokaalisti
npm start
```

**Build-outputti:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    178 B          96.2 kB
├ ○ /dashboard                           5.09 kB         147 kB
├ ○ /hinnasto                            178 B          96.2 kB
├ ○ /login                               22 kB           173 kB
└ ○ /onboarding                          2.75 kB         145 kB
```

### 4. Deployment-tarkistuslista

- [x] Ympäristömuuttujat asetettu Vercelissä
- [x] Supabase-projekti luotu ja migraatiot ajettu
- [x] Google Fonts -ongelma korjattu
- [ ] Domain-nimi konfiguroitu (valinnainen)
- [ ] Stripe-webhook-URL päivitetty (myöhemmin)
- [ ] n8n-workflow konfiguroitu (myöhemmin)

### 5. Post-Deployment

#### Tarkista että kaikki toimii:

1. **Landing Page:** https://your-app.vercel.app
   - Hero-osio näkyy
   - Navigaatio toimii
   - CTA-napit vievät oikeisiin paikkoihin

2. **Hinnasto:** https://your-app.vercel.app/hinnasto
   - 3 hinnoittelukorttia näkyy
   - FAQ-osio näkyy

3. **Login:** https://your-app.vercel.app/login
   - Supabase Auth UI latautuu
   - Rekisteröityminen/Kirjautuminen toimii
   - Ohjautuu `/dashboard`-sivulle kirjautumisen jälkeen

4. **Middleware:** Testaa että suojaus toimii
   - Kirjautumaton käyttäjä → ohjautuu `/login`-sivulle
   - Kirjautunut käyttäjä → pääsee `/dashboard`-sivulle

#### Vercel-lokit:

Tarkista virheet:
```
Vercel Dashboard → Project → Deployments → [Latest] → Function Logs
```

### 6. Ongelmanratkaisu

#### "SUPABASE_URL is required" -virhe

**Ratkaisu:**
- Tarkista että ympäristömuuttujat on asetettu Vercelissä
- Ympäristömuuttujien nimet TÄYTYY alkaa `NEXT_PUBLIC_` jos niitä käytetään client-puolella
- Redeploy projekti ympäristömuuttujien muutosten jälkeen

#### Middleware-virheet

**Virhe:** `createMiddlewareClient is not a function`

**Ratkaisu:**
- Varmista että `@supabase/auth-helpers-nextjs` on asennettu
- Tarkista `middleware.ts`-tiedoston importit

#### Build timeout

**Virhe:** "Build exceeded maximum duration"

**Ratkaisu:**
- Tarkista että node_modules ei ole gitissä
- Poista `.next`-kansio lokaalisti
- Vercel: Nosta build timeout (Pro-tilit)

---

## 📝 Deployment-muutosloki

### 2025-11-07 - Font-korjaus

**Muutokset:**
- Poistettu Google Fonts -lataus (`next/font/google`)
- Päivitetty `app/layout.tsx` ja `tailwind.config.ts`
- Käytetään system-fontteja

**Syy:** Build epäonnistui Google Fonts -fetch-virheeseen

**Tulos:** ✅ Build onnistuu nyt

---

## 🔒 Turvallisuushuomiot

1. **Service Role Key:** ÄLÄ KOSKAAN paljasta `SUPABASE_SERVICE_ROLE_KEY`:tä frontendille!
   - Käytä VAIN Server Actionsissa ja API Routeissa

2. **Stripe Webhook Secret:** Tarkista AINA allekirjoitus webhookissa

3. **Environment Variables:** Vercelissä:
   - Production = Tuotantoarvot
   - Preview = Testausarvot
   - Development = Lokaalit arvot

---

**Päivitetty:** 2025-11-07
**Versio:** 1.0.1
