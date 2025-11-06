# PienHankinta-Vahti 🎯

**Älykäs työkalu pienhankintamahdollisuuksien löytämiseen suomalaisille yrittäjille**

PienHankinta-Vahti on Micro-SaaS -sovellus, joka auttaa suomalaisia pienyrittäjiä löytämään relevantteja pienhankintailmoituksia kunnista ja kaupungeista. Sovellus käyttää tekoälyä (Groq API) datan analysointiin ja automaattista skreippausta (n8n) hankintojen keräämiseen.

---

## 🚀 Ominaisuudet

### ✅ Toteutetut ominaisuudet

- **Automaattinen seuranta**: n8n skreippaa kuntien sivut 30 minuutin välein
- **AI-analyysi**: Groq (Llama 3 70B) analysoi jokaisen hankinnan ja tiivistää sen
- **Älykkä matching**: AI laskee osuvuusprosentin käyttäjän profiiliin
- **Riskianalyysi**: AI tunnistaa lyhyet määräajat ja muut riskit
- **Käyttäjäprofiilit**: Vapaamuotoinen liiketoimintakuvaus AI-matchingia varten
- **Tarjousapuri**: AI generoi tarjousluonnokset (Premium)
- **Responsiivinen UI**: Toimii sekä desktop- että mobile-laitteilla

---

## 🛠️ Teknologiastack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase Auth** (autentikaatio)

### Backend & Database
- **Supabase** (PostgreSQL, Auth, Storage)
- **Row Level Security (RLS)** tietoturvalle

### Automaatio & AI
- **n8n** (Docker) - Web scraping ja workflow-automaatio
- **Groq API** (Llama 3 70B & 8B) - AI-analyysi ja tekstingenerointi

### Deployment
- **Vercel** (Frontend)
- **Supabase Cloud** (Backend)
- **Docker** (n8n)

---

## 📁 Projektirakenne

```
pienhankinta-vahti/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Etusivu
│   ├── login/               # Kirjautuminen
│   ├── onboarding/          # Käyttäjän profiilin täyttö
│   ├── dashboard/           # Pääsivu (hankinnat-feed)
│   ├── actions.ts           # Server Actions (tarjousapuri)
│   └── api/
│       └── calculate-match/ # AI-osuvuusprosentin laskenta
├── components/              # React-komponentit
│   ├── HankintaCard.tsx     # Hankintakortti
│   └── HankintaModal.tsx    # Yksityiskohtainen modaali
├── lib/                     # Utilities ja asetukset
│   ├── supabase/            # Supabase-clientit
│   ├── utils.ts             # Apufunktiot
│   └── constants.ts         # Konstantit
├── types/                   # TypeScript-tyypit
│   └── database.types.ts    # Supabase-tietokantatyypit
├── supabase/                # Supabase-konfiguraatio
│   ├── migrations/          # SQL-migraatiot
│   │   └── 001_initial_schema.sql
│   └── README.md
├── n8n/                     # n8n-automaatio
│   ├── docker-compose.yml   # Docker-konfiguraatio
│   ├── workflows/           # n8n workflow JSON
│   │   └── pienhankinta-skreippaus.json
│   └── README.md
└── README.md                # Tämä tiedosto
```

---

## 🏁 Pika-aloitus

### 1. Kloonaa repositorio

```bash
git clone <repo-url>
cd pienhankinta-vahti
```

### 2. Asenna riippuvuudet

```bash
npm install
```

### 3. Konfiguroi Supabase

