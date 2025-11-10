# N8n Kilpailija-analyysi-Agentti - Asennusohje

## Yleiskatsaus

Tämä n8n-työnkulku automatisoi kilpailijoiden verkkosivujen seuraamisen ja analysoinnin. Työnkulku:

1. **Ajetaan automaattisesti viikoittain** (maanantaiaamuisin)
2. **Skreippaa kilpailijoiden verkkosivuja** (artikkelit, uutiset, blogipostaukset)
3. **Vertaa uusia sisältöjä edelliseen viikkoon** (havaitsee uudet artikkelit)
4. **Käyttää Claude AI:ta** kirjoittamaan suomenkielisen yhteenvedon
5. **Lähettää raportin sähköpostilla** johdolle

## Asennus

### 1. Credentials -konfiguraation valmistelu

Sinun tulee luoda seuraavat N8n credentials ennen työnkulun tuomista:

#### A. Anthropic API Credentials (`anthropic_api`)
- **Tyyppi**: Anthropic
- **API Key**: Hanki osoitteesta https://console.anthropic.com/
- **Nimi N8n:ssä**: `anthropic_api`

#### B. SMTP Credentials (`smtp_credentials`)
- **Tyyppi**: SMTP
- **Serverin osoite**: Esim. `smtp.gmail.com`, `smtp.office365.com` tai yrityksen SMTP-palvelin
- **Portti**: 587 (TLS) tai 465 (SSL)
- **Käyttäjänimi**: Sähköpostiosoitteesi
- **Salasana**: Salasana tai sovelluskohtainen salasana
- **Nimi N8n:ssä**: `smtp_credentials`

### 2. Työnkulun tuominen N8n:ään

1. Avaa N8n-instanssisi
2. Klikkaa **"+ New Workflow"** tai **"Import"**
3. Valitse **"Import from file"**
4. Lataa tämä `competitor-analysis-workflow.json` -tiedosto
5. Klikkaa **"Import"**

### 3. Kilpailijoiden määrittely

Työnkulun **"Määritelmät"** -node (Code node) sisältää kilpailijoiden listan:

```javascript
const competitors = [
  {
    name: "Kilpailija A",
    url: "https://kilpailija-a.fi/blogi"
  },
  {
    name: "Kilpailija B",
    url: "https://kilpailija-b.fi/uutiset"
  }
];
```

**Muokkaa tätä** lisätäksesi tai poistaaksesi kilpailijoita. Esimerkki:

```javascript
const competitors = [
  {
    name: "Acme Corp",
    url: "https://acmecorp.com/news"
  },
  {
    name: "TechGiant Inc",
    url: "https://techgiant.com/blog"
  },
  {
    name: "StartupXYZ",
    url: "https://startupxyz.io/updates"
  }
];
```

### 4. Sähköpostiosoitteen päivittäminen

Työnkulun **"Lähetä sähköposti"** -node:
- Muuta **`toEmail`**: `johtaja@company.fi` → Vastaanottajan todellinen sähköpostiosoite
- Muuta **`fromEmail`**: `noreply@company.fi` → Lähettäjän sähköpostiosoite (tulee vastata SMTP-tunnuksille)

### 5. HTML:n extraktiosäännöt säätäminen

**"HTML Extract"** -node käyttää XPath-polkuja sivun sisällön poimintaan:

```
Oletusarvoisesti:
- title: //h2/text() | //h3/text() | //article/a/text()
- link: //article/a/@href | //h2/../@href
```

Jos kilpailijoidesi sivuilla on eri HTML-rakenne, sinun tulee säätää näitä XPath-polkuja:

**Esimerkkejä eri sivutyypeille:**
- **WordPress-blogi**: `//article//h2/a/@href`
- **Medium-tyyppinen**: `//a[@data-action="show-post"]/@href`
- **Generinen uutissivusto**: `//div[@class="news-item"]//h3/text()`

Käyttä selaimen DevTools:ia (F12) tutkiaksesi HTML-rakennetta ja muokkaa XPath-polkuja tarpeen mukaan.

### 6. Data-kansion luominen

Työnkulku tallentaa edellisten viikkojen tiedot `./data/` -kansioon n8n:n Static Data -kansion sisälle.

**Varmista, että kansio on olemassa n8n-instanssissa:**
- N8n-kansio: `~/.n8n/` (tai konfiguraasi mukaan)
- Static Data -kansio: `~/.n8n/static/data/` (luodaan automaattisesti)

