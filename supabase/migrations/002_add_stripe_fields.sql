-- =====================================================
-- PienHankinta-Vahti: Stripe-kentät
-- =====================================================
-- Luotu: 2025-11-07
-- Kuvaus: Lisää Stripe-maksut ja tilaukset

-- =====================================================
-- Lisää Stripe-kentät profiles-tauluun
-- =====================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Lisää indeksit
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);

-- Kommentit
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer ID';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe Subscription ID';
COMMENT ON COLUMN public.profiles.plan IS 'Tilaustyyppi: free, pro, agent';
COMMENT ON COLUMN public.profiles.plan_expires_at IS 'Milloin tilaus päättyy';
COMMENT ON COLUMN public.profiles.email IS 'Käyttäjän sähköposti';

-- =====================================================
-- Päivitä trigger automaattisesti täyttämään email
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Valmis!
-- =====================================================
