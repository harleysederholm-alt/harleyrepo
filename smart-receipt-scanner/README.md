# 📋 Älykäs Kuittiskanneri

**Intelligent Receipt Scanner with Claude Vision & Procountor Integration**

Täydellinen, tuotantovalmis Micro-SaaS -ratkaisu kuittien lukemiseen Claude Vision -kyvyillä ja Procountorin ostolaskujen hallintaan.

---

## ✨ Ominaisuudet

- 🤖 **Claude 3.5 Vision** - Tehokas kuittien lukeminen suomalaisista kuiteista
- 📸 **Drag & Drop UI** - Yksinkertainen, intuitiivinen käyttöliittymä
- ✏️ **Tarkistus ja Muokkaus** - Käyttäjä voi korjata Claude:n lukemia arvoja
- 💾 **Procountor Integration** - Automaattinen lähetys ostolaskuiksi
- 🎨 **Tailwind CSS** - Moderni, responsiivinen design
- 🔐 **Turvallinen** - Ei salaisuuksien loukkausta frontendissa
- ⚡ **Nopea** - Real-time analysointi ja käsittely

---

## 🏗️ Arkkitehtuuri

```
┌─────────────────────────────────────────────────────────────┐
│                   ÄLYKÄS KUITTISKANNERI                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND (React + TypeScript + Tailwind)                   │
│  ├── File Upload (drag & drop)                              │
│  ├── Vision Analysis Call (n8n Webhook 1)                   │
│  ├── Form Review & Edit                                     │
│  └── Procountor Submission (n8n Webhook 2)                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  BACKEND (n8n Workflows)                                    │
│                                                              │
│  Workflow 1: Receipt Vision Analysis                        │
│  ├── Webhook (receipt image input)                          │
│  ├── Claude Vision Analysis                                 │
│  └── JSON Response (extraction result)                      │
│                                                              │
│  Workflow 2: Submit to Procountor                           │
│  ├── Webhook (verified data input)                          │
│  ├── HTTP Request (Procountor API)                          │
│  └── Response (success/error)                               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  INTEGRATIONS                                               │
│  ├── Anthropic Claude 3.5 Vision API                        │
│  └── Procountor REST API                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Projektin Rakenne

```
smart-receipt-scanner/
├── n8n-workflows/                    # n8n Workflow JSON:t
│   ├── workflow1-vision-analysis.json
│   └── workflow2-procountor-submission.json
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── App.tsx                   # Pääkomponentti
│   │   ├── index.tsx                 # Sovelluksen aloitus
│   │   └── index.css                 # Tailwind imports
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/                             # Dokumentaatio
├── SETUP_GUIDE.md                    # Yksityiskohtainen asennus-opas
└── README.md                         # Tämä tiedosto
```

---

## 🚀 Pika-Aloitus

### 1️⃣ Edellytykset

- **n8n** (Cloud tai Self-Hosted)
- **Node.js 18+** & **npm**
- **Anthropic Claude API Key**
- **Procountor API Credentials**

### 2️⃣ n8n Backend

1. Avaa https://app.n8n.cloud (tai lokaalinen n8n)
2. Tuo workflow JSON-tiedostot:
   - `workflow1-vision-analysis.json`
   - `workflow2-procountor-submission.json`
3. Aseta API-avaimet (Anthropic & Procountor)
4. Kopioi **Webhook URL:t**

### 3️⃣ Frontend Setup

```bash
# 1. Mene frontend-kansioon
cd smart-receipt-scanner/frontend

# 2. Asenna riippuvuudet
npm install

# 3. Luo .env.local tiedosto
cp .env.example .env.local

# 4. Syötä n8n Webhook URL:t .env.local:iin
# REACT_APP_N8N_VISION_URL=https://...
# REACT_APP_N8N_PROCOUNTOR_URL=https://...

