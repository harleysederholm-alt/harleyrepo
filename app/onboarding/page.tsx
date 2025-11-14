'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { APP_NAME, KUNNAT, TOIMIALAT } from '@/lib/constants';
import { Target, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [paikkakunnat, setPaikkakunnat] = useState<string[]>([]);
  const [toimialat, setToimialat] = useState<string[]>([]);
  const [aiProfiiliKuvaus, setAiProfiiliKuvaus] = useState('');

  useEffect(() => {
    // Tarkista auth ja olemassa oleva profiili
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Tarkista onko profiili jo täytetty
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.ai_profiili_kuvaus) {
        // Profiili jo olemassa, ohjaa dashboardiin
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleToggle = (
    value: string,
    list: string[],
    setter: (list: string[]) => void
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('Sessio vanhentunut. Kirjaudu uudelleen.');
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          paikkakunnat,
          toimialat,
          ai_profiili_kuvaus: aiProfiiliKuvaus,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // Onnistui! Ohjaa dashboardiin
      router.push('/dashboard');
    } catch (error) {
      console.error('Virhe tallennettaessa:', error);
      alert('Virhe tallennettaessa. Yritä uudelleen.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          </div>
        </div>
      </header>

      {/* Onboarding Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center ${
                    s < 3 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        step > s ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>Paikkakunnat</span>
              <span>Toimialat</span>
              <span>Profiili</span>
            </div>
          </div>

          {/* Step 1: Paikkakunnat */}
          {step === 1 && (
            <div className="card animate-fade-in">
              <h2 className="text-2xl font-bold mb-2">
                Missä kunnissa toimitte?
              </h2>
              <p className="text-gray-600 mb-6">
                Valitse kunnat, joiden hankintailmoituksia haluat seurata.
                Voit valita useita.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {KUNNAT.map((kunta) => (
                  <button
                    key={kunta}
                    onClick={() =>
                      handleToggle(kunta, paikkakunnat, setPaikkakunnat)
                    }
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      paikkakunnat.includes(kunta)
                        ? 'border-primary-600 bg-primary-50 text-primary-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{kunta}</span>
                      {paikkakunnat.includes(kunta) && (
                        <CheckCircle2 className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={paikkakunnat.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Seuraava
              </button>
            </div>
          )}

          {/* Step 2: Toimialat */}
          {step === 2 && (
            <div className="card animate-fade-in">
              <h2 className="text-2xl font-bold mb-2">Mikä on toimialanne?</h2>
              <p className="text-gray-600 mb-6">
                Valitse toimialat, jotka parhaiten kuvaavat yritystänne.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {TOIMIALAT.map((toimiala) => (
                  <button
                    key={toimiala}
                    onClick={() =>
                      handleToggle(toimiala, toimialat, setToimialat)
                    }
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      toimialat.includes(toimiala)
                        ? 'border-primary-600 bg-primary-50 text-primary-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{toimiala}</span>
                      {toimialat.includes(toimiala) && (
                        <CheckCircle2 className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">
                  Takaisin
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={toimialat.length === 0}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Seuraava
                </button>
              </div>
            </div>
          )}

          {/* Step 3: AI-profiilikuvaus (TÄRKEIN!) */}
          {step === 3 && (
            <div className="card animate-fade-in">
              <h2 className="text-2xl font-bold mb-2">
                Kerro yrityksestänne
              </h2>
              <p className="text-gray-600 mb-2">
                Tämä on <strong>tärkein vaihe!</strong> Kirjoita vapaamuotoisesti
                yrityksestänne. AI käyttää tätä kuvausta löytääkseen sinulle
                sopivimmat hankinnat.
              </p>
              <p className="text-sm text-primary-700 mb-6 bg-primary-50 p-3 rounded-lg">
                💡 <strong>Vinkki:</strong> Mainitse yrityksen koko,
                erikoisosaamisalueesi, aiemmat projektit, rajoitukset (esim.
                "emme tee sisämaalauksia") ja muut tärkeät asiat.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yrityksen kuvaus
                </label>
                <textarea
                  value={aiProfiiliKuvaus}
                  onChange={(e) => setAiProfiiliKuvaus(e.target.value)}
                  placeholder="Esimerkki: Olemme 3 hengen maalausliike Vantaalta. Erikoistuneita ulkomaalaustyöhön ja vain yksityisille asiakkaille. Meillä on 10 vuoden kokemus ja kaikki tarvittavat sertifioinnit. Emme tee sisämaalauksia emmekä korkeita kohteita (yli 2 kerrosta)."
                  className="textarea"
                  rows={8}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {aiProfiiliKuvaus.length} / 500+ merkkiä (mitä enemmän, sen
                  parempi!)
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1">
                  Takaisin
                </button>
                <button
                  onClick={handleSave}
                  disabled={aiProfiiliKuvaus.length < 50 || saving}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Tallennetaan...' : 'Valmis! →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
