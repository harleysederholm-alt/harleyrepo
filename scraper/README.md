# PienHankinta-Vahti Scraper

Python-pohjainen web scraper ja AI-agentti julkisten hankintojen keräämiseen ja analysointiin.

## Ominaisuudet

✅ **Web Scraping**
- Kerää hankintailmoituksia HILMA-sivustolta (Suomen virallinen julkisten hankintojen ilmoituskanava)
- Tuki kuntien omille hankintasivuille
- Automaattinen duplikaattien esto

✅ **AI-analyysi (Groq AI)**
- Tiivistelmän luonti suomeksi
- Toimialan tunnistus automaattisesti
- Riskianalyysi ja huomioitavat asiat
- Tarjoushinnan suositus
- Osuvuuspisteytys % käyttäjäprofiilin perusteella

✅ **Supabase-integraatio**
- Automaattinen tallennus tietokantaan
- Päivitykset ilman duplikaatteja (upsert)
- Tuki käyttäjäprofiileille ja matchingille

## Asennus

### 1. Asenna riippuvuudet

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Konfiguroi ympäristömuuttujat

Kopioi `.env.example` tiedostoksi `.env` ja täytä:

```bash
cp .env.example .env
```

Muokkaa `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
```

### 3. Testaa yksittäiset komponentit

```bash
# Testaa AI-analyysitoiminto
python ai_analyzer.py

# Testaa HILMA-scraper
python hilma_scraper.py

# Testaa tietokantayhteys
python database.py
```

### 4. Aja täydellinen pipeline

```bash
python main.py
```

## Käyttö

### Automaattinen ajastus (cron)

Lisää crontab-merkintä ajamaan scraper automaattisesti:

```bash
# Aja joka tunti
0 * * * * cd /path/to/scraper && python main.py >> scraper.log 2>&1

# Aja 2 kertaa päivässä (klo 9 ja 15)
0 9,15 * * * cd /path/to/scraper && python main.py >> scraper.log 2>&1
```

### Manuaalinen ajo

```bash
# Scrape ja analysoi max 20 hankintaa
python main.py

# Analysoi olemassa olevat hankinnat ilman analyysiä
python -c "from main import ScraperOrchestrator; ScraperOrchestrator().analyze_existing_procurements(50)"
```

## Arkkitehtuuri

```
scraper/
├── config.py           # Konfiguraatio
├── hilma_scraper.py    # HILMA-sivuston scraper
├── ai_analyzer.py      # AI-analyysi (Groq)
├── database.py         # Supabase-integraatio
├── main.py             # Pääohjelma (orchestrator)
├── requirements.txt    # Python-riippuvuudet
└── README.md          # Tämä tiedosto
```

## Pipeline-prosessi

1. **Scraping**: Kerätään hankintailmoitukset HILMA-sivustolta
2. **Tallennus**: Tallennetaan Supabase-tietokantaan (duplikaattien esto external_id:llä)
3. **AI-analyysi**: Analysoidaan jokainen hankinta Groq AI:lla
4. **Päivitys**: Päivitetään analyysi tietokantaan

## Laajennukset

### Lisää uusi scraperi

Luo uusi tiedosto esim. `espoo_scraper.py`:

```python
class EspooScraper:
    def scrape_procurements(self):
        # Scrape logic
        return procurements
```

Lisää `main.py`:

```python
from espoo_scraper import EspooScraper

class ScraperOrchestrator:
    def __init__(self):
        self.espoo_scraper = EspooScraper()
        # ...
```

## Ongelmien ratkaisu

### Scraper ei löydä hankintoja

- Tarkista HILMA:n HTML-rakenne
- Päivitä CSS-selektorit `hilma_scraper.py`:ssä

### AI-analyysi epäonnistuu

- Tarkista GROQ_API_KEY
- Varmista että Groq API on saatavilla
- Tarkista API-käyttörajat

### Tietokantavirheet

- Varmista SUPABASE_SERVICE_ROLE_KEY oikeudet
- Tarkista tietokantaskeema vastaa `types/database.types.ts`

## Kehitysideoita

- [ ] Playwright-tuki dynaamisille sivuille
- [ ] Webhook-ilmoitukset uusista hankinnosta
- [ ] Monisäikeinen scraping
- [ ] Scraping-raportointi ja metriikat
- [ ] PDF-dokumenttien parsinta
- [ ] Kuntakohtaiset scrapers (Vantaa, Espoo, Helsinki, jne.)

## Lisenssi

Proprietary - PienHankinta-Vahti
