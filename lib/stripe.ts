import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY on puuttuva .env.local -tiedostosta');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Hinnoittelutasot
export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '24h viive hankinta-aineistossa',
      'Perustiedot hankinnoista',
      'Maksimi 20 hankintaa näkyvillä',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_PRO!,
    features: [
      'Ei 24h viivettä - Näet hankinnat heti',
      'AI-osuvuusprosentti jokaiselle hankinnalle',
      'Täysi pääsy kaikkiin toimintoihin',
      'Tallenna ja seuraa hankintoja',
      'Sähköposti-ilmoitukset',
      'Maksimi 500 hankintaa/kk',
    ],
  },
  AGENT: {
    name: 'Agent',
    price: 99,
    priceId: process.env.STRIPE_PRICE_ID_AGENT!,
    features: [
      'Kaikki Pro-ominaisuudet',
      'AI-tarjousapuri (generoi tarjousluonnokset)',
      'Prioriteettituki',
      'Rajattomat hankinnat',
      'API-rajapinta',
      'Mukautetut raportit',
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
