-- =====================================================
-- PienHankinta-Vahti: TÄYDENNYSMÄÄRITYKSET
-- =====================================================
-- Luotu: 2025-11-07
-- Kuvaus: Lisää puuttuvat taulut ja Stripe-integraatiokentät
-- Edellytys: 001_initial_schema.sql on ajettu

-- =====================================================
-- 1. PÄIVITÄ PROFILES-TAULU: LISÄÄ STRIPE-KENTÄT
-- =====================================================
-- Nämä kentät ovat KRIITTISIÄ Freemium-logiikalle!

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agentti')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', NULL)),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Lisää indeksi nopeampaa hakua varten
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);

-- Kommentit
COMMENT ON COLUMN public.profiles.plan IS 'Käyttäjän taso: free, pro tai agentti (KRIITTINEN Freemium-logiikalle)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Stripe-tilauksen status: active, canceled, past_due, trialing';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer ID, uniikki per käyttäjä';

-- =====================================================
-- 2. USER_HANKINTA_SCORES-TAULU
-- =====================================================
-- Sisältää AI:n laskemat osuvuuspisteet (0-100) jokaiselle
-- käyttäjä-hankinta-parille

CREATE TABLE IF NOT EXISTS public.user_hankinta_scores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hankinta_id BIGINT NOT NULL REFERENCES public.hankinnat(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    perustelu_ai TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Estä duplikaatit: yksi pisteytys per käyttäjä-hankinta-pari
    UNIQUE(user_id, hankinta_id)
);

