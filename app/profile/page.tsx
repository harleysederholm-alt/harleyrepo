'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User, Save, ArrowLeft, Shield, CreditCard } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/types/database.types';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string>('');

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [aiProfileDescription, setAiProfileDescription] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email || '');

      // Load profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setAiProfileDescription(profileData.ai_profile_description || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          ai_profile_description: aiProfileDescription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error saving profile:', error);
        alert('Virhe tallennettaessa: ' + error.message);
        return;
      }

      alert('✓ Profiili tallennettu onnistuneesti!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('Virhe tallennettaessa profiilia');
    } finally {
      setSaving(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      agent: 'bg-purple-100 text-purple-800',
    };
    return badges[plan as keyof typeof badges] || badges.free;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Takaisin dashboardiin
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Profiiliasetukset</h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Plan Info Card */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">Tilisi</h3>
                  <p className="text-sm text-gray-600">{email}</p>
                </div>
              </div>
              <span
                className={`badge text-sm font-semibold ${getPlanBadge(
                  profile?.plan || 'free'
                )}`}
              >
                {profile?.plan?.toUpperCase() || 'FREE'}
              </span>
            </div>

            {profile?.plan === 'free' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Päivitä Pro-tiliin
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Saat rajoittamattoman pääsyn kaikkiin hankintailmoituksiin ja
                      AI-ominaisuuksiin.
                    </p>
                    <Link href="/hinnasto" className="btn-primary text-sm">
                      Näytä hinnoittelu →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <div className="card">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-bold">Yritystiedot</h2>
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yrityksen nimi
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Esim. Maalaus Oy"
                  className="input"
                />
              </div>

              {/* AI Profile Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yrityksen profiili
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Tämä on <strong>tärkein kenttä!</strong> AI käyttää tätä kuvausta
                  löytääkseen sinulle sopivimmat hankinnat ja luomaan tarjousluonnoksia.
                </p>
                <textarea
                  value={aiProfileDescription}
                  onChange={(e) => setAiProfileDescription(e.target.value)}
                  placeholder="Esim. Olemme 3 hengen maalausliike Vantaalta. Erikoistuneita ulkomaalaustyöhön julkisille rakennuksille. Meillä on 10 vuoden kokemus ja kaikki tarvittavat sertifioinnit. Emme tee sisämaalauksia emmekä korkeita kohteita (yli 2 kerrosta)."
                  className="textarea"
                  rows={10}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {aiProfileDescription.length} / 500+ merkkiä
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Vinkki:</strong> Mainitse yrityksen koko,
                    erikoisosaamisalueesi, aiemmat projektit, rajoitukset ja muut
                    tärkeät asiat. Mitä tarkempi kuvaus, sen paremmat tulokset!
                  </p>
                </div>
              </div>

              {/* Stats */}
              {profile && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Tilastot</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Liittymispäivä:</span>
                      <p className="font-medium">
                        {new Date(profile.created_at).toLocaleDateString('fi-FI')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Päivitetty:</span>
                      <p className="font-medium">
                        {new Date(profile.updated_at).toLocaleDateString('fi-FI')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Onboarding:</span>
                      <p className="font-medium">
                        {profile.onboarding_completed ? '✓ Valmis' : 'Kesken'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tilauksen tila:</span>
                      <p className="font-medium">
                        {profile.subscription_status || 'Ei aktiivinen'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Link href="/dashboard" className="btn-ghost flex-1">
                  Peruuta
                </Link>
                <button
                  onClick={handleSave}
                  disabled={!aiProfileDescription || aiProfileDescription.length < 50 || saving}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Tallennetaan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Tallenna muutokset
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card mt-6 border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Vaaravyöhyke</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tilisi poistaminen on pysyvä toimenpide ja sitä ei voi perua.
            </p>
            <button
              onClick={() =>
                alert(
                  'Tilin poistaminen ei ole vielä käytettävissä. Ota yhteyttä tukeen.'
                )
              }
              className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
            >
              Poista tili
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
