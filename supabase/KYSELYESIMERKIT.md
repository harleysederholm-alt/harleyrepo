# SQL-Kyselyesimerkit - PienHankinta-Vahti

> **TÄRKEÄ:** Nämä esimerkit on tarkoitettu frontend-kehittäjille (Next.js Server Actions, API Routes).
> Käytä aina Supabase JavaScript -clientia, ÄLÄ suoria SQL-kyselyitä.

---

## 🎯 Freemium-Logiikka

### 1. Free-käyttäjä: Hankinnat 24h viiveellä

```typescript
// app/actions/hankintaActions.ts
import { createServerClient } from '@/lib/supabase-server'

export async function getHankinnatForFreeUser() {
  const supabase = createServerClient()

  // Hae VAIN 24h vanhat hankinnat
  const { data, error } = await supabase
    .from('hankinnat')
    .select('*')
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}
```

**SQL-ekvivalentti:**
```sql
SELECT * FROM hankinnat
WHERE created_at < NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 50;
```

---

### 2. Pro/Agentti-käyttäjä: Reaaliaikaiset hankinnat pisteineen

```typescript
// app/actions/hankintaActions.ts
export async function getHankinnatForProUser(userId: string) {
  const supabase = createServerClient()

  // Käytä näkymää joka yhdistää hankinnat + pisteet
  const { data, error } = await supabase
    .from('user_hankinnat_with_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}
```

**SQL-ekvivalentti:**
```sql
SELECT * FROM user_hankinnat_with_scores
WHERE user_id = 'xxx-xxx-xxx'
ORDER BY score DESC, created_at DESC
LIMIT 50;
```

---

### 3. Tarkista käyttäjän plan-taso

```typescript
// app/actions/userActions.ts
export async function getUserPlan(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('plan, subscription_status')
    .eq('id', userId)
    .single()

  if (error) throw error

  return {
    plan: data.plan as 'free' | 'pro' | 'agentti',
    isActive: data.subscription_status === 'active'
  }
}
```

---

## 🎨 Dashboard-Kyselyt

### 4. Dashboard: Hankinnat + Suodattimet (Free)

```typescript
export async function getFilteredHankinnatFree({
  kunnat = [],
  toimialat = []
}: {
  kunnat?: string[]
  toimialat?: string[]
}) {
  const supabase = createServerClient()

  let query = supabase
    .from('hankinnat')
    .select('*')
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  // Filtterit
  if (kunnat.length > 0) {
    query = query.in('kunta', kunnat)
  }

  if (toimialat.length > 0) {
    query = query.in('toimiala_ai', toimialat)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}
```

---

### 5. Dashboard: Hankinnat pisteineen + Suodattimet (Pro)

```typescript
export async function getFilteredHankinnatPro(
  userId: string,
  {
    kunnat = [],
    toimialat = [],
    minScore = 0
  }: {
    kunnat?: string[]
    toimialat?: string[]
    minScore?: number
  }
) {
  const supabase = createServerClient()

  let query = supabase
    .from('user_hankinnat_with_scores')
    .select('*')
    .eq('user_id', userId)

  // Filtterit
  if (kunnat.length > 0) {
    query = query.in('kunta', kunnat)
  }

  if (toimialat.length > 0) {
    query = query.in('toimiala_ai', toimialat)
  }

  if (minScore > 0) {
    query = query.gte('score', minScore)
  }

  const { data, error } = await query
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}
```

---

### 6. Hae yksittäisen hankinnan tiedot

```typescript
export async function getHankintaById(hankintaId: number, userId: string) {
  const supabase = createServerClient()

  // Hae hankinta + käyttäjän pisteet (jos Pro)
  const { data: hankinta, error: hankintaError } = await supabase
    .from('hankinnat')
    .select('*')
    .eq('id', hankintaId)
    .single()

  if (hankintaError) throw hankintaError

  // Hae pisteet (Pro-ominaisuus)
  const { data: score } = await supabase
    .from('user_hankinta_scores')
    .select('score, perustelu_ai')
    .eq('hankinta_id', hankintaId)
    .eq('user_id', userId)
    .single()

  return {
    ...hankinta,
    score: score?.score ?? null,
    perustelu: score?.perustelu_ai ?? null
  }
}
```

---

## 🔔 Hälytykset (Pro-ominaisuus)

### 7. Hae käyttäjän hälytykset

