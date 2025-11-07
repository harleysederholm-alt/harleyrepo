import { PLANS } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import PricingCard from '@/components/PricingCard';
import Link from 'next/link';
import { Target } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function HinnastoPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; paywall?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userPlan: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    userPlan = profile?.plan || 'free';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
              Takaisin dashboardiin
            </Link>
          ) : (
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Kirjaudu sisään
            </Link>
          )}
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Paywall Message */}
          {params.paywall && user && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg max-w-2xl mx-auto shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <svg
                  className="w-8 h-8 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h2 className="text-2xl font-bold">Premium-sisältö lukittu</h2>
              </div>
              <p className="text-lg text-blue-100">
                Jatkaaksesi sovelluksen käyttöä, valitse Pro tai Agentti -tilaus alta.
              </p>
              <p className="text-sm text-blue-200 mt-2">
                Pääset käyttämään hankintadataa heti maksun jälkeen!
              </p>
            </div>
          )}

          {/* Header Text */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              {params.paywall ? 'Valitse tilaus päästäksesi eteenpäin' : 'Valitse sopiva tilaus'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              PienHankinta-Vahti auttaa sinua löytämään ja voittamaan julkiset hankinnat.
              {!params.paywall && ' Aloita ilmaiseksi tai päivitä premium-ominaisuuksiin.'}
            </p>
            {params.canceled && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  Maksuprosessi keskeytetty. Voit palata takaisin milloin tahansa.
                </p>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* FREE */}
            <PricingCard
              name={PLANS.FREE.name}
              price={PLANS.FREE.price}
              features={PLANS.FREE.features}
              isCurrentPlan={userPlan === 'free'}
              isFree
            />

            {/* PRO */}
            <PricingCard
              name={PLANS.PRO.name}
              price={PLANS.PRO.price}
              features={PLANS.PRO.features}
              isCurrentPlan={userPlan === 'pro'}
              isPro
              planType="PRO"
            />

            {/* AGENT */}
            <PricingCard
              name={PLANS.AGENT.name}
              price={PLANS.AGENT.price}
              features={PLANS.AGENT.features}
              isCurrentPlan={userPlan === 'agent'}
              isAgent
              planType="AGENT"
            />
          </div>

          {/* FAQ */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Usein kysytyt kysymykset
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Voinko vaihtaa tasojen välillä?
                </h3>
                <p className="text-gray-600">
                  Kyllä! Voit päivittää tai alentaa tilaustasi milloin tahansa.
                  Päivitykset tulevat voimaan välittömästi.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Voinko peruuttaa tilauksen?
                </h3>
                <p className="text-gray-600">
                  Kyllä, voit peruuttaa tilauksen milloin tahansa.
                  Tilaus jatkuu laskutusjakson loppuun asti.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Miten AI-Agentti toimii?
                </h3>
                <p className="text-gray-600">
                  AI-Agentti analysoi hankinnat automaattisesti, laskee tarjoushinnat
                  kilpailija-analyysin perusteella ja ehdottaa parhaita hankintoja yrityksellesi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
