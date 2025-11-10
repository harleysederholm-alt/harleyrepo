# 🛍️ Moderni Kauppa - Moderni Verkkokauppa

Tervetuloa **Moderni Kauppaan** – moderniin ja tyylikkääseen verkkokauppasivustoon, joka on rakennettu Next.js 14:llä, Tailwind CSS:llä ja Snipcartin maksupalvelulla.

## 📋 Sisällysluettelo

- [Ominaisuudet](#ominaisuudet)
- [Tekniikka](#tekniikka)
- [Pika-aloitus](#pika-aloitus)
- [Konfiguraatio](#konfiguraatio)
- [Tuotteiden hallinta](#tuotteiden-hallinta)
- [Deployment](#deployment)
- [Tuki](#tuki)

## ✨ Ominaisuudet

✅ **Moderni design** - Siisti ja ammattimainen ulkoasu Tailwind CSS:llä
✅ **Tuotegalleria** - Responsiivinen ruudukko, joka näyttää tuotteet siististi
✅ **Ostoskori** - Snipcart hoitaa ostoskorin hallinnan täysin
✅ **Turvallinen maksaminen** - Snipcartin integroitu maksupalvelu
✅ **Suomenkielinen** - Kaikki käyttöliittymän tekstit suomeksi
✅ **TypeScript** - Täydellinen tyypitys koko sovellukselle
✅ **Nopea** - Optimoitu Next.js 14 App Router:lla

## 🛠️ Tekniikka

```
Frontend:      Next.js 14 (App Router) + TypeScript
Styling:       Tailwind CSS
E-commerce:    Snipcart (ostoskori & kassa)
Tuotedata:     JSON-tiedosto (lib/products.json)
```

## 🚀 Pika-aloitus

### 1. Projektin alustus

Projekti on valmiiksi alustettu Next.js:llä. Asenna riippuvuudet:

```bash
npm install
```

### 2. Kehityspalvelin käyntiin

```bash
npm run dev
```

Avaa selain osoitteeseen:
```
http://localhost:3000
```

Sinun pitäisi nähdä **Moderni Kauppa** -sivusto tuotegallerian kanssa.

### 3. Rakentaminen tuotantoon

```bash
npm run build
npm start
```

## ⚙️ Konfiguraatio

### KRIITTINEN: Snipcart API-avain

**Ennen kuin maksut toimivat**, sinun TÄYTYY:

1. **Luo tili** Snipcart.com-sivustolla (se on ilmainen):
   - Mene osoitteeseen: https://app.snipcart.com/register
   - Rekisteröidy sähköpostilla

2. **Hanki API-avain**:
   - Kirjaudu Snipcart-hallintapaneeliin
   - Mene → **Account** → **API Keys**
   - Kopioi **Public API Key** (vaikuttaa kuten `eyJhbGciOiJIUzI1NiIsInR5...`)

3. **Korvaa paikkamerkki**:
   - Avaa `app/layout.tsx`
   - Etsi rivi: `data-api-key="YOUR_SNIPCART_API_KEY"`
   - Korvaa `YOUR_SNIPCART_API_KEY` omalla API-avaimellasi

**Esimerkki:**
```tsx
<div
  id="snipcart"
  data-api-key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  hidden
/>
```

## 📦 Tuotteiden hallinta

### Tuotteiden muokkaus

Kaikki tuotteet sijaitsevat tiedostossa:
```
lib/products.json
```

### Tuotteen rakenne

Jokainen tuote on objekti, jossa seuraavat kentät:

```json
{
  "id": "1",
  "name": "Tuotteen nimi",
  "description": "Tuotteen kuvaus",
  "price": 29.99,
  "image": "https://kuva-url.com/tuote.jpg",
  "category": "Elektroniikka"
}
```

**Kentät selitettynä:**

| Kenttä | Kuvaus | Esimerkki |
|--------|--------|----------|
| `id` | Tuotteen uniikki tunniste | `"1"` |
| `name` | Tuotteen nimi | `"Langaton Kaiutin"` |
| `description` | Lyhyt kuvaus | `"Kannettava kaiutin 12h akulla"` |
| `price` | Hinta euroissa | `49.99` |
| `image` | Kuvan URL-osoite | `"https://...jpg"` |
| `category` | Kategoria | `"Elektroniikka"` |

### Uuden tuotteen lisääminen

1. Avaa `lib/products.json`
2. Lisää uusi objekti taulukkoon:

```json
{
  "id": "5",
  "name": "Langaton Hiiri",
  "description": "Ergonominen langaton hiiri, 2.4GHz",
  "price": 34.99,
  "image": "https://images.unsplash.com/photo-...",
  "category": "Tietokoneet"
}
```

3. Tallenna tiedosto
4. Kehityspalvelin päivittää automaattisesti sivua (hot reload)

## 📁 Projektin rakenne

```
harleyrepo/
├── app/
│   ├── layout.tsx          ← ROOT LAYOUT (Snipcart integraatio)
│   ├── page.tsx            ← ETUSIVU (Tuotegalleria)
│   ├── globals.css         ← Globaali CSS
│   └── ...
├── components/
│   └── ProductCard.tsx     ← TUOTEKORTTI (Snipcart data-item-attribuutit)
├── lib/
│   └── products.json       ← TUOTEDATA (Muokkaa tämä!)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── ...
```

## 🔧 Tuotteet: Tekninen Yksityiskohta

Tuotekortissa käytetään Snipcartin vaatimia `data-item-` attribuutteja:

```tsx
<button
  data-item-id={product.id}           // Tuotteen ID
  data-item-name={product.name}       // Tuotteen nimi
  data-item-price={product.price}     // Hinta
  data-item-url="/"                   // URL sivulle
  data-item-image={product.image}     // Kuvan URL
>
  Lisää koriin
</button>
```

Nämä attribuutit kerrotaan Snipcartin JS-kirjastolle, joka hallitsee ostoskoria.

## 🌐 Deployment

### Vercel (Suositeltu)

Vercel on Next.js:n luoja ja tukee sitä hyvin.

```bash
npm install -g vercel
vercel
```

### Docker

Jos käytät Dockeria:

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📸 Näyttökuvia

### Etusivu
- Hero-osio tervetuloviestillä
- Tuotegalleria 1-4 sarakkeen ruudukolla (responsiivinen)
- Edut-osio (Nopea toimitus, Turvallinen maksaminen, Palautusoikeus)

### Tuotekortti
- Tuotteen kuva (näyttää 100% leveyden)
- Kategoria (badge)
- Nimi ja kuvaus
- Hinta ja "Lisää koriin" -painike

### Ostoskori
- Avautuu vasemmalta Snipcart-paneelistaan painamalla 🛒 Ostoskori -painiketta
- Näyttää kaikki lisätyt tuotteet
- Laskee yhteissumman
- Linkki kassalle

## 🤝 Tuki & Lisäapu

### Ongelmat Snipcartin kanssa?

1. **Ostoskori ei näy** → Tarkista API-avain `app/layout.tsx`:ssa
2. **Maksaminen ei toimi** → Varmista, että olet rekisteröitynyt Snipcart.com:ssa
3. **Tuotteet eivät näy** → Tarkista `lib/products.json` syntaksi (JSON-validaattori)

### Muita resursseja

- 📖 [Next.js dokumentaatio](https://nextjs.org/docs)
- 🎨 [Tailwind CSS dokumentaatio](https://tailwindcss.com/docs)
- 🛒 [Snipcart dokumentaatio](https://docs.snipcart.com)

## 📝 Lisensointi

Tämä projekti on avoimen lähdekoodin ja vapaa muokattavaksi.

---

**Tehty ❤️ suomalaisille pienyrittäjille ja verkkokauppiaaille**

Onnittelut! Sinulla on nyt täysin toimiva moderni verkkokauppa! 🎉