-- Indeksit suorituskyvyn parantamiseksi
CREATE INDEX IF NOT EXISTS idx_user_scores_user ON public.user_hankinta_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_hankinta ON public.user_hankinta_scores(hankinta_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_score ON public.user_hankinta_scores(score DESC);

-- Kommentit
COMMENT ON TABLE public.user_hankinta_scores IS 'AI:n laskemat osuvuuspisteet (0-100) jokaiselle käyttäjä-hankinta-parille';
COMMENT ON COLUMN public.user_hankinta_scores.score IS 'Osuvuuspistemäärä 0-100 (100 = täydellinen match)';
COMMENT ON COLUMN public.user_hankinta_scores.perustelu_ai IS 'AI:n selitys pistetykselle';

-- =====================================================
-- 3. USER_ALERTS-TAULU
-- =====================================================
-- Sisältää käyttäjien tallentamat hakuvahdit (Pro-ominaisuus)

CREATE TABLE IF NOT EXISTS public.user_alerts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nimi TEXT NOT NULL,
    kategoriat TEXT[] DEFAULT '{}',
    alueet TEXT[] DEFAULT '{}',
    avainsanat TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeksi käyttäjän hälytysten hakemiseen
CREATE INDEX IF NOT EXISTS idx_user_alerts_user ON public.user_alerts(user_id);

-- Kommentit
COMMENT ON TABLE public.user_alerts IS 'Käyttäjien tallentamat hakuvahdit (Pro-ominaisuus)';
COMMENT ON COLUMN public.user_alerts.nimi IS 'Käyttäjän antama nimi hälytykselle (esim. "Maalaustyöt Espoo")';
COMMENT ON COLUMN public.user_alerts.kategoriat IS 'Toimialat joita seurataan';
COMMENT ON COLUMN public.user_alerts.alueet IS 'Kunnat/alueet joita seurataan';
COMMENT ON COLUMN public.user_alerts.avainsanat IS 'Avainsanat joita etsitään hankinnan otsikosta/kuvauksesta';

-- =====================================================
-- 4. RLS (ROW LEVEL SECURITY) - USER_HANKINTA_SCORES
-- =====================================================

ALTER TABLE public.user_hankinta_scores ENABLE ROW LEVEL SECURITY;

-- Politiikka: Käyttäjät voivat lukea VAIN omat pisteensä
CREATE POLICY "Käyttäjät voivat lukea omat pisteensä"
    ON public.user_hankinta_scores
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politiikka: Service role (n8n) voi lisätä pisteitä
-- TÄRKEÄ: n8n-agentti "Pisteyttäjä" käyttää tätä
CREATE POLICY "Service role voi lisätä pisteitä"
    ON public.user_hankinta_scores
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Politiikka: Service role voi päivittää pisteitä
CREATE POLICY "Service role voi päivittää pisteitä"
    ON public.user_hankinta_scores
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Politiikka: Service role voi poistaa pisteitä (esim. jos hankinta poistetaan)
CREATE POLICY "Service role voi poistaa pisteitä"
    ON public.user_hankinta_scores
    FOR DELETE
    USING (auth.role() = 'service_role');

-- =====================================================
-- 5. RLS (ROW LEVEL SECURITY) - USER_ALERTS
-- =====================================================

ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

-- Politiikka: Käyttäjät voivat lukea VAIN omat hälytyksensä
CREATE POLICY "Käyttäjät voivat lukea omat hälytyksensä"
    ON public.user_alerts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politiikka: Käyttäjät voivat lisätä omia hälytyksiä
CREATE POLICY "Käyttäjät voivat luoda omia hälytyksiä"
    ON public.user_alerts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politiikka: Käyttäjät voivat päivittää omia hälytyksiä
CREATE POLICY "Käyttäjät voivat päivittää omia hälytyksiä"
    ON public.user_alerts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politiikka: Käyttäjät voivat poistaa omia hälytyksiä
CREATE POLICY "Käyttäjät voivat poistaa omia hälytyksiä"
    ON public.user_alerts
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. TRIGGERIT PÄIVITYSAJAN AUTOMAATTISEEN PÄIVITYKSEEN
-- =====================================================

-- Triggeri: Päivitä user_hankinta_scores.updated_at
CREATE TRIGGER user_hankinta_scores_updated_at
    BEFORE UPDATE ON public.user_hankinta_scores
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Triggeri: Päivitä user_alerts.updated_at
CREATE TRIGGER user_alerts_updated_at
    BEFORE UPDATE ON public.user_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 7. HYÖDYLLISIÄ NÄKYMIÄ (VIEWS)
-- =====================================================

-- Näkymä: Käyttäjän liidit pisteineen (VAIN PRO/AGENTTI)
-- Tämä helpottaa frontend-kyselyitä
CREATE OR REPLACE VIEW public.user_hankinnat_with_scores AS
SELECT
    h.id,
    h.otsikko,
    h.kunta,
    h.maarapaiva,
    h.linkki_lahteeseen,
    h.toimiala_ai,
    h.tiivistelma_ai,
    h.riskit_ai,
    h.created_at,
    uhs.user_id,
    uhs.score,
    uhs.perustelu_ai,
    -- Lasketaan kuinka vanha hankinta on (tunteina)
    EXTRACT(EPOCH FROM (NOW() - h.created_at))/3600 AS age_hours
FROM public.hankinnat h
LEFT JOIN public.user_hankinta_scores uhs ON h.id = uhs.hankinta_id;

COMMENT ON VIEW public.user_hankinnat_with_scores IS 'Näkymä: Hankinnat + osuvuuspisteet. Helpottaa frontend-kyselyitä.';

-- RLS näkymälle: Käyttäjät näkevät vain omat pisteensä
ALTER VIEW public.user_hankinnat_with_scores SET (security_invoker = true);

-- =====================================================
-- VALMIS!
-- =====================================================
-- Tämä migraatio täydentää tietokantaskeeman.
--
-- Yhteenveto:
-- ✅ profiles: Lisätty plan, subscription_status, stripe_customer_id
-- ✅ user_hankinta_scores: Luotu taulu + RLS
-- ✅ user_alerts: Luotu taulu + RLS
-- ✅ Näkymät: user_hankinnat_with_scores
--
-- Seuraavaksi: Aja tämä migraatio Supabase SQL Editorissa!