# 5. Käynnistä sovellus
npm start
```

Sovellus avautuu osoitteessa: **http://localhost:3000**

---

## 📖 Käyttö

1. **Lataa kuitti:**
   - Klikkaa tai raahaa kuvatiedosto sovellukseen
   - Tuetut formaatit: PNG, JPG, GIF, WebP

2. **Lue kuitti:**
   - Klikkaa "🔍 Lue Kuitti (Claude Vision)"
   - Claude analysoi ja palauttaa JSON-datan

3. **Tarkista tiedot:**
   - Tarkista Claude:n lukemia arvoja
   - Muokkaa tarvittaessa käsin

4. **Lähetä Procountoriin:**
   - Klikkaa "✓ Lähetä Procountoriin"
   - Lasku luodaan automaattisesti

---

## 🔌 n8n Workflow Yksityiskohdat

### Workflow 1: Receipt Vision Analysis

**Solmut:**
1. **Webhook** - Vastaanottaa POST-pyynnön binaaridatalla
2. **Claude Vision** - Analysoi kuvan ja palauttaa JSON:n
3. **Respond to Webhook** - Palauttaa JSON-vastauksen

**Tulostus:**
```json
{
  "ostopaikka": "K-Market Asematie",
  "paivays": "2025-11-10",
  "summa_yhteensa": 124.50,
  "alv_prosentti": 24,
  "alv_summa": 24.10
}
```

### Workflow 2: Submit to Procountor

**Solmut:**
1. **Webhook** - Vastaanottaa POST-pyynnön (tarkastettu data)
2. **HTTP Request** - Lähettää Procountor API:iin
3. **Code** - Muotoilee vastauksen
4. **Respond to Webhook** - Palauttaa onnistumis/virhesanoman

**Procountor Payload:**
```json
{
  "invoiceType": "PURCHASE_INVOICE",
  "invoiceStatus": "DRAFT",
  "invoiceDate": "2025-11-10",
  "supplier": {"name": "K-Market Asematie"},
  "invoiceLines": [{"description": "...", "unitPrice": 124.50, ...}],
  "totalAmount": 124.50,
  "vatAmount": 24.10
}
```

---

## 🛠️ Konfiguraatio

### Environment Variables (Frontend)

```bash
# .env.local tai tuotanto-palvelimessa
REACT_APP_N8N_VISION_URL=https://your-n8n.com/webhook/receipt-analyze
REACT_APP_N8N_PROCOUNTOR_URL=https://your-n8n.com/webhook/procountor-submit
```

### n8n Environment Variables

**Workflow 2:ssä:**
- `PROCOUNTOR_ACCESS_TOKEN` - Procountor API Token

---

## 📦 Riippuvuudet

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client

### Backend (n8n)
- **n8n Core** - Workflow Automation
- **Claude Integration** - Vision API
- **HTTP Request** - REST Integration

---

## 🔒 Turvallisuus

✅ **Best Practices:**
- Kaikki API-avaimet tallennetaan n8n Credentials:iin
- Frontend ei käsittele salaisuuksia
- Binaarinen kuvavirta lähetetään suoraan webhookille
- HTTPS käytetään kaikissa integraatioissa

⚠️ **Huomioita:**
- `.env.local` ja API-avaimet **TULEE pitää salassa**
- Procountor API Token:ia ei tule paljastaa
- Käytä HTTPS:ää tuotannossa

---

## 🧪 Testaaminen

### Unit Tests (Frontend)
```bash
cd frontend
npm test
```

### Integration Testing

1. **n8n:ssä:** Klikkaa "Test" Webhook-nodessa
2. **Frontend:ssä:** Lataa testimakuitti ja testaa flow

### Production Testing

1. Testaa eri kuvakvaliteetilla (PNG, JPG, jne.)
2. Testaa eri kuittityyppejä
3. Varmista Procountor-integraatio

---

## 🚀 Deployment

### Frontend

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm run build
# Ota build/ -kansio Netlifyyn
```

**Perinteinen Palvelin:**
```bash
npm run build
# Käytä build/ -kansiota static file server:llä (Nginx, Apache)
```

### Backend (n8n)

**n8n Cloud:**
- Workflows ovat automaattisesti pilvipalvelussa

**Self-Hosted:**
- Vie workflows JSON:sta ja ota tuotanto-instanssilla käyttöön

---

## 📊 Esimerkki Workflow

```
Käyttäjä:
  1. Lataa kuvan kuittista
  2. Klikkaa "Lue Kuitti"
  ↓
Frontend:
  1. Lähettää image/binary dataa n8n Webhook 1:lle
  ↓
n8n Workflow 1:
  1. Vastaanottaa binaaridatan
  2. Lähettää Claude Vision API:iin
  3. Saa JSON-vastauksen (ostopaikka, summa, jne.)
  4. Palauttaa JSON:in takaisin frontendille
  ↓
Frontend:
  1. Näyttää muoto-lomakon esitäytettyä datalla
  2. Käyttäjä tarkistaa/korjaa tiedot
  3. Klikkaa "Lähetä Procountoriin"
  ↓
n8n Workflow 2:
  1. Vastaanottaa tarkastetun datan
  2. Muuntaa Procountor-formaattiin
  3. Lähettää Procountor API:iin
  4. Saa vastauksen (lasku ID tai virhe)
  ↓
Frontend:
  1. Näyttää onnistumis/virhesanoman
  2. Nollaa lomakon (onnistumisen jälkeen)
```

---

## 🐛 Vianmääritys

Katso [SETUP_GUIDE.md](./SETUP_GUIDE.md#vianmääritys) -tiedostossa oleva "Vianmääritys" -osio.

---

## 📝 Versiohistoria

| Versio | Päiväys | Muutokset |
|--------|---------|----------|
| 1.0 | 2025-11-10 | Initial Release - Full-stack solution |

---

## 🎓 Oppimisresurssit

- **n8n Docs:** https://docs.n8n.io/
- **Anthropic Docs:** https://docs.anthropic.com/claude/reference/vision
- **Procountor API:** https://procountor.com/api
- **React Docs:** https://react.dev
- **Tailwind Docs:** https://tailwindcss.com/docs

---

## 📄 Lisenssi

MIT License - Vapaasti käytettävissä kaupallisin tarkoituksin

---

## 💬 Tuki

Ongelmia? Tarkista:
1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Yksityiskohtainen asennus-opas
2. n8n dokumentaatio - https://docs.n8n.io/
3. Anthropic dokumentaatio - https://docs.anthropic.com/

---

**Tehty Full-Stack AI Architectilla** 🚀
