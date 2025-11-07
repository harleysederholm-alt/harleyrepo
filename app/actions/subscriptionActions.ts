'use server';

import { stripe, PLANS } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCheckoutSession(planType: 'PRO' | 'AGENT') {
  try {
    const supabase = await createClient();

    // Hae kirjautunut käyttäjä
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Käyttäjä ei ole kirjautunut' };
    }

    // Hae käyttäjän profiili
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, plan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return { error: 'Profiilin haku epäonnistui' };
    }

    // Tarkista että käyttäjä ei ole jo tällä tasolla
    if (profile.plan === planType.toLowerCase()) {
      return { error: 'Olet jo tällä tilaustasolla' };
    }

    const plan = PLANS[planType];
    let customerId = profile.stripe_customer_id;

    // Jos ei ole Stripe-asiakasta, luo sellainen
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Tallenna customer_id Supabaseen
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Stripe customer ID:n tallennus epäonnistui:', updateError);
        return { error: 'Asiakastiedon tallennus epäonnistui' };
      }
    }

    // Luo Stripe Checkout -istunto
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?activated=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/hinnasto?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan_type: planType,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_type: planType,
        },
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Checkout-istunnon luonti epäonnistui:', error);
    return { error: 'Maksujärjestelmässä tapahtui virhe. Yritä hetken kuluttua uudelleen.' };
  }
}

export async function createPortalSession() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Käyttäjä ei ole kirjautunut' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return { error: 'Asiakastietoja ei löydy' };
    }

    // Luo Customer Portal -istunto
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Portal-istunnon luonti epäonnistui:', error);
    return { error: 'Tilaushallintaan pääsy epäonnistui' };
  }
}

export async function getUserProfile() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Käyttäjä ei ole kirjautunut' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return { error: 'Profiilin haku epäonnistui' };
    }

    return { profile };
  } catch (error) {
    console.error('Profiilin haku epäonnistui:', error);
    return { error: 'Virhe profiilin haussa' };
  }
}

export async function refreshProfile() {
  revalidatePath('/dashboard');
  revalidatePath('/hinnasto');
}
