# Supabase Migration Guide - PienHankinta-Vahti

## 🎯 Aja tämä migraatio ENNEN kuin käytät Stripe-ominaisuuksia

## 1. Avaa Supabase SQL Editor

**Linkki:** https://supabase.com/dashboard/project/evpgnjvrvfqbtjxojtit/sql/new

TAI

1. Mene: https://supabase.com
2. Valitse projekti: **evpgnjvrvfqbtjxojtit**
3. Vasemmalta valikosta: **SQL Editor**
4. Klikkaa: **New query**

## 2. Kopioi SQL-migraatio

Avaa tiedosto: `supabase/migrations/002_add_stripe_and_freemium.sql`

TAI kopioi suoraan alta:

```sql
-- Tämä migraatio lisää:
-- 1. Stripe-kentät profiles-tauluun
-- 2. saved_hankinnat-taulun (suosikit)
-- 3. email_preferences-taulun (ilmoitukset)
-- 4. RLS-säännöt kaikille uusille tauluille
```

## 3. Liitä ja aja migraatio

1. **Liitä** SQL-koodi SQL Editoriin
2. Klikkaa **RUN** (tai Ctrl + Enter)
3. Odota että näet: ✅ **Success. No rows returned**

## 4. Varmista että taulut luotiin

### Tarkista Supabase Table Editorista:

**Linkki:** https://supabase.com/dashboard/project/evpgnjvrvfqbtjxojtit/editor

Sinun pitäisi nähdä:

#### profiles-taulu (päivitetty):
- ✅ `stripe_customer_id` (TEXT)
- ✅ `stripe_subscription_id` (TEXT)
- ✅ `plan` (TEXT, default: 'free')
- ✅ `subscription_status` (TEXT)
- ✅ `plan_expires_at` (TIMESTAMP)
- ✅ `email` (TEXT)

#### saved_hankinnat-taulu (uusi):
- ✅ `id` (BIGINT)
- ✅ `user_id` (UUID)
- ✅ `hankinta_id` (BIGINT)
- ✅ `saved_at` (TIMESTAMP)
- ✅ `notes` (TEXT)

#### email_preferences-taulu (uusi):
- ✅ `user_id` (UUID)
- ✅ `enabled` (BOOLEAN)
- ✅ `frequency` (TEXT)
- ✅ `min_match_score` (INTEGER)
- ✅ `last_sent_at` (TIMESTAMP)

## 5. Testaa RLS-säännöt

### Mene: Authentication → Users

1. Luo testikäyttäjä (tai käytä olemassa olevaa)
2. Kirjaudu sovellukseen
3. Tarkista että käyttäjän `plan` on `free`

### Testaa SQL-kyselyllä:

```sql
-- Hae kaikki käyttäjät ja heidän planinsa
SELECT id, email, plan, subscription_status, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
```

**Odotettu tulos:**
- Vanhoilla käyttäjillä: `plan = 'free'`
- `subscription_status = NULL`

## 6. Päivitä olemassa olevat käyttäjät

Jos sinulla on jo käyttäjiä joilla ei ole `plan`-kenttää:

```sql
-- Aseta kaikille olemassa oleville käyttäjille 'free' plan
UPDATE profiles
SET plan = 'free'
WHERE plan IS NULL;
```

## ⚠️ Tärkeää!

### ENNEN tuotantoon menoa:

1. **Poista testidatat** `hankinnat`-taulusta:
```sql
DELETE FROM hankinnat
WHERE linkki_lahteeseen LIKE '%test-%';
```

2. **Tarkista RLS toimii:**
```sql
-- Testaa että käyttäjät näkevät vain omat saved_hankinnat
SELECT * FROM saved_hankinnat WHERE user_id = 'joku-user-id';
```

3. **Varmista triggerit toimivat:**
```sql
-- Luo uusi käyttäjä ja tarkista että email_preferences luodaan automaattisesti
```

## 🐛 Ongelmanratkaisu

### Virhe: "relation already exists"
- **Syy:** Migraatio on jo ajettu
- **Ratkaisu:** Ei tarvitse tehdä mitään TAI dropata taulut ja ajaa uudelleen

### Virhe: "permission denied"
- **Syy:** Käytät väärää Supabase-roolia
- **Ratkaisu:** Varmista että olet kirjautunut oikeaan projektiin

### Virhe: "column already exists"
- **Syy:** Sarake on jo lisätty
- **Ratkaisu:** Jatka seuraavaan SQL-lauseeseen

## ✅ Valmis!

Kun migraatio on ajettu onnistuneesti:
- ✅ Stripe-integraatio toimii
- ✅ Freemium-logiikka toimii
- ✅ Saved hankinnat -toiminto on valmis (tarvitsee vain frontendin)
- ✅ Email-ilmoitukset on valmis (tarvitsee vain email-servicen)

---

**HUOM:** Migraatiota EI tarvitse ajaa uudelleen. Aja vain kerran per Supabase-projekti.
