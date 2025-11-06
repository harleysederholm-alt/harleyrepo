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

### 2. Migraation ajaminen

#### Vaihtoehto A: Supabase SQL Editor (Suositeltu)

1. Kirjaudu Supabase Dashboard -näkymään
2. Valitse projektisi
3. Mene kohtaan **SQL Editor** (vasemmasta valikosta)
4. Avaa tiedosto `migrations/001_initial_schema.sql`
5. Kopioi sisältö ja liitä se SQL Editoriin
6. Klikkaa **RUN** tai paina `Ctrl+Enter`
7. Tarkista, että saat vihreän "Success" -viestin

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
   - ✅ `profiles`
   - ✅ `hankinnat`

### 4. Tarkista RLS-säännöt

1. Mene **Authentication** > **Policies**
2. Tarkista, että seuraavat politiikat ovat aktiivisia:
   - `profiles`: 4 politiikkaa (SELECT, INSERT, UPDATE, DELETE)
   - `hankinnat`: 3 politiikkaa (SELECT, INSERT, UPDATE)

## Tietokantaskeema

### `profiles`-taulu

Sisältää käyttäjäkohtaiset asetukset ja AI-profiilin.

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| `id` | UUID | Viittaus `auth.users(id)` |
| `paikkakunnat` | TEXT[] | Käyttäjän valitsemat paikkakunnat |
| `toimialat` | TEXT[] | Käyttäjän valitsemat toimialat |
| `ai_profiili_kuvaus` | TEXT | **TÄRKEIN:** Vapaamuotoinen kuvaus yrityksestä |
| `created_at` | TIMESTAMP | Luontiaika |
| `updated_at` | TIMESTAMP | Päivitysaika (päivittyy automaattisesti) |

### `hankinnat`-taulu

Sisältää kaikki kerätyt pienhankintailmoitukset.

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| `id` | BIGINT | Automaattinen ID |
| `otsikko` | TEXT | Hankinnan otsikko |
| `kunta` | TEXT | Kunta/kaupunki |
| `maarapaiva` | TIMESTAMP | Tarjouksen määräpäivä |
| `linkki_lahteeseen` | TEXT | **UNIQUE:** Alkuperäinen URL (estää duplikaatit) |
| `toimiala_ai` | TEXT | AI:n luokittelema toimiala |
| `tiivistelma_ai` | TEXT | AI:n generoima tiivistelmä |
| `riskit_ai` | TEXT | AI:n tunnistama riskit |
| `raakadata` | JSONB | Alkuperäinen skreipattu data |
| `created_at` | TIMESTAMP | Luontiaika |
| `updated_at` | TIMESTAMP | Päivitysaika |

## RLS (Row Level Security)

### `profiles`-taulu

- ✅ Käyttäjät voivat lukea **VAIN** oman profiilinsa
- ✅ Käyttäjät voivat päivittää **VAIN** oman profiilinsa
- ✅ Uudet käyttäjät voivat luoda oman profiilinsa
- ✅ Profiili luodaan **automaattisesti** kun käyttäjä rekisteröityy

### `hankinnat`-taulu

- ✅ **Kaikki** autentikoituneet käyttäjät voivat **lukea** hankintoja
- ✅ **VAIN** `service_role` (n8n) voi **lisätä** ja **päivittää** hankintoja
- ❌ Tavalliset käyttäjät **eivät voi** lisätä tai muokata hankintoja

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

✅ Vaihe 1 valmis: Tietokantaskeema ja RLS
⏭️ Vaihe 2: n8n-automaation pohjustus (Docker + Workflow)
⏭️ Vaihe 3: Frontend-toteutus (Next.js)
⏭️ Vaihe 4: AI-ominaisuudet