Tai määritä kirjoituspolku työnkulussa **"Tallenna uusi data"** -node:ssa.

### 7. Testaaminen

Ennen viikoittaisen ajoituksen ottamista käyttöön:

1. Avaa työnkulku N8n:ssä
2. Klikkaa **"Execute workflow"** manuaalista testia varten
3. Tarkista, että:
   - HTTP-pyynnöt onnistuvat
   - HTML-ekstraktio saa sisältöä
   - Claude API vastaa
   - Sähköposti lähetetään

Katso **Execution** -paneeli virheiden varalta.

## Työnkulun rakenne (yksityiskohtaisesti)

| Vaihe | Node-tyyppi | Tehtävä |
|-------|-----------|--------|
| 1 | **Schedule** | Käynnistyy viikoittain (cron) |
| 2 | **Code** (Määritelmät) | Määrittelee kilpailijoiden lista |
| 3 | **Split in Batches** | Käsittelee kilpailijat yksi kerrallaan |
| 4 | **HTTP Request** | Lähettää HTTP GET -pyynnön kilpailijan URL:iin |
| 5 | **HTML Extract** | Poimii XPath:ia käyttäen artikkelien otsikot ja linkit |
| 6 | **Read File** | Lukee edellisen viikon tallennetun datan (error handling käytössä) |
| 7 | **Code** (Vertaa) | Vertailee uutta dataa vanhaan, tunnistaa uudet itemit |
| 8 | **Write File** | Tallentaa uuden datan seuraavaa viikkoa varten |
| 9 | **If Control** | Loop-kontrolli seuraavaa kilpailijaa varten |
| 10 | **Merge** | Yhdistää kaikkien kilpailijoiden tulokset |
| 11 | **Anthropic (Claude)** | Kirjoittaa suomenkielisen raportin |
| 12 | **Email Send** | Lähettää raportin sähköpostilla |

## Troubleshooting

### Ongelma: "Credentials not found"
**Ratkaisu**: Tarkista, että olet luonut `anthropic_api` ja `smtp_credentials` N8n:ssä kohdassa "Credentials".

### Ongelma: "No items extracted"
**Ratkaisu**: Kilpailijan HTML-rakenne poikkeaa odotetusta. Päivitä **"HTML Extract"** -node:n XPath-polut selaimen DevTools:ia käyttäen.

### Ongelma: "SMTP Authentication failed"
**Ratkaisu**:
- Tarkista SMTP-salasana (joissakin palveluissa vaaditaan sovelluskohtainen salasana)
- Varmista, että portti on oikea (587 TLS tai 465 SSL)
- Tarkista firewall-säännöt

### Ongelma: Työnkulku epäonnistuu satunnaisesti
**Ratkaisu**: Lisää viive HTTP-pyyntöjen välille **"Split in Batches"** -node:n jälkeen, jotta palvelimen kuormitus vähenee.

## Tietosuoja ja turvallisuus

- **Tallennetut tiedot**: Kilpailijoiden sivujen snapshot:it tallennetaan N8n:n `static/data/` -kansioon paikallisesti.
- **API-avaimet**: Tallenna API-avaimet N8n:n credentials-järjestelmään, ei koodiin.
- **Sähköposti**: Varmista, että sähköpostiosoitteet ovat oikeat (johtaja voi saada herkkiä tietoja).

## Lisäominaisuuksien ideoita

1. **Slack-integraatio**: Lähetä raportti myös Slack:iin `Slack`-node:n avulla
2. **Google Sheets -integraatio**: Tallenna tulokset taulukkoon `Google Sheets`-node:n avulla
3. **Webhook**: Luo webhook seuraavalle tasolle prosessoitavaksi
4. **Lähettäjien poraus**: Lähettää eri raportit eri osastoille `IF`-node:n avulla

## Yhteenveto

Tämä työnkulku tarjoaa täysin automatisoitua kilpailijaseurantaa ilman manuaalista työtä. Kun kerran se on asetettu, se suorittaa:
- Sivujen skreippauksen
- Datan vertailun
- AI-pohjaisen analyysin
- Sähköpostiraportit

...joka viikko automaattisesti!

---

**Kehitetty**: Kilpailija-analyysi-Agentti
**Versio**: 1.0
**Vaatimukset**: N8n ≥ 1.0, Anthropic API -avain, SMTP-palvelimen pääsy
