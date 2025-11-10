# 🎯 Brändi-äänellä varustettu Tekoälyavustaja - Asennusopas

Täydellinen n8n + Claude + React SaaS -ratkaisu brändin kouluttamiseen ja sisältöjen generointiin.

---

## 📋 Osa 1: N8N Workflows

### Edellytykset
- N8n-instanssi (paikallinen tai pilvi)
- Anthropic Claude API -avain
- N8n versioon vähintään 1.30+

### Konfiguraatio

#### 1. Aseta Anthropic API -avain N8nissa

1. Avaa N8n
2. Mene **Credentials** → **New**
3. Valitse **Anthropic** (tai **OpenAI** jos käytät Claude through OpenAI API)
4. Liitä API-avaimesi
5. Tallenna credentials nimellä `anthropic` tai `openAiApi`

#### 2. Workflow A: Brand Training (Brändin koulutus)

**Polku:** `/workflows/brand-training-workflow.json`

**Konfiguraatio:**
1. Avaa N8n
2. Valitse **Create Workflow**
3. Kopioi JSON-sisältö tiedostosta `brand-training-workflow.json`
4. Päivitä seuraavat:
   - **Credentials**: Aseta Anthropic API -avaimen tunnukseksi oikea credentials-nimi
   - **Webhook path**: Muuta `d6bf33f3-5e99-4a36-9e52-8f3c6e8b2a1d` ainutlaatuiseksi poluksi
   - **Write File node**: Aseta oikea hakemisto tiedostojen tallennukselle (esim. `/data/brand-profiles/`)

**Webhook URL (esimerkki):**
```
http://localhost:5678/webhook/d6bf33f3-5e99-4a36-9e52-8f3c6e8b2a1d
```

**Vastaanotettu payload:**
```json
{
  "brand_examples": [
    "Esimerkkiteksti 1...",
    "Esimerkkiteksti 2...",
    "Esimerkkiteksti 3..."
  ],
  "user_id": "default"
}
```

**Vastaus:**
```json
{
  "status": "Brändiprofiili tallennettu onnistuneesti!",
  "profile": {
    "tone": ["ammattimainen", "luotettava"],
    "formality": 8,
    "sentence_structure": "Vaihteleva, mutta selkeä",
    "key_terminology": ["innovaatio", "asiakas"],
    "negative_keywords": ["halpa", "nopea"],
    ...
  }
}
```

---

#### 3. Workflow B: Content Generation (Sisällön generointi)

**Polku:** `/workflows/content-generation-workflow.json`

**Konfiguraatio:**
1. Avaa N8n
2. Valitse **Create Workflow**
3. Kopioi JSON-sisältö tiedostosta `content-generation-workflow.json`
4. Päivitä seuraavat:
   - **Credentials**: Aseta Anthropic API -avain
   - **Webhook path**: Muuta `a7cg44g4-6f00-5b47-0f63-9g4d7f9c3b2e` ainutlaatuiseksi poluksi
   - **Read File node**: Aseta sama hakemisto kuin Workflow A:ssa

**Webhook URL (esimerkki):**
```
http://localhost:5678/webhook/a7cg44g4-6f00-5b47-0f63-9g4d7f9c3b2e
```

**Vastaanotettu payload:**
```json
{
  "prompt": "Kirjoita LinkedIn-postaus uudesta tuotteesta",
  "user_id": "default",
  "brand_profile": {
    "tone": ["ammattimainen"],
    ...
  }
}
```

**Vastaus:**
```json
{
  "status": "success",
  "generated_content": "Generoitu teksti tähän..."
}
```

---

## 🎨 Osa 2: React Frontend

### Polku
`/app/brand-voice-ai/page.tsx`

### Käyttöönotto

#### 1. Aseta Environment Variables

Tiedostoon `.env.local` lisää:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

**Tuotantoympäristössä:**
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

#### 2. Varmista TailwindCSS

Projekti käyttää jo TailwindCSS:ää, joten tyylitys toimii automaattisesti.

#### 3. Käynnistä sovellus

```bash
npm run dev
```

Avaa: `http://localhost:3000/brand-voice-ai`

---

