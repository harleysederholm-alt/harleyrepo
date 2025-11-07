# PienHankinta-Vahti - Tietokantaskeema

## 📋 Yleiskatsaus

Tämä dokumentti määrittelee **täydellisen tietokantaskeeman** PienHankinta-Vahti -sovellukselle.

**Tärkeä:** Tämä skeema on suunniteltu tukemaan **Freemium-liiketoimintamallia** ja **AI-osuvuuspisteytystä**.

---

## 🗄️ Taulut

### 1. `profiles` - Käyttäjäprofiilit

Yhdistetty Supabasen `auth.users`-tauluun. Sisältää käyttäjäkohtaiset asetukset, AI-profiilikuvauksen ja **Stripe-integraation kentät**.

| Sarake | Tyyppi | Oletusarvo | Pakollinen | Kuvaus |
|--------|--------|------------|------------|--------|
| `id` | UUID | - | ✅ | **PRIMARY KEY**, viittaa `auth.users(id)`, CASCADE DELETE |
| `paikkakunnat` | TEXT[] | `{}` | ❌ | Käyttäjän valitsemat paikkakunnat (esim. `['Helsinki', 'Espoo']`) |
| `toimialat` | TEXT[] | `{}` | ❌ | Käyttäjän valitsemat toimialat (esim. `['Rakentaminen', 'IT']`) |
| `ai_profiili_kuvaus` | TEXT | NULL | ❌ | **TÄRKEIN KENTTÄ:** Vapaamuotoinen kuvaus yrityksestä (esim. "Olen maalausliike Espoosta, teen vain ulkomaalauksia"). AI käyttää tätä osuvuuspisteytyksen perustana. |
| `plan` | TEXT | `'free'` | ✅ | **KRIITTINEN FREEMIUM-LOGIIKALLE:** `'free'`, `'pro'` tai `'agentti'` |
| `subscription_status` | TEXT | NULL | ❌ | Stripe-tilauksen status: `'active'`, `'canceled'`, `'past_due'`, `'trialing'` |
| `stripe_customer_id` | TEXT | NULL | ❌ | Stripe Customer ID, **UNIQUE** |
| `created_at` | TIMESTAMPTZ | NOW() | ✅ | Luontiaika |
| `updated_at` | TIMESTAMPTZ | NOW() | ✅ | Päivitysaika (päivittyy automaattisesti triggerillä) |

**Indeksit:**
- `idx_profiles_stripe_customer` (stripe_customer_id)
- `idx_profiles_plan` (plan)

**RLS-säännöt:**
- ✅ Käyttäjät voivat **lukea** VAIN oman profiilinsa (`auth.uid() = id`)
- ✅ Käyttäjät voivat **päivittää** VAIN oman profiilinsa
- ✅ Käyttäjät voivat **luoda** oman profiilinsa (onboarding)
- ✅ Käyttäjät voivat **poistaa** oman profiilinsa
- ✅ **Automaattitriggeri:** Profiili luodaan automaattisesti kun käyttäjä rekisteröityy (`on_auth_user_created`)

---

### 2. `hankinnat` - Pienhankintailmoitukset

Sisältää **kaikki kerätyt pienhankintailmoitukset**. n8n-agentit (Kaivaja + Jalostaja) täyttävät tämän taulun.

| Sarake | Tyyppi | Oletusarvo | Pakollinen | Kuvaus |
|--------|--------|------------|------------|--------|
| `id` | BIGINT | AUTO | ✅ | **PRIMARY KEY**, automaattinen ID |
| `otsikko` | TEXT | - | ✅ | Hankinnan otsikko (esim. "Koulun ulkomaalaustyöt") |
| `kunta` | TEXT | - | ✅ | Kunta/kaupunki (esim. "Helsinki") |
| `maarapaiva` | TIMESTAMPTZ | NULL | ❌ | Tarjouksen määräpäivä |
| `linkki_lahteeseen` | TEXT | - | ✅ | **UNIQUE:** Alkuperäinen URL (estää duplikaatit) |
| `toimiala_ai` | TEXT | NULL | ❌ | AI:n (Groq) luokittelema toimiala (esim. "Rakentaminen") |
| `tiivistelma_ai` | TEXT | NULL | ❌ | AI:n generoima tiivistelmä hankinnasta (Pro-ominaisuus) |
| `riskit_ai` | TEXT | NULL | ❌ | AI:n tunnistama riskit ja huomioitavat asiat (Pro-ominaisuus) |
| `raakadata` | JSONB | NULL | ❌ | Alkuperäinen skreipattu data JSON-muodossa |
| `created_at` | TIMESTAMPTZ | NOW() | ✅ | **KRIITTINEN FREEMIUM-LOGIIKALLE:** Luontiaika, käytetään 24h viiveen laskemiseen |
| `updated_at` | TIMESTAMPTZ | NOW() | ✅ | Päivitysaika (päivittyy automaattisesti triggerillä) |

