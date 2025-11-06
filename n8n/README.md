# n8n-automaatio - PienHankinta-Vahti

Tämä kansio sisältää n8n-workflow'n, joka automaattisesti:
1. 🕐 Skreippaa pienhankintailmoituksia kuntien sivuilta (30 min välein)
2. 🤖 Analysoi datan Groq API:lla (Llama 3 70B)
3. 💾 Tallentaa tulokset Supabase-tietokantaan

## Asennus

### 1. Luo .env-tiedosto

```bash
cd n8n
cp .env.example .env
nano .env  # Täytä arvot
```

Tarvittavat arvot:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` → Supabase Dashboard
- `GROQ_API_KEY` → [console.groq.com](https://console.groq.com/keys)
- `N8N_BASIC_AUTH_PASSWORD` → Valitse vahva salasana

### 2. Käynnistä n8n

```bash
docker-compose up -d
```

### 3. Avaa n8n UI

Avaa selaimessa: [http://localhost:5678](http://localhost:5678)

- Käyttäjä: `admin`
- Salasana: Se, minkä määritit `.env`-tiedostossa

### 4. Tuo workflow

1. Klikkaa **"Import from File"**
2. Valitse `workflows/pienhankinta-skreippaus.json`
3. Klikkaa **"Save"**

### 5. Konfiguroi Credentials

Workflow tarvitsee seuraavat credentiaalit:

#### a) Supabase Credentials

1. Klikkaa workflow'ssa Supabase-nodea
2. Valitse **"Create New Credential"**
3. Täytä:
   - **URL:** `{{ $env.SUPABASE_URL }}`
   - **Service Role Key:** `{{ $env.SUPABASE_SERVICE_ROLE_KEY }}`

#### b) Groq API Credentials

1. Klikkaa HTTP Request -nodea (Groq)
2. Authentication > Header Auth
3. Täytä:
   - **Name:** `Authorization`
   - **Value:** `Bearer {{ $env.GROQ_API_KEY }}`

### 6. Aktivoi workflow

Klikkaa **"Active"**-toggle workflow'n oikeassa yläkulmassa.

## Workflow-rakenne

```
┌─────────────────────┐
│  Schedule Trigger   │  ← Ajastus: 30 min välein
│   (30 min)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  HTTP Request       │  ← Skreippaa kuntien sivuja
│  (Kunnan sivu)      │     (esim. Vantaa, Espoo, Helsinki)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  HTML Extract       │  ← Parsii HTML-sisältö
│  (Cheerio)          │     Hakee: otsikko, määräpäivä, linkki
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Function Node      │  ← Tarkistaa duplikaatit
│  (Check Existing)   │     Supabasesta (linkki_lahteeseen)
└──────────┬──────────┘
           │
           ├── Jos löytyy → Lopeta
           │
           └── Jos ei löydy ▼
┌─────────────────────┐
│  HTTP Request       │  ← Groq API: Analysoi hankinta
│  (Groq)             │     Input: raakadata
└──────────┬──────────┘     Output: toimiala_ai, tiivistelma_ai, riskit_ai
           │
           ▼
┌─────────────────────┐
│  Supabase Node      │  ← INSERT INTO hankinnat
│  (Insert)           │     Tallentaa JSON-datan
└─────────────────────┘
```

## Testaaminen

### Testaa manuaalisesti

1. Avaa workflow n8n UI:ssa
2. Klikkaa **"Execute Workflow"** (Play-nappi)
3. Tarkista, että data tallentuu Supabaseen:
   - Supabase Dashboard → Table Editor → `hankinnat`

### Lokien tarkistelu

```bash
# Katso n8n-lokeja
docker-compose logs -f n8n

# Pysäytä n8n
docker-compose down

# Käynnistä uudelleen
docker-compose up -d
```

## Kuntatietolähteet (Placeholder)

Workflow sisältää placeholder-URL:t. Korvaa nämä oikeilla URL:eilla:

| Kunta | Tyyppi | URL (Esimerkki) |
|-------|--------|-----------------|
| Vantaa | HTML-sivu | `https://www.vantaa.fi/hankinnat` |
| Espoo | PDF-lista | `https://www.espoo.fi/hankinnat.pdf` |
| Helsinki | RSS-feed | `https://www.hel.fi/hankinnat/rss` |

**HUOM:** Jokainen kunta tarvitsee oman parserinsa. Workflow'ssa on esimerkki HTML-parsimisesta.

## Groq API Quotat

Groq Free Tier:
- **Llama 3 70B:** 30 requests/min, 6000 tokens/min
- **Llama 3 8B:** 30 requests/min, 14400 tokens/min

Jos ylität quotan, harkitse:
1. Batch-prosessointia (kerää useita hankintoja ennen Groq-kutsua)
2. Caching-logiikkaa
3. Maksuliittymään päivitystä

## Tuotanto-checklist

- [ ] Vaihda SQLite → PostgreSQL (docker-compose.yml)
- [ ] Ota käyttöön Webhook-URL (jos tarvitaan)
- [ ] Lisää error-handling (Slack/Email-notifikaatiot)
- [ ] Poista testidatat Supabasesta
- [ ] Lisää lisää kuntia workflow'hun
- [ ] Konfiguroi backup-strategia n8n-datalle

## Seuraavat vaiheet

✅ Vaihe 1 valmis: Tietokantaskeema ja RLS
✅ Vaihe 2 valmis: n8n Docker + Workflow
⏭️ Vaihe 3: Frontend-toteutus (Next.js)
⏭️ Vaihe 4: AI-ominaisuudet