```typescript
export async function getUserAlerts(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('user_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

---

### 8. Luo uusi hälytys

```typescript
export async function createAlert(
  userId: string,
  {
    nimi,
    kategoriat = [],
    alueet = [],
    avainsanat = []
  }: {
    nimi: string
    kategoriat?: string[]
    alueet?: string[]
    avainsanat?: string[]
  }
) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('user_alerts')
    .insert({
      user_id: userId,
      nimi,
      kategoriat,
      alueet,
      avainsanat
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

### 9. Poista hälytys

```typescript
export async function deleteAlert(alertId: number, userId: string) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('user_alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', userId) // RLS varmistaa, ettei voi poistaa toisen käyttäjän hälytystä

  if (error) throw error
}
```

---

## 👤 Profiili

### 10. Hae käyttäjän profiili

```typescript
export async function getUserProfile(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
```

---

### 11. Päivitä AI-profiilikuvaus (Onboarding)

```typescript
export async function updateAiProfile(
  userId: string,
  aiProfiiliKuvaus: string
) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ ai_profiili_kuvaus: aiProfiiliKuvaus })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

### 12. Päivitä Stripe-tiedot (Webhook)

```typescript
// app/api/stripe-webhook/route.ts
// HUOM: Tämä käyttää service_role -avainta!

import { createClient } from '@supabase/supabase-js'

export async function updateUserSubscription(
  stripeCustomerId: string,
  plan: 'free' | 'pro' | 'agentti',
  subscriptionStatus: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // SERVICE ROLE!
  )

  const { data, error } = await supabase
    .from('profiles')
    .update({
      plan,
      subscription_status: subscriptionStatus
    })
    .eq('stripe_customer_id', stripeCustomerId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## 📊 Tilastot ja Metriikat

### 13. Käyttäjän parhaiten sopivat hankinnat (Top 10)

```typescript
export async function getTopMatchingHankinnat(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('user_hankinnat_with_scores')
    .select('*')
    .eq('user_id', userId)
    .gte('score', 70) // Vähintään 70% osuvuus
    .order('score', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}
```

---

### 14. Laskevat määräajat (Deadline Alert)

```typescript
export async function getUpcomingDeadlines(userId: string) {
  const supabase = createServerClient()

  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('user_hankinnat_with_scores')
    .select('*')
    .eq('user_id', userId)
    .gte('maarapaiva', now.toISOString())
    .lte('maarapaiva', sevenDaysFromNow.toISOString())
    .order('maarapaiva', { ascending: true })

  if (error) throw error
  return data
}
```

---

## 🔍 Haku

### 15. Tekstihaku (Avainsanat)

```typescript
export async function searchHankinnat(
  searchTerm: string,
  userId?: string // Jos Pro-käyttäjä
) {
  const supabase = createServerClient()

  // Jos Pro-käyttäjä, käytä näkymää pisteineen
  if (userId) {
    const { data, error } = await supabase
      .from('user_hankinnat_with_scores')
      .select('*')
      .eq('user_id', userId)
      .or(`otsikko.ilike.%${searchTerm}%,tiivistelma_ai.ilike.%${searchTerm}%`)
      .order('score', { ascending: false })
      .limit(50)

    if (error) throw error
    return data
  }

  // Free-käyttäjä: 24h viive
  const { data, error } = await supabase
    .from('hankinnat')
    .select('*')
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .or(`otsikko.ilike.%${searchTerm}%,tiivistelma_ai.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}
```

---

## 🤖 AI-Tarjousapuri (Agentti-taso)

### 16. Luo tarjousluonnos (Server Action)

```typescript
// app/actions/aiActions.ts
export async function createTarjousluonnos(
  userId: string,
  hankintaId: number
) {
  // 1. Tarkista käyttäjän plan
  const { plan } = await getUserPlan(userId)
  if (plan !== 'agentti') {
    throw new Error('Tämä ominaisuus vaatii Agentti-tason')
  }

  // 2. Hae hankinta ja käyttäjän profiili
  const [hankinta, profile] = await Promise.all([
    getHankintaById(hankintaId, userId),
    getUserProfile(userId)
  ])

  // 3. Kutsu Groq API
  const prompt = `
Luo tarjous-sähköpostin luonnos seuraavista tiedoista:

HANKINTA:
${hankinta.otsikko}
${hankinta.tiivistelma_ai}

YRITYS:
${profile.ai_profiili_kuvaus}

TÄRKEÄ: ÄLÄ ehdota hintaa! Jätä hinta-kohta tyhjäksi.
`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  const data = await response.json()
  return data.choices[0].message.content
}
```

---

## 🔒 Turvallisuus

### ⚠️ TÄRKEÄT MUISTUTUKSET:

1. **RLS on AINA päällä** - Käyttäjät eivät voi lukea toistensa tietoja
2. **Service Role -avainta** käytetään VAIN:
   - Stripe Webhook -käsittelyssä
   - n8n-agenteissa
3. **ÄLÄ KOSKAAN** paljasta Service Role -avainta frontendille
4. **Freemium-logiikka** toteutetaan kyselyissä (24h viive)
5. **Plan-tason tarkistus** tehdään AINA Server Actioneissa

---

**Dokumentaatio päivitetty:** 2025-11-07
**Versio:** 1.0.0