**Indeksit:**
- `idx_hankinnat_kunta` (kunta)
- `idx_hankinnat_maarapaiva` (maarapaiva)
- `idx_hankinnat_toimiala` (toimiala_ai)
- `idx_hankinnat_linkki` (linkki_lahteeseen)

**RLS-säännöt:**
- ✅ **Kaikki autentikoituneet käyttäjät** voivat **lukea** hankintoja (`auth.role() = 'authenticated'`)
  - **HUOM:** Free-käyttäjät näkevät vain 24h vanhat (toteutetaan frontend-kyselyssä)
- ✅ **VAIN `service_role`** (n8n-agentit) voi **lisätä** hankintoja
- ✅ **VAIN `service_role`** voi **päivittää** hankintoja
- ❌ Tavalliset käyttäjät **eivät voi** lisätä tai muokata hankintoja

---

### 3. `user_hankinta_scores` - AI-osuvuuspisteet

Sisältää **AI:n laskemat osuvuuspisteet (0-100)** jokaiselle käyttäjä-hankinta-parille. n8n-agentti "Pisteyttäjä" täyttää tämän taulun.

| Sarake | Tyyppi | Oletusarvo | Pakollinen | Kuvaus |
|--------|--------|------------|------------|--------|
| `id` | BIGINT | AUTO | ✅ | **PRIMARY KEY**, automaattinen ID |
| `user_id` | UUID | - | ✅ | Viittaa `auth.users(id)`, CASCADE DELETE |
| `hankinta_id` | BIGINT | - | ✅ | Viittaa `hankinnat(id)`, CASCADE DELETE |
| `score` | INTEGER | - | ✅ | **Osuvuuspistemäärä 0-100** (100 = täydellinen match), CHECK (0-100) |
| `perustelu_ai` | TEXT | NULL | ❌ | AI:n selitys pistetykselle (esim. "Sopii hyvin: Maalaustyö Espoossa") |
| `created_at` | TIMESTAMPTZ | NOW() | ✅ | Luontiaika |
| `updated_at` | TIMESTAMPTZ | NOW() | ✅ | Päivitysaika (päivittyy automaattisesti triggerillä) |

**Rajoitteet:**
- `UNIQUE(user_id, hankinta_id)` - Yksi pisteytys per käyttäjä-hankinta-pari

**Indeksit:**
- `idx_user_scores_user` (user_id)
- `idx_user_scores_hankinta` (hankinta_id)
- `idx_user_scores_score` (score DESC)

**RLS-säännöt:**
- ✅ Käyttäjät voivat **lukea** VAIN omat pisteensä (`auth.uid() = user_id`)
- ✅ **VAIN `service_role`** (n8n "Pisteyttäjä") voi **lisätä** pisteitä
- ✅ **VAIN `service_role`** voi **päivittää** pisteitä
- ✅ **VAIN `service_role`** voi **poistaa** pisteitä

---

### 4. `user_alerts` - Tallennetut hälytykset

Sisältää **käyttäjien tallentamat hakuvahdit**. Pro-ominaisuus.

| Sarake | Tyyppi | Oletusarvo | Pakollinen | Kuvaus |
|--------|--------|------------|------------|--------|
| `id` | BIGINT | AUTO | ✅ | **PRIMARY KEY**, automaattinen ID |
| `user_id` | UUID | - | ✅ | Viittaa `auth.users(id)`, CASCADE DELETE |
| `nimi` | TEXT | - | ✅ | Käyttäjän antama nimi hälytykselle (esim. "Maalaustyöt Espoo") |
| `kategoriat` | TEXT[] | `{}` | ❌ | Toimialat joita seurataan (esim. `['Rakentaminen', 'Kiinteistöhuolto']`) |
| `alueet` | TEXT[] | `{}` | ❌ | Kunnat/alueet joita seurataan (esim. `['Helsinki', 'Espoo', 'Vantaa']`) |
| `avainsanat` | TEXT[] | `{}` | ❌ | Avainsanat joita etsitään (esim. `['maalaus', 'julkisivu']`) |
| `created_at` | TIMESTAMPTZ | NOW() | ✅ | Luontiaika |
| `updated_at` | TIMESTAMPTZ | NOW() | ✅ | Päivitysaika (päivittyy automaattisesti triggerillä) |

**Indeksit:**
- `idx_user_alerts_user` (user_id)

**RLS-säännöt:**
- ✅ Käyttäjät voivat **lukea** VAIN omat hälytyksensä (`auth.uid() = user_id`)
- ✅ Käyttäjät voivat **luoda** omia hälytyksiä
- ✅ Käyttäjät voivat **päivittää** omia hälytyksiä
- ✅ Käyttäjät voivat **poistaa** omia hälytyksiä

---

## 🔐 RLS (Row Level Security) - Yhteenveto

