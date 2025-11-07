# Supabase-konfiguraatio - PienHankinta-Vahti

## Tietokantaskeema

Tämä kansio sisältää Supabase-tietokannan migraatiot ja konfiguraatiotiedostot.

## Asennus

### 1. Supabase-projektin luonti

1. Mene osoitteeseen [supabase.com](https://supabase.com)
2. Luo uusi projekti
3. Odota, että projekti on valmis (noin 2 minuuttia)
4. Tallenna seuraavat tiedot:
   - `Project URL` (esim. `https://xxxxx.supabase.co`)
   - `anon/public key`
   - `service_role key` (TÄRKEÄ: Tarvitaan n8n:lle)

### 2. Migraatioiden ajaminen

#### Vaihtoehto A: Supabase SQL Editor (Suositeltu)

**TÄRKEÄ:** Aja migraatiot JÄRJESTYKSESSÄ!

1. Kirjaudu Supabase Dashboard -näkymään
2. Valitse projektisi
3. Mene kohtaan **SQL Editor** (vasemmasta valikosta)

**Vaihe 1:** Aja perusmigraatio
4. Avaa tiedosto `migrations/001_initial_schema.sql`
5. Kopioi sisältö ja liitä se SQL Editoriin
6. Klikkaa **RUN** tai paina `Ctrl+Enter`
7. Tarkista, että saat vihreän "Success" -viestin

**Vaihe 2:** Aja täydennysmääritykset
8. Avaa tiedosto `migrations/002_add_missing_tables_and_stripe.sql`
9. Kopioi sisältö ja liitä se SQL Editoriin
10. Klikkaa **RUN** tai paina `Ctrl+Enter`
11. Tarkista, että saat vihreän "Success" -viestin

#### Vaihtoehto B: Supabase CLI (Edistynyt)

```bash
# Asenna Supabase CLI
npm install -g supabase

# Kirjaudu
supabase login

# Linkitä projekti
supabase link --project-ref <PROJECT_ID>

# Aja migraatiot
supabase db push
```

### 3. Tarkista taulut

1. Mene **Table Editor** -näkymään
2. Sinun pitäisi nähdä seuraavat taulut:
   - ✅ `profiles` (9 saraketta)
   - ✅ `hankinnat` (10 saraketta)
   - ✅ `user_hankinta_scores` (7 saraketta)
   - ✅ `user_alerts` (7 saraketta)

### 4. Tarkista RLS-säännöt

1. Mene **Authentication** > **Policies**
2. Tarkista, että seuraavat politiikat ovat aktiivisia:
   - `profiles`: 4 politiikkaa
   - `hankinnat`: 3 politiikkaa
   - `user_hankinta_scores`: 4 politiikkaa
   - `user_alerts`: 4 politiikkaa

## Tietokantaskeema

> **📖 Katso täydellinen dokumentaatio:** [TIETOKANTASKEEMA.md](./TIETOKANTASKEEMA.md)

### Taulut (4 kpl)

1. **`profiles`** - Käyttäjäprofiilit + Stripe-integraatio (9 saraketta)
2. **`hankinnat`** - Pienhankintailmoitukset (10 saraketta)
3. **`user_hankinta_scores`** - AI-osuvuuspisteet 0-100 (7 saraketta)
4. **`user_alerts`** - Tallennetut hälytykset (7 saraketta)

### Tärkeimmät kentät

#### `profiles`
- `plan` (TEXT): **KRIITTINEN** - `'free'`, `'pro'` tai `'agentti'`
- `subscription_status` (TEXT): Stripe-tilauksen status
- `stripe_customer_id` (TEXT): Stripe Customer ID
- `ai_profiili_kuvaus` (TEXT): AI-matching-perusta

#### `hankinnat`
- `created_at` (TIMESTAMP): **KRIITTINEN** - 24h viive Free-käyttäjille
- `tiivistelma_ai` (TEXT): Groq-generoitu tiivistelmä
- `riskit_ai` (TEXT): Groq-generoitu riskianalyysi

#### `user_hankinta_scores`
- `score` (INTEGER): Osuvuuspistemäärä 0-100
- `perustelu_ai` (TEXT): AI:n selitys

## RLS (Row Level Security)

| Taulu | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | ✅ Oma rivi | ✅ Oma rivi | ✅ Oma rivi | ✅ Oma rivi |
| `hankinnat` | ✅ Kaikki auth | ⚠️ service_role | ⚠️ service_role | ❌ Ei kukaan |
| `user_hankinta_scores` | ✅ Omat rivit | ⚠️ service_role | ⚠️ service_role | ⚠️ service_role |
| `user_alerts` | ✅ Omat rivit | ✅ Omat rivit | ✅ Omat rivit | ✅ Omat rivit |

## Testaaminen

Migraatioskripti sisältää 3 testihankintaa:
- Vantaa: Koulun ulkomaalaustyöt
- Espoo: IT-tukipalvelut
- Helsinki: Siivouspalvelut kirjasto

**HUOM:** Poista nämä testidatat ennen tuotantokäyttöä!

## Ympäristömuuttujat Next.js-sovellukselle

Luo `.env.local`-tiedosto Next.js-projektin juureen:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Service Role Key (VAIN palvelinpuolelle!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Groq API
GROQ_API_KEY=gsk_...
```

## Seuraavat vaiheet

✅ **Vaihe 1 VALMIS:** Tietokantaskeema ja RLS-säännöt
⏭️ **Vaihe 2:** n8n-automaation pohjustus (Docker + Workflow)
⏭️ **Vaihe 3:** Stripe-integraatio (Webhook + Server Actions)
⏭️ **Vaihe 4:** Frontend-toteutus (Dashboard + Freemium-logiikka)
⏭️ **Vaihe 5:** AI-ominaisuudet (Groq-integraatio)
