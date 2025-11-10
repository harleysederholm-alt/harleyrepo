# 🚀 Toimipaikka-analysaattori - Setup Ohjeet

Tämä on täydellinen, tuotantovalmis SaaS-sovellus sijaintien analysointiin.

## 📋 Vaihe 1: Riippuvuuksien Asennus

```bash
npm install
```

Tai jos käytät yarnia:
```bash
yarn install
```

## 🔑 Vaihe 2: Supabase Setup

### 2.1 Luo Supabase-projekti
1. Mene https://supabase.com/dashboard
2. Klikkaa "New project"
3. Anna projektille nimi (esim. "toimipaikka-analysaattori")
4. Aseta salasana ja valitse region
5. Odota projektin alustamista

### 2.2 Kopioi API-avaimet
1. Mene **Project Settings** → **API**
2. Kopioi `Project URL` (esim. `https://xxxxxx.supabase.co`)
3. Kopioi `anon public` key (eli `ANON_KEY`)
4. Lisää ne `.env.local`-tiedostoon

### 2.3 Suorita tietokannan skeema
1. Avaa Supabase Dashboard → **SQL Editor**
2. Klikkaa "New Query"
3. Kopioi ja liitä sisältö tiedostosta `supabase-schema.sql`
4. Klikkaa "RUN"

## 🗺️ Vaihe 3: Mapbox Setup

1. Mene https://www.mapbox.com/
2. Rekisteröidy tai kirjaudu
3. Avaa "Access tokens" -sivu
4. Kopioi `Default public token`
5. Lisää se `.env.local`-tiedostoon: `NEXT_PUBLIC_MAPBOX_TOKEN=pk_...`

## 🎨 Vaihe 4: Ympäristömuuttujat

Kopioi `.env.local.example` → `.env.local`:
```bash
cp .env.local.example .env.local
```

Täytä `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
NEXT_PUBLIC_MAPBOX_TOKEN=pk_your-token-here
```

## 🏃 Vaihe 5: Paikallinen ajaminen

```bash
npm run dev
```

Avaa http://localhost:3000

## 📝 Vaihe 6: Testi

1. Siirry http://localhost:3000
2. Klikkaa "Rekisteröidy"
3. Luo tili
4. Klikkaa kartalla
5. Valitse liiketoiminnan tyyppi
6. Klikkaa "📊 Analysoi sijainti"

## 🚨 Vianmääritys

| Ongelma | Ratkaisu |
|---------|----------|
| "Supabase connection failed" | Tarkista `.env.local` URL ja ANON_KEY |
| "Mapbox token invalid" | Varmista token on oikein ja aktiivinen |
| "RLS policy denied" | Suorita SQL-koodi uudelleen Supabase SQL-editorissa |
| "Auth callback fails" | Tarkista Supabase Auth → URL Configuration |
| "Kartta ei näy" | Varmista `NEXT_PUBLIC_MAPBOX_TOKEN` on asetettu |

## 🌐 Production Deployment (Vercel)

```bash
# 1. Puskaa koodi GitHub:iin
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/toimipaikka-analysaattori.git
git push -u origin main

# 2. Vercel deployment
# - Mene https://vercel.com/dashboard
# - Klikkaa "Add new... → Project"
# - Valitse GitHub-repo
# - Lisää Environment Variables (NEXT_PUBLIC_*:t)
# - Klikkaa "Deploy"
```

## 📚 Tiedostorakenne

```
toimipaikka-analysaattori/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── login/page.tsx           # Login-sivu
│   │   ├── signup/page.tsx          # Signup-sivu
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Dashboard layout
│   │   │   └── dashboard/
│   │   │       ├── page.tsx         # Main dashboard
│   │   │       ├── projects/page.tsx
│   │   │       └── history/page.tsx
│   │   └── api/
│   │       └── analyze/route.ts     # Analysis API
│   ├── components/
│   │   ├── Map.tsx                  # Mapbox-komponentti
│   │   ├── AnalysisPanel.tsx        # Tulosnaatto
│   │   └── DashboardNav.tsx         # Navigaatio
│   └── lib/
│       ├── supabaseClient.ts        # Client-side Supabase
│       ├── supabaseServer.ts        # Server-side Supabase
│       ├── dataMocks.ts             # Mock-data generaattori
│       └── aiAnalyzer.ts            # Analyysimoottori
├── supabase-schema.sql              # Tietokannan skeema
├── .env.local.example               # Ympäristömuuttujien malli
└── package.json
```

---

Onneksi olkoon! Sinulla on nyt täydellinen SaaS-sovellus! 🎉

**Seuraavat askeleet:**
- 🎨 Customoi värit ja logo
- 📈 Lisää premium-ominaisuuksia
- 🤖 Integroi oikeat data-API:t
- 📊 Lisää raportti-export
- 💳 Lisää Stripe-integraatio

