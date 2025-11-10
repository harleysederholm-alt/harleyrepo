# MyCashflow Raportoija - Täydellinen Setup-opas

Tämä dokumentaatio kattaa "Kattava MyCashflow Raportoija" -Micro-SaaS-tuotteen täydellisen asennuksen ja konfiguroinnin.

## 📋 Sisältö

1. [Yleiskatsaus](#yleiskatsaus)
2. [Backend (n8n-workflow)](#backend-n8n-workflow)
3. [Frontend (React SPA)](#frontend-react-spa)
4. [Integrointiohjeet](#integrointiohjeet)
5. [Testaaminen](#testaaminen)
6. [Tuotanto-deployment](#tuotanto-deployment)

---

## Yleiskatsaus

**MyCashflow Raportoija** on Micro-SaaS-tuote, joka mahdollistaa MyCashflow-kauppiaille:
- MyCashflow-datan kyseleminen suomeksi
- AI-pohjaisen analyysin saamisen tuotteiden ja tilausten perusteella
- Yksinkertaisen chat-pohjaisen käyttöliittymän kautta

### Arkkitehtuuri

```
┌─────────────────┐
│  React Frontend │ (Next.js + TypeScript + Tailwind)
│  /mycashflow-   │
│   reporter      │
└────────┬────────┘
         │
         │ POST: {apiKey, question}
         │
         ▼
┌──────────────────────┐
│  n8n Webhook Trigger │
│  mycashflow-reporter │
└────────┬─────────────┘
         │
         ├─────────────────────┬────────────────┐
         ▼                     ▼                ▼
    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
    │ MyCashflow  │    │ MyCashflow  │    │ Prepare  │
    │  Products   │    │   Orders    │    │ Context  │
    │   API       │    │    API      │    │          │
    └──────┬──────┘    └──────┬──────┘    └────┬─────┘
           └────────────────┬─────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  Groq LLM API    │
                    │ (Mixtral-8x7b)   │
                    │ Analysis in FI   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Format Response │
                    │  HTTP Response   │
                    └──────────────────┘
```

---

## Backend (n8n-workflow)

### Tiedostot

- **Workflow JSON:** `/n8n/workflows/mycashflow-reporter.json`
- **Configuration:** `/n8n/.env` (sinun tulee luoda)

### Asenna n8n

#### 1. Edellytykset

```bash
# Tarkista Docker ja Docker Compose
docker --version
docker-compose --version

# Pitäisi olla:
# Docker version 20.10+
# Docker Compose version 1.29+
```

#### 2. Ympäristömuuttujien konfigurointi

```bash
cd /home/user/harleyrepo/n8n
cp .env.example .env
```

Muokkaa `/n8n/.env`:

```env
# n8n-perus
N8N_BASIC_AUTH_PASSWORD=your-strong-password-here
N8N_ENCRYPTION_KEY=your-random-encryption-key-here
GENERIC_TIMEZONE=Europe/Helsinki

# Groq API (LLM-analyysi suomeksi)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx  # https://console.groq.com/keys

# MyCashflow API (valinnainen - testisarja)
MYCASHFLOW_API_ENDPOINT=https://api.mycashflow.fi/v1

# n8n Database (SQLite → PostgreSQL tuotannossa)
DB_TYPE=sqlite
DB_SQLITE_PATH=database.db

# Webhook-URL (tuotannossa)
WEBHOOK_URL=https://your-domain.com/webhook
```

#### 3. Käynnistä n8n

```bash
docker-compose up -d
```

Tarkista:
```bash
# Lokeja
docker-compose logs -f n8n

# Pitäisi näkyä: "Server started successfully"
```

#### 4. Avaa n8n UI

Avaa selaimessa: `http://localhost:5678`

- **Käyttäjä:** `admin`
- **Salasana:** `.env`-tiedostosta `N8N_BASIC_AUTH_PASSWORD`

#### 5. Tuo workflow

1. Klikkaa **"Import from File"** (vasemmasta palkista)
2. Valitse `/n8n/workflows/mycashflow-reporter.json`
3. Klikkaa **"Import"**

#### 6. Workflow-rakenne

**Workflow:** `mycashflow-reporter.json`

Noodit (solmut):

| Node ID | Nimi | Tehtävä | Huomiot |
|---------|------|---------|---------|
| `webhook-trigger` | Webhook Trigger | Vastaanottaa POST: `{apiKey, question}` | Path: `/webhook/mycashflow-reporter` |
| `fetch-products` | Hae MyCashflow tuotteet | GET-pyynnön MyCashflow API:iin | Header: `X-Mcc-Auth: {{ apiKey }}` |
| `fetch-orders` | Hae MyCashflow tilaukset | GET-pyynnön MyCashflow API:iin | Header: `X-Mcc-Auth: {{ apiKey }}` |
| `prepare-context` | Valmistele LLM-konteksti | Yhdistää tuotteet ja tilaukset | Laskee tilastot (top products) |
| `llm-analysis` | Groq: Analysoi kysymys | Groq API-kutsu Mixtral-mallilla | Suomenkielinen prompt |
| `format-response` | Muotoile vastaus | Ekstraktoi LLM-vastauksen | JSON-muotoon |
| `http-response` | HTTP Response | Palauttaa vastauksen | Status 200 |

#### 7. Webhook-URL

Tuotannossa webhook-URL on:

```
https://your-n8n-domain.com/webhook/mycashflow-reporter
```

Lokaalit testit:
```
http://localhost:5678/webhook/mycashflow-reporter
```

---

## Frontend (React SPA)

### Tiedostot

- **Sivu:** `/app/mycashflow-reporter/page.tsx`
- **Tyylit:** TailwindCSS (ei erillisiä tiedostoja)

### Arkkitehtuuri

```typescript
MyCashflowReporterPage
├── State Management
│   ├── apiKey (MyCashflow API-avain)
│   ├── question (käyttäjän kysymys)
│   ├── messages (chat-historia)
│   ├── loading (lataus-tila)
│   └── error (virhe-ilmoitus)
│
├── UI Components
│   ├── Header (otsikko ja kuvaus)
│   ├── API Key Input (salasanakenttä)
│   ├── Chat Container
│   │   ├── Messages Area (viestien näyttö)
│   │   ├── Input Area (kysymysten syöttö)
│   │   └── Error Display
│   └── Info Footer (ominaisuuskortit)
│
└── Functions
    ├── handleApiKeySubmit
    ├── handleChangeApiKey
    └── sendQuestion
```

### Asenna Frontend

Frontend sisältään jo `package.json`:ssa. Älä tarvitse erillisiä asennus-vaiheita.

#### 1. Tarkista riippuvuudet

```bash
cd /home/user/harleyrepo
npm list react react-dom lucide-react tailwindcss
```

Pitäisi näkyä:
```
npm list react
harleyrepo@1.0.0 /home/user/harleyrepo
└── react@18.3.0

npm list tailwindcss
├── tailwindcss@3.4.0
```

#### 2. Ympäristömuuttujat

Luo/muokkaa `/home/user/harleyrepo/.env.local`:

```env
# n8n Webhook URL
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/mycashflow-reporter

# Tuotannossa:
# NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/mycashflow-reporter
```

#### 3. Käynnistä Frontend

```bash
# Kehityspalvelin
npm run dev

# Avaa selaimessa: http://localhost:3000/mycashflow-reporter
```

#### 4. Rakenna tuotantoon

```bash
npm run build
npm run start

# Tai Vercel-deployment
vercel deploy
```

---

## Integrointiohjeet

### 1. MyCashflow API -avain

Käyttäjän tulee hankkia MyCashflow API-avain:

1. Kirjaudu MyCashflow Admin -paneeliin
2. Mene: **Asetukset → API-avaimet**
3. Luo uusi API-avain (scope: `products`, `orders`)
4. Kopioi avain
5. Liitä se MyCashflow Raportoijaan

### 2. Groq API -avain

n8n-workflow vaatii Groq API-avaimen:

1. Mene: https://console.groq.com/keys
2. Luo uusi API-avain
3. Aseta `.env`:iin: `GROQ_API_KEY=gsk_xxx`
4. Käynnistä n8n uudelleen: `docker-compose restart`

### 3. API-kutsut

#### Request

```bash
curl -X POST http://localhost:5678/webhook/mycashflow-reporter \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk_live_xxxxxxxxxxxxx",
    "question": "Mitkä tuotteet myyvät parhaiten?"
  }'
```

#### Response

```json
{
  "success": true,
  "question": "Mitkä tuotteet myyvät parhaiten?",
  "answer": "Perustuen kaupan myyntitietoihin, parhaiten myyvät tuotteet ovat:\n\n1. Tuote A - 156 kappaletta\n2. Tuote B - 142 kappaletta\n3. Tuote C - 128 kappaletta\n\nNäillä tuotteilla on korkein myyntimäärä viimeisten kuukausien aikana.",
  "timestamp": "2025-01-10T14:35:22.123Z",
  "source": "MyCashflow Reporter API"
}
```

---

## Testaaminen

### Testi 1: n8n Webhook

```bash
# 1. Tarkista n8n status
docker-compose ps

# 2. Testaa webhook cURL:lla
curl -X POST http://localhost:5678/webhook/mycashflow-reporter \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "test-key",
    "question": "Testikysymys?"
  }'

# 3. Pitäisi saada vastaus tai virhe (vaikka API-avain olisi väärä)
```

### Testi 2: Frontend

```bash
# 1. Avaa http://localhost:3000/mycashflow-reporter
# 2. Syötä API-avain (voit käyttää testia)
# 3. Kirjoita kysymys
# 4. Klikkaa "Lähetä"
# 5. Pitäisi näkyä vastaus 2-3 sekunnissa
```

### Testi 3: Integraatio

```bash
# 1. Varmista n8n on käynnissä
docker-compose ps n8n

# 2. Varmista .env on oikea
cat .env | grep GROQ_API_KEY

# 3. Testaa webhook
curl -X POST http://localhost:5678/webhook/mycashflow-reporter \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk_live_real_key_here",
    "question": "Mitkä ovat TOP 3 tuotetta?"
  }'

# 4. Lokeja
docker-compose logs n8n | tail -20
```

---

## Tuotanto-Deployment

### 1. n8n Tuotannossa

#### a) Railway.app (Suositus)

```bash
# 1. Kirjaudu Railway.app:iin
# 2. Luo uusi projekti
# 3. Valitse "Docker"
# 4. Liitä GitHub-repo
# 5. Aseta ympäristömuuttujat:
#    - N8N_BASIC_AUTH_PASSWORD
#    - GROQ_API_KEY
#    - N8N_ENCRYPTION_KEY
# 6. Deploy
```

#### b) Heroku (edullinen)

```bash
heroku login
heroku create your-n8n-app
heroku config:set N8N_BASIC_AUTH_PASSWORD=xxx
heroku config:set GROQ_API_KEY=gsk_xxx
git push heroku main
```

#### c) Omalla palvelimella (VPS)

```bash
# 1. SSH palvelimelle
ssh user@your-server.com

# 2. Asenna Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Kloonaa repo
git clone https://github.com/your-user/harleyrepo.git
cd harleyrepo/n8n

# 4. Aseta .env
nano .env

# 5. Käynnistä
docker-compose up -d

# 6. Nginx reverse proxy
# (katso nginx-config alempaa)
```

### 2. Frontend Tuotannossa

#### a) Vercel (Suositus Next.js:lle)

```bash
npm install -g vercel
vercel login
vercel env add NEXT_PUBLIC_N8N_WEBHOOK_URL https://your-n8n.com/webhook/mycashflow-reporter
vercel deploy --prod
```

#### b) Netlify

```bash
npm install -g netlify-cli
netlify login
# Aseta NEXT_PUBLIC_N8N_WEBHOOK_URL ympäristömuuttujaksi
netlify deploy --prod
```

### 3. Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/your-domain.com

upstream n8n_backend {
    server localhost:5678;
}

upstream nextjs_frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # n8n (punainen API)
    location /webhook/ {
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Frontend
    location / {
        proxy_pass http://nextjs_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Docker Compose Tuotannoon

Muokkaa `/n8n/docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    image: n8n:latest
    container_name: n8n-mycashflow
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - GENERIC_TIMEZONE=Europe/Helsinki
      - DB_TYPE=postgres  # ← MUUTETTU SQLite:stä
      - DB_POSTGRESDB_HOST=${DB_HOST}
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${DB_NAME}
      - DB_POSTGRESDB_USER=${DB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  n8n_data:
  postgres_data:
```

---

## Turvallisuus

### 1. API-avaimet

✅ **DO:**
- Käytä ympäristömuuttujia `.env`-tiedostossa
- Poista `.env` `.gitignore`:sta (älä committoi salasanoja!)
- Kierrätä API-avaimet säännöllisesti

❌ **DON'T:**
- Älä laita API-avaimia koodiin
- Älä commitoi `.env`-tiedostoja
- Älä jaa salasanoja Slackissa tai emailissa

### 2. HTTPS

Tuotannossa **AINA HTTPS**:

```bash
# Let's Encrypt (ilmainen)
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com
```

### 3. Rate Limiting

Groq API:n kvootit:
- Llama 3 70B: 30 req/min, 6000 tokens/min
- Llama 3 8B: 30 req/min, 14400 tokens/min

Lisää n8n-workflowun rate limiting:
```javascript
// Lisää Code-nodeen
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
await delay(2000); // 2 sekunnin viive
```

---

## Vianmääritys

### n8n ei käynnisty

```bash
# Tarkista logit
docker-compose logs n8n

# Häivytä ja käynnistä uudelleen
docker-compose down
docker-compose up -d --force-recreate

# Tarkista portti (5678)
lsof -i :5678
```

### Groq API virhe

```
Error: 429 Too Many Requests
```

→ Olet ylittänyt Groq-kvootin. Odota 1 minuuttia tai päivitä maksusuunnitelmaan.

### MyCashflow API virhe

```
Error: 401 Unauthorized
```

→ API-avain on virheellinen tai vanhentunut. Tarkista avain MyCashflow-paneelista.

### Frontend ei yhdisty n8n:iin

```
Error: CORS / Network error
```

→ Aseta `.env.local`:
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/mycashflow-reporter
```

---

## Säännölliset ylläpitotyöt

### Päivittäin
- Tarkista lokit virheistä
- Seuraa Groq API kvootin käyttöä

### Viikoittain
- Testaa webhook manuaalisesti
- Tarkista n8n-version päivitykset

### Kuukausittain
- Backup n8n-datasta
- Kierrätä API-avaimet
- Tarkista kustannukset (Groq, hosting)

---

## Lisäresurssit

- **n8n dokumentaatio:** https://docs.n8n.io/
- **Groq API:** https://console.groq.com/docs/speech-text
- **MyCashflow API:** https://api-doc.mycashflow.fi/
- **Next.js dokumentaatio:** https://nextjs.org/docs
- **TailwindCSS:** https://tailwindcss.com/docs

---

## Lisensointi ja Käyttöehdot

Tämä projekti on saatavilla MIT-lisenssillä.

```
MIT License

Copyright (c) 2025 MyCashflow Reporter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
```

---

## Tuki ja Kehitys

- **Bugi-raportit:** Avaa GitHub-issue
- **Kehitysideat:** Katso CONTRIBUTING.md
- **Yhteyttä:** harley@example.com

---

**Päivitetty:** 2025-01-10
**Versio:** 1.0.0
