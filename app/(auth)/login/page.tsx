'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';
import { Target } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tarkista onko käyttäjä jo kirjautunut
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    });

    // Kuuntele auth-muutoksia
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <Target className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Tervetuloa takaisin!
              </h2>
              <p className="text-gray-600">
                Kirjaudu sisään nähdäksesi relevantit pienhankintailmoitukset
              </p>
            </div>

            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#0ea5e9',
                      brandAccent: '#0284c7',
                    },
                  },
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Sähköposti',
                    password_label: 'Salasana',
                    email_input_placeholder: 'oma@yritys.fi',
                    password_input_placeholder: 'Salasanasi',
                    button_label: 'Kirjaudu sisään',
                    loading_button_label: 'Kirjaudutaan...',
                    social_provider_text: 'Kirjaudu {{provider}}',
                    link_text: 'Onko sinulla jo tili? Kirjaudu sisään',
                  },
                  sign_up: {
                    email_label: 'Sähköposti',
                    password_label: 'Salasana',
                    email_input_placeholder: 'oma@yritys.fi',
                    password_input_placeholder: 'Luo vahva salasana',
                    button_label: 'Rekisteröidy',
                    loading_button_label: 'Rekisteröidään...',
                    social_provider_text: 'Rekisteröidy {{provider}}',
                    link_text: 'Ei tiliä? Rekisteröidy',
                  },
                  forgotten_password: {
                    email_label: 'Sähköposti',
                    password_label: 'Salasana',
                    email_input_placeholder: 'oma@yritys.fi',
                    button_label: 'Lähetä palautuslinkki',
                    loading_button_label: 'Lähetetään...',
                    link_text: 'Unohditko salasanasi?',
                  },
                },
              }}
              providers={[]}
              redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
            />

            <div className="mt-6 text-center text-sm text-gray-600">
              Rekisteröitymällä hyväksyt{' '}
              <a href="#" className="text-primary-600 hover:underline">
                käyttöehdot
              </a>{' '}
              ja{' '}
              <a href="#" className="text-primary-600 hover:underline">
                tietosuojaselosteen
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