1. Luo projekti osoitteessa [supabase.com](https://supabase.com)
2. Aja SQL-migraatio: `supabase/migrations/001_initial_schema.sql`
3. Kopioi API-avaimet

### 4. Konfiguroi Groq API

1. Hanki API-avain: [console.groq.com](https://console.groq.com/keys)
2. Lisää `.env.local`-tiedostoon

### 5. Luo `.env.local`

```bash
cp .env.local.example .env.local
nano .env.local  # Täytä arvot
```

Tarvittavat ympäristömuuttujat:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Käynnistä Next.js dev-serveri

```bash
npm run dev
```

Sovellus käynnistyy osoitteessa: [http://localhost:3000](http://localhost:3000)

### 7. Käynnistä n8n (valinnainen)

```bash
cd n8n
cp .env.example .env
nano .env  # Täytä arvot
docker-compose up -d
```

n8n UI: [http://localhost:5678](http://localhost:5678)

---

## 📊 Tietokantaskeema

### `profiles`-taulu

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| `id` | UUID | Käyttäjän ID (viittaus `auth.users`) |
| `paikkakunnat` | TEXT[] | Valitut paikkakunnat |
| `toimialat` | TEXT[] | Valitut toimialat |
| `ai_profiili_kuvaus` | TEXT | **TÄRKEIN:** Vapaamuotoinen yrityksen kuvaus |

### `hankinnat`-taulu

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| `id` | BIGINT | Automaattinen ID |
| `otsikko` | TEXT | Hankinnan otsikko |
| `kunta` | TEXT | Kunta/kaupunki |
| `maarapaiva` | TIMESTAMP | Tarjouksen määräpäivä |
| `linkki_lahteeseen` | TEXT | **UNIQUE:** Alkuperäinen URL |
| `toimiala_ai` | TEXT | AI:n luokittelema toimiala |
| `tiivistelma_ai` | TEXT | AI:n generoima tiivistelmä |
| `riskit_ai` | TEXT | AI:n tunnistama riskit |
| `raakadata` | JSONB | Alkuperäinen skreipattu data |

---

## 🤖 AI-ominaisuudet

### 1. Hankinnan analysointi (n8n → Groq)

**Malli:** Llama 3 70B (8192 tokens)

n8n skreippaa kunnan sivut ja lähettää raakadatan Groq API:lle. AI palauttaa:
- `toimiala_ai`: Luokiteltu toimiala (esim. "Rakentaminen")
- `tiivistelma_ai`: Tiivistelmä hankinnasta
- `riskit_ai`: Tunnistetut riskit ja huomiot

### 2. AI-osuvuusprosentti (Frontend → Groq)

**Malli:** Llama 3 8B (8192 tokens) - Nopeampi ja halvempi

Kun käyttäjä avaa dashboardin, jokainen hankinta saa osuvuusprosentin (0-100%) vertaamalla:
- Käyttäjän `ai_profiili_kuvaus`
- Hankinnan `tiivistelma_ai`

### 3. Tarjousapuri (Premium)

**Malli:** Llama 3 70B (8192 tokens)

Generoi ammattimaisen tarjousluonnoksen perustuen:
- Käyttäjän yritysprofiiliin
- Hankinnan tietoihin
- AI:n tiivistelmään ja riskeihin

---

## 🔐 Tietoturva

### RLS (Row Level Security)

**profiles-taulu:**
- ✅ Käyttäjät voivat lukea/muokata VAIN omaa riviään
- ✅ Profiili luodaan automaattisesti rekisteröinnin yhteydessä

**hankinnat-taulu:**
- ✅ Kaikki autentikoituneet voivat LUKEA hankintoja
- ✅ VAIN `service_role` (n8n) voi KIRJOITTAA hankintoja

### Ympäristömuuttujat

- ❌ **EI KOSKAAN** commitoi `.env.local` GitHubiin
- ✅ Käytä `.env.local.example` template'na
- ✅ `SUPABASE_SERVICE_ROLE_KEY` on VAIN palvelinpuolella

---

## 🚀 Deployment

### Vercel (Frontend)

1. Pushaa koodi GitHubiin
2. Yhdistä Vercel: [vercel.com/new](https://vercel.com/new)
3. Lisää ympäristömuuttujat Vercelin dashboardissa
4. Deploy!

### Supabase (Backend)

1. Luo projekti: [supabase.com](https://supabase.com)
2. Aja SQL-migraatio
3. Kopioi API-avaimet Verceliin

### n8n (Automaatio)

**Vaihtoehto A:** Lokaalisti (Docker)
```bash
cd n8n && docker-compose up -d
```

**Vaihtoehto B:** n8n Cloud
- Luo tili: [n8n.io](https://n8n.io)
- Tuo workflow: `n8n/workflows/pienhankinta-skreippaus.json`

---

## 📈 Skaalautuvuus ja kustannukset

### Groq API Quotat (Free Tier)

- **Llama 3 70B:** 30 req/min, 6000 tokens/min
- **Llama 3 8B:** 30 req/min, 14400 tokens/min

### Arvio kuukausikustannuksista

| Palvelu | Free Tier | Paid |
|---------|-----------|------|
| **Vercel** | ✅ Free (Hobby) | $20/kk (Pro) |
| **Supabase** | ✅ 500MB DB, 50MB storage | $25/kk (Pro) |
| **Groq API** | ✅ Free (rajoitukset) | Pay-as-you-go |
| **n8n** | Lokaalisti (Docker) | $20/kk (Cloud) |

**Yhteensä:** 0€/kk (Free Tier) tai ~50€/kk (Paid)

---

## 🛣️ Roadmap

### Toteutettu ✅
- [x] Supabase-tietokanta ja RLS
- [x] n8n workflow ja Docker-konfiguraatio
- [x] Next.js frontend (login, onboarding, dashboard)
- [x] AI-osuvuusprosentti
- [x] Tarjousapuri (Premium)

### Suunniteltu 🔮
- [ ] Lisää kuntia workflow'hun (tällä hetkellä vain placeholder)
- [ ] Sähköposti-ilmoitukset uusista hankinnista
- [ ] Maksullinen Premium-taso (Stripe)
- [ ] Hankintojen tallennus/suosikit
- [ ] Admin-dashboard (statistiikat)
- [ ] Mobile-sovellus (React Native)

---

## 🤝 Kontribuointi

Kontribuutiot ovat tervetulleita! Avaa issue tai pull request.

---

## 📄 Lisenssi

MIT License - Vapaa käyttöön kaupallisesti ja ei-kaupallisesti.

---

## 💡 Yhteystiedot

**Projekti:** PienHankinta-Vahti
**Kehittäjä:** Harley Sederholm
**Vuosi:** 2025

---

## 🙏 Kiitokset

- [Supabase](https://supabase.com) - Backend-as-a-Service
- [Groq](https://groq.com) - Nopea LLM-inferenssi
- [n8n](https://n8n.io) - Workflow-automaatio
- [Vercel](https://vercel.com) - Frontend-hosting
- [Next.js](https://nextjs.org) - React-framework
- Suomen kunnat ja kaupungit avoimen datan tarjoamisesta

---

**Tehty ❤️ suomalaisille pienyrittäjille**