### Frontend-komponenttien kuvaus

#### 🎓 **Kouluta Brändi** -välilehti

```
┌─────────────────────────────────────┐
│  Esimerkkitekstit                   │
│  ┌────────────────────────────────┐ │
│  │ [Liitä tekstejä, erota ---]    │ │
│  │                                │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│  [🚀 Tallenna Brändiprofiili]       │
│                                     │
│  📊 Tallennettu Brändiprofiili     │
│  ├─ Sävy: ammattimainen, luotettava│
│  ├─ Muodollisuus: 8/10             │
│  └─ ...                            │
└─────────────────────────────────────┘
```

**Toiminto:**
1. Käyttäjä liittää 5-10 esimerkkiä yrityksen teksteistä
2. Klikkaa "Tallenna Brändiprofiili"
3. Frontend tekee POST-kutsun Workflow A:lle
4. Claude analysoi tekstit ja luo JSON-profiilin
5. Profiili näytetään ruudulla ja tallennetaan

---

#### ✨ **Generoi Sisältö** -välilehti

```
┌─────────────────────────────────────┐
│  Mitä haluat kirjoittaa?            │
│  ┌────────────────────────────────┐ │
│  │ [Input: pyyntö]                │ │
│  └────────────────────────────────┘ │
│  [✨ Generoi Sisältö]               │
│                                     │
│  Generoitu sisältö                  │
│  ┌────────────────────────────────┐ │
│  │ [Textarea: generoitu teksti]   │ │
│  │                  [Kopioi]      │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Toiminto:**
1. Käyttäjä kirjoittaa pyynnön (esim. "LinkedIn-postaus")
2. Klikkaa "Generoi Sisältö"
3. Frontend tekee POST-kutsun Workflow B:lle, lähettäen myös brändiprofiilia
4. Claude generoi sisältöä käyttäen brändiprofiilia
5. Sisältö näytetään textarea-kenttään
6. Käyttäjä voi kopioida sen leikepöydälle

---

## 🔗 Osa 3: Integraation Toiminta

### Tiedonkulku

```
┌─────────────┐          ┌──────────────┐          ┌──────────────┐
│   Frontend  │          │     N8N      │          │   Anthropic  │
│   (React)   │          │  Workflows   │          │    Claude    │
└─────────────┘          └──────────────┘          └──────────────┘
      │                        │                         │
      │  1. POST /webhook/A    │                         │
      │─ brand_examples ──────►│                         │
      │                        │  2. POST /messages      │
      │                        │─ system+user prompt ──►│
      │                        │                         │
      │                        │◄─ JSON profile ────────│
      │                        │  3. POST /webhook/A    │
      │◄─ profile JSON ────────│                         │
      │                        │                         │
      │  4. POST /webhook/B    │                         │
      │─ prompt + profile ────►│                         │
      │                        │  5. POST /messages      │
      │                        │─ system+prompt+profile┤
      │                        │                        │
      │                        │◄─ generated content ──│
      │◄─ content text ────────│                         │
      │  6. Näytä ruudulla     │                         │
      │                        │                         │
```

### Näyte-skenaariot

#### Skenario 1: Tekoäly oppii Suomalaisen SaaS-yrityksen äänestä

**Input (Workflow A):**
```
Esimerkkiteksti 1: "Hei! Olemme juuri julkaisseet uuden feature. Tämä on game-changer sekä pienille että suurille yrityksille."

Esimerkkiteksti 2: "Asiakkaistamme 98% sanoo, että tuotteemme paransivat heidän tuottavuuttaan. Se motivoi meitä joka päivä!"

