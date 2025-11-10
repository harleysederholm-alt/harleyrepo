# Älykäs Kuittiskanneri - Asennus ja Konfiguraatio Opas

Tämä on täydellinen opas "Älykäs Kuittiskanneri" -tuotteen asettamiseen ja käyttöönottoon.

## 📋 Sisällysluettelo
1. [Edellytykset](#edellytykset)
2. [n8n Backend Asennus](#n8n-backend-asennus)
3. [Frontend Asennus](#frontend-asennus)
4. [Integraatiot ja API-Avaimet](#integraatiot-ja-api-avaimet)
5. [Testaamin](#testaaminen)
6. [Tuotanto-Deployment](#tuotanto-deployment)

---

## Edellytykset

Sinulla pitää olla seuraavat:

- **n8n** asennettu ja käynnissä (cloud tai self-hosted)
  - n8n Cloud: https://app.n8n.cloud
  - Self-hosted: https://docs.n8n.io/hosting/installation/docker/

- **Node.js** (v18+) ja **npm** asennettu frontendille

- **API-Avaimet:**
  - Anthropic Claude API Key (https://console.anthropic.com/keys)
  - Procountor API Credentials (https://procountor.com/api-avaimet)

---

## n8n Backend Asennus

### Vaihe 1: Luo ensimmäinen Workflow (Claude Vision -analyysi)

1. Avaa n8n: https://app.n8n.cloud (tai lokaalinen instanssisi)

2. Luo uusi Workflow:
   - Klikkaa **"+ New Workflow"**
   - Anna nimi: **"Receipt Vision Analysis"**

3. Lisää **Webhook-node** (käynnistin):
   - Haku: "Webhook"
   - Aseta:
     - **Method:** POST
     - **Path:** `receipt-analyze`
     - **Respond:** At the end of workflow
     - **Data format:** Binary

4. Lisää **Claude (Anthropic) -node**:
   - Haku: "Anthropic"
   - Aseta:
     - **Authentication:** Valitse "Create new credential" ja syötä Anthropic API Key
     - **Model:** `claude-3-5-sonnet-20241022`
     - **Message type:** Text + Image
     - **Image:** `{{ $binary.data }}`
     - **System Prompt:** (katso alla)
     - **User Message:** "Lue oheinen kuitti ja palauta sen tiedot pyydetyssä JSON-muodossa."

   **System Prompt:**
   ```
   Olet suomalainen taloushallinnon assistentti. Tehtäväsi on lukea suomalaisia kuitteja ja palauttaa niiden tiedot AINOASTAAN seuraavassa JSON-muodossa. Älä kirjoita mitään muuta kuin pyydetty JSON-objekti.

   {
     "ostopaikka": "K-Market Asematie",
     "paivays": "YYYY-MM-DD",
     "summa_yhteensa": 124.50,
     "alv_prosentti": 24,
     "alv_summa": 24.10
   }

   Jos et pysty lukemaan jotain arvoa, aseta sen arvoksi null.
   ```

5. Lisää **Respond to Webhook -node**:
   - Haku: "Respond to Webhook"
   - Aseta:
     - **Response Body:** `{{ JSON.parse($json.message.content[0].text) }}`
     - **Status Code:** `200`

6. Yhdistä nodes:
   - Webhook → Claude
   - Claude → Respond to Webhook

7. **Tallenna ja ota käyttöön:**
   - Klikkaa "Save"
   - Ota workflow käyttöön klikkaamalla "Active" toggle

8. **Kopioi Webhook URL:**
   - Klikkaa Webhook-nodea
   - Kopioi **"Webhook URL"** (esim. `https://your-n8n-instance.com/webhook/receipt-analyze`)

---

### Vaihe 2: Luo toinen Workflow (Procountor -lähetys)

1. Luo uusi Workflow:
   - Klikkaa **"+ New Workflow"**
   - Anna nimi: **"Submit to Procountor"**

2. Lisää **Webhook-node** (käynnistin):
   - Aseta:
     - **Method:** POST
     - **Path:** `procountor-submit`
     - **Respond:** At the end of workflow

3. Lisää **HTTP Request -node**:
   - Haku: "HTTP Request"
   - Aseta:
     - **Method:** POST
     - **URL:** `https://api.procountor.com/api/v1/invoices`
     - **Headers:**
       - **Authorization:** `Bearer {{ $env.PROCOUNTOR_ACCESS_TOKEN }}`
       - **Accept:** `application/json`
       - **Content-Type:** `application/json`
     - **Body (raw JSON):**
       ```json
       {
         "invoiceType": "PURCHASE_INVOICE",
         "invoiceStatus": "DRAFT",
         "invoiceDate": "{{ $json.paivays }}",
         "dueDate": "{{ $json.paivays }}",
         "supplier": {
           "name": "{{ $json.ostopaikka }}"
         },
         "invoiceLines": [
           {
             "description": "Kuittista luetut ostokset",
             "unitPrice": "{{ parseFloat($json.summa_yhteensa) }}",
             "quantity": 1,
             "vatPercent": "{{ parseFloat($json.alv_prosentti) }}"
           }
         ],
         "totalAmount": "{{ parseFloat($json.summa_yhteensa) }}",
         "vatAmount": "{{ parseFloat($json.alv_summa) }}"
       }
       ```

4. Lisää **Code -node** (vastauksen muotoilu):
   - Haku: "Code"
   - **Mode:** Run code
   - **Code:**
     ```javascript
     return {
       success: $json.id ? true : false,
       invoiceId: $json.id || null,
       message: $json.id ? 'Lasku lähetetty onnistuneesti Procountoriin' : 'Virhe laskun lähettämisessä'
     };
     ```

5. Lisää **Respond to Webhook -node**:
   - **Response Body:** `{{ $json }}`
   - **Status Code:** `{{ $json.success ? 200 : 400 }}`

6. Yhdistä nodes:
   - Webhook → HTTP Request
   - HTTP Request → Code
   - Code → Respond to Webhook

7. **Tallenna ja ota käyttöön**

8. **Kopioi Webhook URL:**
   - Kopioi **"Webhook URL"** (esim. `https://your-n8n-instance.com/webhook/procountor-submit`)

---

## Frontend Asennus

### Vaihe 1: Konfiguraatio

1. Siirry `frontend` -hakemistoon:
   ```bash
   cd smart-receipt-scanner/frontend
   ```

2. Kopioi `.env.example` → `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. Muokkaa `.env.local` ja syötä n8n Webhook URL:t:
   ```
   REACT_APP_N8N_VISION_URL=https://your-n8n-instance.com/webhook/receipt-analyze
   REACT_APP_N8N_PROCOUNTOR_URL=https://your-n8n-instance.com/webhook/procountor-submit
   ```

### Vaihe 2: Asenna riippuvuudet

```bash
npm install
```

### Vaihe 3: Kehityspalvelin

```bash
npm start
```

Sovellus avautuu osoitteessa: http://localhost:3000

### Vaihe 4: Tuotanto-Build

```bash
npm run build
```

Kääntö tulee `build/` -hakemistoon.

---

## Integraatiot ja API-Avaimet

### Anthropic Claude API

1. Mene osoitteeseen: https://console.anthropic.com/keys

2. Luo uusi API Key

3. n8n:ssä:
   - Klikkaa Claude-nodea
   - **Authentication** → "Create new credential"
   - Syötä API Key
   - Tallenna

### Procountor API

1. Mene osoitteeseen: https://procountor.com/api-avaimet

2. Luo tai kopioi **API Access Token**

3. n8n:ssä:
   - Workflow 2 (Procountor):
     - Avaa "Variables" → "Environment Variables" -sektiota
     - Luo uusi variable: `PROCOUNTOR_ACCESS_TOKEN`
     - Syötä API Access Token

---

## Testaaminen

### Testaa Workflow 1 (Vision Analysis)

1. n8n:ssä, avaa Workflow 1 ("Receipt Vision Analysis")

2. Klikkaa **"Test"** -nappia

3. Valitse kuva kuittista (PNG, JPG, jne.)

4. Klikkaa **"Execute Node"**

5. Tarkista vastaus - pitäisi saada JSON:
   ```json
   {
     "ostopaikka": "K-Market Asematie",
     "paivays": "2025-11-10",
     "summa_yhteensa": 124.50,
     "alv_prosentti": 24,
     "alv_summa": 24.10
   }
   ```

### Testaa kokonainen sovellus

1. Käynnistä React-sovellus: `npm start`

2. Lataa kuitti

3. Klikkaa "Lue Kuitti"

4. Tarkista ja korjaa tiedot

5. Klikkaa "Lähetä Procountoriin"

6. Tarkista, että lasku ilmestyi Procountoriin

---

## Tuotanto-Deployment

### Frontend Deployment (Vercel/Netlify)

#### Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Aseta environment variables Vercel dashboardissa:
- `REACT_APP_N8N_VISION_URL`
- `REACT_APP_N8N_PROCOUNTOR_URL`

#### Netlify

1. Rakenna sovellus: `npm run build`

2. Ota `build/` -kansio verkkoon Netlifyyn

3. Aseta environment variables Netlify-dashboardissa

### n8n Deployment

#### n8n Cloud
- Workflows ovat automaattisesti pilvipalvelussa
- Ei lisätoimia tarvita

#### n8n Self-Hosted
- Vie workflows JSON-tiedostosta (voidaan tehdä n8n:ssä: **Menu → Export**)
- Vie n8n Docker-kontainerissa tuotantopalvelimelle

---

## Vianmääritys

### "Webhook URL not found" -virhe

- Tarkista, että workflow on **käyttöön otettu** (Active-toggle)
- Tarkista, että Webhook-noden **Path** on oikea

### "Claude API error" -virhe

- Tarkista Anthropic API Key
- Varmista, että API Key on voimassa
- Tarkista n8n:n Credentials

### "Procountor API error" -virhe

- Tarkista `PROCOUNTOR_ACCESS_TOKEN`
- Varmista, että API-avain ei ole vanhentunut
- Tarkista JSON-muoto ja pakolliset kentät

### "CORS error" frontendin ja n8n:n välillä

- Tarkista, että n8n:n webhookilla on CORS käytössä
- n8n Cloud -instansseilla CORS on oletusarvoisesti päällä

---

## Huomioitavaa

- ✅ Sovellus on **tuotantovalmis** (production-ready)
- ✅ Käyttää Claude 3.5 Sonnetia parhaalle tarkkuudelle
- ✅ Tukee monipuolisia kuvatiedostomuotoja (PNG, JPG, GIF, WebP)
- ⚠️ Procountorin API-muoto voi vaihdella - testaa ensin!
- ⚠️ Kaikki API-avaimet **TULEE pitää salassa** - käytä environment variables
- 🔐 Frontend lähettää binaaridatan suoraan webhookille - no secrets exposed

---

## Lisätuki

- n8n dokumentaatio: https://docs.n8n.io/
- Anthropic dokumentaatio: https://docs.anthropic.com/
- Procountor API: https://procountor.com/api

---

**Versio:** 1.0
**Päivitetty:** 2025-11-10
**Tekijä:** Full-Stack AI Architect
