-- =====================================================
-- PienHankinta-Vahti: Tietokantaskeema
-- =====================================================
-- Luotu: 2025-11-06
-- Kuvaus: Tämä migraatio luo taulut ja RLS-säännöt PienHankinta-Vahti -sovellukselle

-- =====================================================
-- 1. PROFILES-TAULU
-- =====================================================
-- Yhdistetty Supabasen auth.users-tauluun
-- Sisältää käyttäjän asetukset ja AI-profiilikuvauksen

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    paikkakunnat TEXT[] DEFAULT '{}',
    toimialat TEXT[] DEFAULT '{}',
    ai_profiili_kuvaus TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lisää kommentteja selkeyden vuoksi
COMMENT ON TABLE public.profiles IS 'Käyttäjäprofiilit ja AI-asetukset';
COMMENT ON COLUMN public.profiles.paikkakunnat IS 'Käyttäjän valitsemat paikkakunnat';
COMMENT ON COLUMN public.profiles.toimialat IS 'Käyttäjän valitsemat toimialat';
COMMENT ON COLUMN public.profiles.ai_profiili_kuvaus IS 'Käyttäjän vapaamuotoinen kuvaus liiketoiminnastaan (TÄRKEIN kenttä AI-matchingille)';

-- =====================================================
-- 2. HANKINNAT-TAULU
-- =====================================================
-- Sisältää kaikki kerätyt pienhankintailmoitukset

