# Quick Start - Tietokantaskeeman Asennus

## ⚡ Nopea Asennus (5 minuuttia)

### 1️⃣ Luo Supabase-projekti

1. Mene osoitteeseen: https://supabase.com
2. Klikkaa **"New Project"**
3. Anna projektille nimi: `pienhankinta-vahti`
4. Valitse salasana ja datacenter (suositus: `eu-north-1` - Tukholma)
5. Odota 2-3 minuuttia projektin valmistumista

### 2️⃣ Kopioi API-avaimet

1. Siirry projektin **Settings** > **API**
2. Kopioi seuraavat arvot:

```bash
Project URL:     https://xxxxx.supabase.co
anon key:        eyJhbGciOi...
service_role:    eyJhbGciOi... # TÄRKEÄ: n8n tarvitsee tämän!
```

3. Luo `.env.local`-tiedosto projektin juureen:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Service Role (VAIN palvelinpuolelle!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (lisätään myöhemmin)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Groq API (lisätään myöhemmin)
GROQ_API_KEY=gsk_...
```

### 3️⃣ Aja Migraatiot

#### Tapa 1: SQL Editor (SUOSITELTU)

1. Siirry Supabase Dashboard > **SQL Editor**
2. Kopioi tiedoston `migrations/001_initial_schema.sql` sisältö
3. Liitä SQL Editoriin ja klikkaa **RUN**
4. ✅ Tarkista, että saat vihreän "Success"-viestin
5. Kopioi tiedoston `migrations/002_add_missing_tables_and_stripe.sql` sisältö
6. Liitä SQL Editoriin ja klikkaa **RUN**
7. ✅ Tarkista, että saat vihreän "Success"-viestin

#### Tapa 2: Supabase CLI (Edistynyt)

```bash
# Asenna CLI
npm install -g supabase

# Kirjaudu
supabase login

# Linkitä projekti
supabase link --project-ref <PROJECT_ID>

# Aja migraatiot
supabase db push
```

### 4️⃣ Tarkista Taulut

1. Siirry **Table Editor**
2. Näet nämä taulut:
   - ✅ `profiles` (9 saraketta)
   - ✅ `hankinnat` (10 saraketta)
   - ✅ `user_hankinta_scores` (7 saraketta)
   - ✅ `user_alerts` (7 saraketta)

### 5️⃣ Tarkista RLS-Säännöt

1. Siirry **Authentication** > **Policies**
2. Tarkista, että jokainen taulu näyttää "🔒" -lukon (RLS päällä)
3. Yhteensä 15 politiikkaa:
   - `profiles`: 4 politiikkaa
   - `hankinnat`: 3 politiikkaa
   - `user_hankinta_scores`: 4 politiikkaa
   - `user_alerts`: 4 politiikkaa

---

## ✅ Valmis!

Tietokantaskeema on nyt valmis. Voit siirtyä seuraaviin vaiheisiin:

1. ⏭️ [n8n-automaatio](../n8n/README.md)
2. ⏭️ Stripe-integraatio
3. ⏭️ Frontend-toteutus

---

## 🆘 Ongelmatilanteet

### Virhe: "relation already exists"

**Ratkaisu:** Jokin taulu on jo olemassa. Poista taulut manuaalisesti tai käytä:

```sql
DROP TABLE IF EXISTS public.user_alerts CASCADE;
DROP TABLE IF EXISTS public.user_hankinta_scores CASCADE;
DROP TABLE IF EXISTS public.hankinnat CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

Sitten aja migraatiot uudelleen.

### Virhe: "permission denied"

**Ratkaisu:** Tarkista, että olet kirjautunut projektiin oikeilla tunnuksilla.

### Virhe: "function handle_updated_at() does not exist"

**Ratkaisu:** Varmista, että ajoit `001_initial_schema.sql` ENNEN `002_add_missing_tables_and_stripe.sql`.

---

## 📚 Lisädokumentaatio

- [TIETOKANTASKEEMA.md](./TIETOKANTASKEEMA.md) - Täydellinen skeemadokumentaatio
- [KYSELYESIMERKIT.md](./KYSELYESIMERKIT.md) - TypeScript-kyselyesimerkit
- [README.md](./README.md) - Yleiskatsaus

---

**Päivitetty:** 2025-11-07
