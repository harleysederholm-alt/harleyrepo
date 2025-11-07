import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Supabase admin client (service_role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const planType = session.metadata?.plan_type;

        if (userId && planType) {
          // Update user's subscription in Supabase
          await supabaseAdmin
            .from('profiles')
            .update({
              stripe_subscription_id: session.subscription as string,
              plan: planType.toLowerCase(),
              subscription_status: 'active',
              plan_expires_at: null, // Active subscription
            })
            .eq('id', userId);

          console.log(`✅ Subscription activated for user ${userId}: ${planType}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const isActive = subscription.status === 'active';
          const planType = subscription.metadata?.plan_type;

          await supabaseAdmin
            .from('profiles')
            .update({
              plan: isActive && planType ? planType.toLowerCase() : 'free',
              subscription_status: subscription.status,
              plan_expires_at: isActive ? null : new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          console.log(`✅ Subscription updated for user ${userId}: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          // Downgrade to free plan
          await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'free',
              subscription_status: 'canceled',
              plan_expires_at: new Date().toISOString(),
              stripe_subscription_id: null,
            })
            .eq('stripe_subscription_id', subscription.id);

          console.log(`✅ Subscription cancelled for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        // Optionally: Send email notification or downgrade user
        console.warn(`⚠️ Payment failed for subscription ${subscriptionId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
