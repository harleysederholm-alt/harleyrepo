-- =====================================================
-- PienHankinta-Vahti: Stripe & Freemium
-- =====================================================
-- Luotu: 2025-11-07
-- Kuvaus: Lisää Stripe-integraatio ja Freemium-logiikka

-- =====================================================
-- 1. PÄIVITÄ PROFILES-TAULU (Stripe & Freemium)
-- =====================================================

-- Lisää Stripe-kentät
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Kommentit
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe-asiakastunnus (unique)';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe-tilaustunnus';
COMMENT ON COLUMN public.profiles.plan IS 'Käyttäjän tilaustyyppi: free, pro, agent';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Stripe-tilauksen status: active, canceled, past_due, jne.';
COMMENT ON COLUMN public.profiles.plan_expires_at IS 'Tilauksen vanhentumispäivä';
COMMENT ON COLUMN public.profiles.email IS 'Käyttäjän sähköposti (cachena auth.users.email)';

-- Indeksit suorituskyvyn parantamiseksi
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);

-- =====================================================
-- 2. SAVED_HANKINNAT-TAULU (Suosikit)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.saved_hankinnat (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hankinta_id BIGINT NOT NULL REFERENCES public.hankinnat(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, hankinta_id)
);

-- Indeksit
CREATE INDEX IF NOT EXISTS idx_saved_hankinnat_user ON public.saved_hankinnat(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_hankinnat_hankinta ON public.saved_hankinnat(hankinta_id);

-- Kommentit
COMMENT ON TABLE public.saved_hankinnat IS 'Käyttäjien tallentamat/suosikit hankinnat';
COMMENT ON COLUMN public.saved_hankinnat.notes IS 'Käyttäjän muistiinpanot hankinnasta';

-- =====================================================
-- 3. RLS (ROW LEVEL SECURITY) - SAVED_HANKINNAT
-- =====================================================

ALTER TABLE public.saved_hankinnat ENABLE ROW LEVEL SECURITY;

-- Käyttäjät voivat lukea omat tallennuksensa
CREATE POLICY "Käyttäjät voivat lukea omat tallennuksensa"
    ON public.saved_hankinnat
    FOR SELECT
    USING (auth.uid() = user_id);

-- Käyttäjät voivat lisätä omia tallennuksiaan
CREATE POLICY "Käyttäjät voivat tallentaa hankintoja"
    ON public.saved_hankinnat
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Käyttäjät voivat poistaa omia tallennuksiaan
CREATE POLICY "Käyttäjät voivat poistaa tallennuksiaan"
    ON public.saved_hankinnat
    FOR DELETE
    USING (auth.uid() = user_id);

-- Käyttäjät voivat päivittää omia muistiinpanojaan
CREATE POLICY "Käyttäjät voivat päivittää muistiinpanojaan"
    ON public.saved_hankinnat
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. EMAIL_PREFERENCES-TAULU (Sähköposti-ilmoitukset)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.email_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    frequency TEXT NOT NULL DEFAULT 'daily', -- 'instant', 'daily', 'weekly'
    min_match_score INTEGER NOT NULL DEFAULT 70, -- Vähimmäisosuvuus (0-100)
    last_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kommentit
COMMENT ON TABLE public.email_preferences IS 'Käyttäjien sähköposti-ilmoitusasetukset';
COMMENT ON COLUMN public.email_preferences.frequency IS 'Ilmoitustiheys: instant, daily, weekly';
COMMENT ON COLUMN public.email_preferences.min_match_score IS 'Vähimmäisosuvuus ilmoituksille (%)';

-- =====================================================
-- 5. RLS - EMAIL_PREFERENCES
-- =====================================================

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Käyttäjät voivat lukea omat asetuksensa
CREATE POLICY "Käyttäjät voivat lukea omat sähköpostiasetuksensa"
    ON public.email_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Käyttäjät voivat lisätä omat asetuksensa
CREATE POLICY "Käyttäjät voivat luoda sähköpostiasetukset"
    ON public.email_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Käyttäjät voivat päivittää omia asetuksiaan
CREATE POLICY "Käyttäjät voivat päivittää sähköpostiasetuksiaan"
    ON public.email_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Käyttäjät voivat poistaa omat asetuksensa
CREATE POLICY "Käyttäjät voivat poistaa sähköpostiasetukset"
    ON public.email_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. TRIGGERI: Luo email_preferences automaattisesti
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_email_prefs()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.email_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggeri: Luo email_preferences kun profiili luodaan
CREATE TRIGGER on_profile_created_email_prefs
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_email_prefs();

-- =====================================================
-- 7. FUNKTIOT - Helper-funktiot
-- =====================================================

-- Funktio: Tarkista onko käyttäjällä Premium
CREATE OR REPLACE FUNCTION public.is_premium_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
BEGIN
    SELECT plan INTO user_plan
    FROM public.profiles
    WHERE id = p_user_id;

    RETURN user_plan IN ('pro', 'agent');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktio: Hae käyttäjän hankinnat Freemium-logiikalla
CREATE OR REPLACE FUNCTION public.get_hankinnat_for_user(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id BIGINT,
    otsikko TEXT,
    kunta TEXT,
    maarapaiva TIMESTAMP WITH TIME ZONE,
    linkki_lahteeseen TEXT,
    toimiala_ai TEXT,
    tiivistelma_ai TEXT,
    riskit_ai TEXT,
    raakadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    is_saved BOOLEAN
) AS $$
DECLARE
    user_plan TEXT;
    time_filter TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Hae käyttäjän plan
    SELECT profiles.plan INTO user_plan
    FROM public.profiles
    WHERE profiles.id = p_user_id;

    -- Määritä aikaraja (Free = 24h viive)
    IF user_plan = 'free' THEN
        time_filter := NOW() - INTERVAL '24 hours';
    ELSE
        time_filter := '1970-01-01'::TIMESTAMP; -- Ei rajoitusta
    END IF;

    -- Palauta hankinnat
    RETURN QUERY
    SELECT
        h.id,
        h.otsikko,
        h.kunta,
        h.maarapaiva,
        h.linkki_lahteeseen,
        h.toimiala_ai,
        h.tiivistelma_ai,
        h.riskit_ai,
        h.raakadata,
        h.created_at,
        h.updated_at,
        EXISTS(
            SELECT 1 FROM public.saved_hankinnat sh
            WHERE sh.hankinta_id = h.id AND sh.user_id = p_user_id
        ) AS is_saved
    FROM public.hankinnat h
    WHERE h.created_at <= time_filter
    ORDER BY h.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. PÄIVITÄ OLEMASSA OLEVAT RIVIT
-- =====================================================

-- Aseta olemassa oleville käyttäjille default-arvot
UPDATE public.profiles
SET
    plan = 'free',
    email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id)
WHERE plan IS NULL;

-- =====================================================
-- VALMIS!
-- =====================================================
-- Muista ajaa tämä Supabase SQL Editorissa tai migraatiotyökalulla.
