# Vercel Deployment Setup - PienHankinta-Vahti

## 🚨 KRIITTINEN: Lisää ympäristömuuttujat ENSIN

Vercel-deployment epäonnistuu jos ympäristömuuttujia ei ole asetettu.

### 1. Mene Vercelin asetuksiin

**URL:** https://vercel.com/harleysederholm-alts-projects/pienhankinta-vahti/settings/environment-variables

TAI

1. Avaa https://vercel.com
2. Valitse projekti: **pienhankinta-vahti**
3. Settings → Environment Variables

### 2. Lisää KAIKKI nämä muuttujat

Kopioi ja liitä jokainen muuttuja erikseen. Valitse **All Environments** (Production, Preview, Development).

```bash
# ============================================
# SUPABASE (PAKOLLINEN - Ilman näitä build failaa!)
# ============================================
NEXT_PUBLIC_SUPABASE_URL
<kopioi arvosta .env.local>

NEXT_PUBLIC_SUPABASE_ANON_KEY
<kopioi arvosta .env.local>

SUPABASE_SERVICE_ROLE_KEY
<kopioi arvosta .env.local>

# ============================================
# GROQ API (PAKOLLINEN - AI-ominaisuudet)
# ============================================
GROQ_API_KEY
<kopioi arvosta .env.local>

# ============================================
# APP URL (PAKOLLINEN - Redirectit)
# ============================================
NEXT_PUBLIC_APP_URL
https://pienhankinta-vahti.vercel.app

# ============================================
# STRIPE (Valinnainen nyt, päivitä myöhemmin)
# ============================================
STRIPE_SECRET_KEY
sk_test_placeholder_change_me_later

STRIPE_WEBHOOK_SECRET
whsec_placeholder_change_me_later

STRIPE_PRICE_ID_PRO
price_placeholder_change_me_later

STRIPE_PRICE_ID_AGENT
price_placeholder_change_me_later
```

### 3. Tallenna ja Redeploy

Kun olet lisännyt KAIKKI muuttujat:

1. **Deployments**-välilehti
2. Valitse viimeisin failed deployment
3. Klikkaa **⋮** (kolme pistettä)
4. Valitse **Redeploy**

TAI

1. **Git push** uusi commit
2. Vercel deployaa automaattisesti

## ✅ Tarkistus

### Build onnistui jos:
- ✅ Status: **Ready**
- ✅ Domains toimivat: https://pienhankinta-vahti.vercel.app
- ✅ Kirjautuminen toimii
- ✅ Dashboard latautuu

### Yleisiä ongelmia:

**Ongelma:** `Error: NEXT_PUBLIC_SUPABASE_URL is required`
- **Ratkaisu:** Lisää Supabase-muuttujat Verceliin ja redeploy

**Ongelma:** `Error: STRIPE_SECRET_KEY is missing`
- **Ratkaisu:** Lisää placeholder-arvot (yllä) tai oikeat Stripe-avaimet

**Ongelma:** Sivut näyttävät vanhentuneelta
- **Ratkaisu:** Tyhjennä selaimen cache tai avaa incognito-tilassa

## 🔥 Quick Fix (Jos kiire)

Jos haluat saada sivun nopeasti pystyyn ILMAN Stripea:

1. Lisää VAIN Supabase- ja Groq-muuttujat
2. Lisää Stripe-muuttujille placeholder-arvot (yllä)
3. Redeploy
4. Päivitä Stripe-avaimet myöhemmin kun luot tuotteet

## 📞 Tuki

Jos deployment epäonnistuu vieläkin:
1. Tarkista että **KAIKKI** muuttujat on lisätty
2. Tarkista ettei muuttujissa ole välilyöntejä alussa/lopussa
3. Valitse **All Environments** jokaiselle muuttujalle
4. Redeploy uudestaan

---

**HUOM:** Älä committaa .env.local GitHubiin! Kaikki salaisuudet tulee olla vain Vercelin environment variablesissa.