Esimerkkiteksti 3: "Tilaa nyt ja saa 30 päivän ilmainen kokeilu. Ei luottokorttia tarvitaan. Olemme täällä auttamassa sinua menestymään."
```

**Output (Claude):**
```json
{
  "tone": ["ystävällinen", "kannustava", "asiakaslähtöinen"],
  "formality": 5,
  "sentence_structure": "Lyhyet, ytimekkäät lauseet. Suosii eksklamaatiopisteitä.",
  "key_terminology": ["game-changer", "tuottavuus", "menestyminen", "asiakas"],
  "negative_keywords": ["tekniikka-puhe", "muodollinen legalese"],
  "vocabulary_level": "arkinen, helppo",
  "emotional_appeal": "innostus, luottamus, kannustus",
  "writing_style": "suora, ihmisläheinen, energinen"
}
```

---

#### Skenario 2: Generointi käyttää profiilia

**Input (Workflow B):**
```
prompt: "Kirjoita Twitter-postaus, jossa kerrot, että meillä on nyt integraatio Slackin kanssa"
```

**Output (Claude):**
```
🚀 Game-changer on täällä! Slack-integraatiomme tekee yhteistyöstä entistäkin saumatonta.
Liity tuhansien yritysten joukkoon, jotka jo säästävät aikaa päivittäin. Kokeile ilmaiseksi! 🎉
```

(Huomaa: teksti käyttää ääneksä "game-changer", eksklamaatiopisteitä, ystävällistä sävyä ja kutsuu toimintaan)

---

## 🔐 Turvallisuus

### Tuotantoympäristöön

1. **Webhook-polut:** Käytä pitkiä, satunnaisia tunnuksia (esim. `uuid4`)
2. **API-avaimet:** Tallenna `.env`-tiedostoihin, älä koodiin
3. **Rate limiting:** Lisää n8n:iin
4. **Validointi:** Validoi input-data sekä Frontendissa että N8n:issa
5. **CORS:** Aseta sopivat CORS-asetukset

### Environment Variables

```env
# .env.local (development)
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook

# .env.production
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.yourcompany.com/webhook
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Vain backend:issa
```

---

## 🚀 Käynnistys (Quick Start)

### 1. Asenna dependencies
```bash
npm install
```

### 2. Aseta N8n-workflowt
- Kopioi `workflows/brand-training-workflow.json` N8n:iin
- Kopioi `workflows/content-generation-workflow.json` N8n:iin
- Aseta Anthropic API -avain molempiin
- Tarkista webhook-polut

### 3. Konfiguroi Frontend
```bash
echo "NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook" > .env.local
```

### 4. Käynnistä
```bash
npm run dev
```

### 5. Testaa
- Avaa `http://localhost:3000/brand-voice-ai`
- Kouluta brändi esimerkkeillä
- Generoi sisältöä

---

## 🐛 Vianetsintä

### "API Error 404"
- ✅ Tarkista webhook-polut N8n:issa
- ✅ Varmista että workflow on aktiivinen (päällä)
- ✅ Tarkista `NEXT_PUBLIC_N8N_WEBHOOK_URL` arvo

### "Claude ei vastaa"
- ✅ Tarkista Anthropic API -avain
- ✅ Tarkista API-yksikköjen käyttö
- ✅ Tarkista n8n-lokit

### "Profiili on tyhjä"
- ✅ Varmista että esimerkkitekstit ovat riittävän pitkiä (vähintään 100 merkkiä per teksti)
- ✅ Tarkista Claude:n vastauksen muoto

---

## 📊 Laajennukset

### Mahdollisia parannus-ideoita

1. **Käyttäjä-hallinta:** Tallenna brändiprofiilit Supabase:en
2. **Versiointi:** Salli useiden brändiprofiilien hallintaa
3. **Template-kirjasto:** Esimääritelyt mallit ("LinkedIn-postaus", "Email", jne.)
4. **Analyytics:** Seuraa generoitujen tekstien käyttöä
5. **A/B Testing:** Vertaa eri brändiprofiilin vaikutuksia
6. **Integraatiot:** Suora julkaisu Twitteriin, LinkedIniin jne.

---

## 📝 Huomautuksia

- **Brändiprofiili tallennetaan** tiedostojärjestelmälle (N8n) tai vaihtoehtoisesti tietokantaan
- **Claude:n vastauksen muoto** riippuu systeemi-promptista
- **Kustannukset:** Anthropic API laskuttaa per token. Estimoi 2-5 senttiä per brand training + 0.5-1 sentti per content generation

---

**Onneksi olkoon! 🎉 Sinulla on nyt täydellinen brändi-äänellä varustettu tekoälyavustaja!**