| Taulu | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | ✅ Oma rivi | ✅ Oma rivi | ✅ Oma rivi | ✅ Oma rivi |
| `hankinnat` | ✅ Kaikki auth | ⚠️ Vain service_role | ⚠️ Vain service_role | ❌ Ei kukaan |
| `user_hankinta_scores` | ✅ Omat rivit | ⚠️ Vain service_role | ⚠️ Vain service_role | ⚠️ Vain service_role |
| `user_alerts` | ✅ Omat rivit | ✅ Omat rivit | ✅ Omat rivit | ✅ Omat rivit |

**Selite:**
- ✅ = Käyttäjä voi käyttää
- ⚠️ = Vain service_role (n8n)
- ❌ = Ei kukaan (myös service_role estetty)

---

## 🔄 Triggerit ja Automaatiot

### 1. `handle_updated_at()` - Päivitysajan automaattinen päivittäminen

Päivittää automaattisesti `updated_at`-kentän jokaiselle päivitykselle.

**Käytössä tauluissa:**
- `profiles`
- `hankinnat`
- `user_hankinta_scores`
- `user_alerts`

### 2. `handle_new_user()` - Profiilin automaattinen luonti

Luo automaattisesti tyhjän profiilin kun uusi käyttäjä rekisteröityy.

**Triggeri:** `on_auth_user_created` (auth.users INSERT)

---

## 📊 Näkymät (Views)

### `user_hankinnat_with_scores`

Yhdistää `hankinnat` ja `user_hankinta_scores` -taulut. Helpottaa frontend-kyselyitä.

**Sarakkeet:**
- Kaikki `hankinnat`-taulun sarakkeet
- `user_id` (käyttäjän ID)
- `score` (osuvuuspistemäärä)
- `perustelu_ai` (AI:n perustelu)
- `age_hours` (hankinnan ikä tunteina, laskettu kentä)

**RLS:** Käytössä (`security_invoker = true`), käyttäjät näkevät vain omat pisteensä.

---

## 🎯 Freemium-Logiikan Toteutus

### Free-tason käyttäjät (plan = 'free'):

```sql
-- Näytä VAIN 24h vanhat hankinnat
SELECT * FROM hankinnat
WHERE created_at < NOW() - INTERVAL '24 hours';
```

### Pro/Agentti-tason käyttäjät (plan = 'pro' tai 'agentti'):

```sql
-- Näytä KAIKKI hankinnat reaaliajassa
SELECT * FROM hankinnat;
```

### AI-ominaisuuksien tarkistus:

```typescript
// Frontend-logiikka
if (user.plan === 'free') {
  // Näytä "Päivitä Pro-tasolle" -nappi
  // Piilota: tiivistelma_ai, riskit_ai, score
} else if (user.plan === 'pro') {
  // Näytä: tiivistelma_ai, riskit_ai, score
  // Piilota: AI-Tarjousapuri
} else if (user.plan === 'agentti') {
  // Näytä KAIKKI ominaisuudet
}
```

---

## 🚀 Migraatioiden ajaminen

### Vaihe 1: Aja perusmigraatio
```bash
# Supabase SQL Editorissa:
# Aja: supabase/migrations/001_initial_schema.sql
```

### Vaihe 2: Aja täydennysmääritykset
```bash
# Supabase SQL Editorissa:
# Aja: supabase/migrations/002_add_missing_tables_and_stripe.sql
```

### Vaihe 3: Tarkista tulokset

**Taulut (Table Editor):**
- ✅ profiles (9 saraketta)
- ✅ hankinnat (10 saraketta)
- ✅ user_hankinta_scores (7 saraketta)
- ✅ user_alerts (7 saraketta)

**RLS-säännöt (Authentication > Policies):**
- ✅ profiles: 4 politiikkaa
- ✅ hankinnat: 3 politiikkaa
- ✅ user_hankinta_scores: 4 politiikkaa
- ✅ user_alerts: 4 politiikkaa

---

## 📌 Seuraavat Vaiheet

1. ✅ **Vaihe 1 VALMIS:** Tietokantaskeema ja RLS-säännöt
2. ⏭️ **Vaihe 2:** n8n-automaation pohjustus (Docker + Workflow)
3. ⏭️ **Vaihe 3:** Stripe-integraatio (Webhook + Server Actions)
4. ⏭️ **Vaihe 4:** Frontend-toteutus (Dashboard + Freemium-logiikka)
5. ⏭️ **Vaihe 5:** AI-ominaisuudet (Groq-integraatio)

---

## 🔒 Turvallisuushuomiot

1. **Service Role Key:** Säilytä ympäristömuuttujassa, ÄLÄ KOSKAAN frontend-koodissa!
2. **RLS:** Aina päällä kaikissa tauluissa - tämä on vallihautamme.
3. **Stripe Webhook:** Varmenna allekirjoitus (`stripe.webhooks.constructEvent`).
4. **UNIQUE-rajoitteet:**
   - `profiles.stripe_customer_id`
   - `hankinnat.linkki_lahteeseen`
   - `user_hankinta_scores(user_id, hankinta_id)`

---

**Dokumentaatio päivitetty:** 2025-11-07
**Versio:** 1.0.0
**Tekijä:** Pääarkkitehti
