# Supabase Setup Guide - Alert Rules Table

Tämä opas auttaa luomaan `alert_rules` taulun Supabasessa.

---

## Vaihtoehto 1: Kopioi ja liitä Supabase SQL Editoriin (HELPOIN)

### Vaihe 1: Avaa Supabase SQL Editor
1. Mene osoitteeseen: https://supabase.com/dashboard
2. Valitse projektisi
3. Vasemmasta valikosta: **SQL Editor**
4. Klikkaa **+ New query**

### Vaihe 2: Kopioi ja aja tämä SQL

```sql
-- VAIHE 1: Luo taulu
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  notification_method TEXT NOT NULL CHECK (notification_method IN ('email', 'in_app', 'both')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VAIHE 2: Lisää indeksit
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled) WHERE enabled = true;

-- VAIHE 3: Aktivoi Row Level Security
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- VAIHE 4: Luo policies
CREATE POLICY "Users can view own alert rules"
  ON alert_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alert rules"
  ON alert_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert rules"
  ON alert_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert rules"
  ON alert_rules FOR DELETE
  USING (auth.uid() = user_id);

-- VAIHE 5: Luo funktio updated_at päivitykselle
CREATE OR REPLACE FUNCTION update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- VAIHE 6: Luo trigger
CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_rules_updated_at();
```

### Vaihe 3: Suorita
1. Klikkaa **RUN** tai paina `Ctrl+Enter`
2. Odota että näet "Success. No rows returned"
3. Valmis! ✅

---

## Vaihtoehto 2: Vaiheittainen luonti (jos edellinen epäonnistuu)

Jos saat virheilmoituksen, aja komennot yksi kerrallaan:

### Komento 1: Luo taulu
```sql
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  notification_method TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
Klikkaa RUN → Odota "Success"

### Komento 2: Lisää indeksit
```sql
CREATE INDEX idx_alert_rules_user_id ON alert_rules(user_id);
```
Klikkaa RUN → Odota "Success"

### Komento 3: Aktivoi RLS
```sql
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
```
Klikkaa RUN → Odota "Success"

### Komento 4: Luo SELECT policy
```sql
CREATE POLICY "Users can view own alert rules"
  ON alert_rules FOR SELECT
  USING (auth.uid() = user_id);
```
Klikkaa RUN → Odota "Success"

### Komento 5: Luo INSERT policy
```sql
CREATE POLICY "Users can create own alert rules"
  ON alert_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```
Klikkaa RUN → Odota "Success"

### Komento 6: Luo UPDATE policy
```sql
CREATE POLICY "Users can update own alert rules"
  ON alert_rules FOR UPDATE
  USING (auth.uid() = user_id);
```
Klikkaa RUN → Odota "Success"

### Komento 7: Luo DELETE policy
```sql
CREATE POLICY "Users can delete own alert rules"
  ON alert_rules FOR DELETE
  USING (auth.uid() = user_id);
```
Klikkaa RUN → Odota "Success"

---

## Tarkista että taulu on luotu

Aja tämä SQL:
```sql
SELECT * FROM alert_rules LIMIT 5;
```

Pitäisi näyttää:
```
No rows returned
```

Tai jos käyttäjillä on jo hälytyksiä, näet ne tässä.

---

## Testaa taulun toiminta

### 1. Testaa INSERT
```sql
INSERT INTO alert_rules (user_id, name, criteria, notification_method)
VALUES (
  auth.uid(),
  'Testi hälytys',
  '{"keywords": ["maalaus"], "min_match_score": 70}'::jsonb,
  'email'
);
```

### 2. Testaa SELECT
```sql
SELECT * FROM alert_rules WHERE user_id = auth.uid();
```

Pitäisi näyttää juuri lisätty rivi.

### 3. Testaa DELETE
```sql
DELETE FROM alert_rules WHERE name = 'Testi hälytys' AND user_id = auth.uid();
```

---

## Yleisiä virheitä ja ratkaisut

### Virhe: "relation 'profiles' does not exist"
**Ratkaisu**: `profiles` taulu pitää olla olemassa ensin. Tarkista:
```sql
SELECT * FROM profiles LIMIT 1;
```

### Virhe: "policy already exists"
**Ratkaisu**: Poista vanha policy ensin:
```sql
DROP POLICY IF EXISTS "Users can view own alert rules" ON alert_rules;
```
Sitten luo uusi.

### Virhe: "function auth.uid() does not exist"
**Ratkaisu**: Käytä sen sijaan:
```sql
USING ((SELECT auth.uid()) = user_id)
```

---

## Varmista RLS toimii

### Testaa että käyttäjä näkee vain omansa:
```sql
-- Tämän pitäisi palauttaa vain sinun hälytykset
SELECT * FROM alert_rules;
```

### Testaa että et näe toisten hälytyksiä:
```sql
-- Tämän pitäisi palauttaa 0 riviä (jos ei ole sinun)
SELECT * FROM alert_rules WHERE user_id != auth.uid();
```

---

## Valmis! ✅

Kun kaikki komennot on suoritettu onnistuneesti, voit:

1. Mennä sovellukseen: https://pienhankinta-vahti.vercel.app
2. Kirjaudu sisään
3. Mene Hälytykset-sivulle
4. Luo uusi hälytys
5. Se tallentuu nyt tietokantaan! 🎉

---

## Lisätietoja

### Taulun rakenne

| Sarake | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Uniikki tunniste |
| user_id | UUID | Viittaus profiles-tauluun |
| name | TEXT | Hälytyksen nimi |
| criteria | JSONB | Hakukriteerit (keywords, match score, jne) |
| notification_method | TEXT | email / in_app / both |
| enabled | BOOLEAN | Onko hälytys päällä |
| created_at | TIMESTAMPTZ | Luontiaika |
| updated_at | TIMESTAMPTZ | Päivitysaika (automaattinen) |

### Criteria-kentän rakenne (JSONB)

```json
{
  "keywords": ["maalaus", "saneeraus"],
  "categories": ["Rakentaminen"],
  "min_budget": 10000,
  "max_budget": 100000,
  "organizations": ["Helsinki"],
  "min_match_score": 75
}
```

Kaikki kentät ovat valinnaisia.

---

**Tuki**: Jos törmäät ongelmiin, tarkista Supabase Dashboard → Logs