CREATE TABLE IF NOT EXISTS public.hankinnat (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    otsikko TEXT NOT NULL,
    kunta TEXT NOT NULL,
    maarapaiva TIMESTAMP WITH TIME ZONE,
    linkki_lahteeseen TEXT UNIQUE NOT NULL,
    toimiala_ai TEXT,
    tiivistelma_ai TEXT,
    riskit_ai TEXT,
    raakadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeksit suorituskyvyn parantamiseksi
CREATE INDEX IF NOT EXISTS idx_hankinnat_kunta ON public.hankinnat(kunta);
CREATE INDEX IF NOT EXISTS idx_hankinnat_maarapaiva ON public.hankinnat(maarapaiva);
CREATE INDEX IF NOT EXISTS idx_hankinnat_toimiala ON public.hankinnat(toimiala_ai);
CREATE INDEX IF NOT EXISTS idx_hankinnat_linkki ON public.hankinnat(linkki_lahteeseen);

-- Lisää kommentteja
COMMENT ON TABLE public.hankinnat IS 'Kaikki kerätyt pienhankintailmoitukset';
COMMENT ON COLUMN public.hankinnat.linkki_lahteeseen IS 'Uniikki linkki alkuperäiseen ilmoitukseen (estää duplikaatit)';
COMMENT ON COLUMN public.hankinnat.toimiala_ai IS 'AI:n luokittelema toimiala';
COMMENT ON COLUMN public.hankinnat.tiivistelma_ai IS 'AI:n generoima tiivistelmä hankinnasta';
COMMENT ON COLUMN public.hankinnat.riskit_ai IS 'AI:n tunnistama riskit ja huomioitavat asiat';
COMMENT ON COLUMN public.hankinnat.raakadata IS 'Alkuperäinen skreipattu data JSON-muodossa';

-- =====================================================
-- 3. RLS (ROW LEVEL SECURITY) - PROFILES
-- =====================================================

-- Ota RLS käyttöön profiles-taululle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politiikka: Käyttäjät voivat lukea VAIN oman profiilinsa
CREATE POLICY "Käyttäjät voivat lukea oman profiilinsa"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Politiikka: Käyttäjät voivat päivittää VAIN oman profiilinsa
CREATE POLICY "Käyttäjät voivat päivittää oman profiilinsa"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Politiikka: Käyttäjät voivat lisätä VAIN oman profiilinsa (onboarding)
CREATE POLICY "Käyttäjät voivat luoda oman profiilinsa"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Politiikka: Käyttäjät voivat poistaa oman profiilinsa
CREATE POLICY "Käyttäjät voivat poistaa oman profiilinsa"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- =====================================================
-- 4. RLS (ROW LEVEL SECURITY) - HANKINNAT
-- =====================================================

-- Ota RLS käyttöön hankinnat-taululle
ALTER TABLE public.hankinnat ENABLE ROW LEVEL SECURITY;

-- Politiikka: Kaikki autentikoituneet käyttäjät voivat lukea hankintoja
CREATE POLICY "Autentikoituneet voivat lukea hankintoja"
    ON public.hankinnat
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Politiikka: Vain service_role (n8n) voi lisätä hankintoja
-- HUOM: Tämä politiikka sallii INSERT:it vain service_role:lle
-- n8n tulee käyttämään Supabase service_role -avainta
CREATE POLICY "Service role voi lisätä hankintoja"
    ON public.hankinnat
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Politiikka: Service role voi päivittää hankintoja
CREATE POLICY "Service role voi päivittää hankintoja"
    ON public.hankinnat
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 5. FUNKTIOT JA TRIGGERIT
-- =====================================================

-- Funktio: Päivitä updated_at automaattisesti
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggeri: Päivitä profiles.updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Triggeri: Päivitä hankinnat.updated_at
CREATE TRIGGER hankinnat_updated_at
    BEFORE UPDATE ON public.hankinnat
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Funktio: Luo automaattisesti profiili kun käyttäjä rekisteröityy
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggeri: Luo profiili automaattisesti
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 6. TESTIDATAA (Valinnainen - poista tuotannossa)
-- =====================================================

-- Lisää muutama esimerkkihankinta testaukseen
-- HUOM: Poista tai kommentoi nämä tuotannossa!

INSERT INTO public.hankinnat (
    otsikko,
    kunta,
    maarapaiva,
    linkki_lahteeseen,
    toimiala_ai,
    tiivistelma_ai,
    riskit_ai,
    raakadata
) VALUES
(
    'Koulun ulkomaalaustyöt',
    'Vantaa',
    NOW() + INTERVAL '14 days',
    'https://vantaa.fi/hankinnat/test-001',
    'Rakentaminen',
    'Vantaan kaupunki hakee urakoitsijaa Martinlaakson koulun ulkomaalaustyöhön. Kohde on noin 800 m². Työ tulee tehdä kesäkuun aikana.',
    'Lyhyt määräaika (14 päivää). Vaaditaan rakennusalan turvallisuuskortti. Sopimussakko viivästymisestä.',
    '{"alkuperainen_teksti": "Martinlaakson koulu ulkomaalaus..."}'::jsonb
),
(
    'IT-tukipalvelut peruskouluille',
    'Espoo',
    NOW() + INTERVAL '30 days',
    'https://espoo.fi/hankinnat/test-002',
    'IT',
    'Espoon kaupunki hakee IT-tukipalvelun tarjoajaa 5 peruskululle. Palveluun kuuluu laitteiston ylläpito ja käyttäjätuki.',
    'Vaaditaan ISO 27001 -sertifiointi. Sopimus 2 vuotta.',
    '{"alkuperainen_teksti": "IT-tukipalvelut Espoon kouluille..."}'::jsonb
),
(
    'Siivouspalvelut kirjasto',
    'Helsinki',
    NOW() + INTERVAL '21 days',
    'https://helsinki.fi/hankinnat/test-003',
    'Siivous',
    'Helsingin kaupunginkirjasto hakee siivouspalvelun tarjoajaa Kallion kirjastolle. Siivous 3x viikossa, iltaisin.',
    'Vaaditaan siivousalan ammattipätevyys. Sopimuskausi 1+1 vuotta.',
    '{"alkuperainen_teksti": "Kallion kirjasto siivouspalvelut..."}'::jsonb
);

-- =====================================================
-- VALMIS!
-- =====================================================
-- Aja tämä skripti Supabase SQL Editorissa tai migraatiotyökalulla.
