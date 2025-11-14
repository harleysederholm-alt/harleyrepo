'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';
import type { Profile, Hankinta } from '@/types/database.types';
import { Target, LogOut, User, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { formatDateFi, daysUntil, formatMatchPercentage } from '@/lib/utils';
import HankintaCard from '@/components/HankintaCard';
import HankintaModal from '@/components/HankintaModal';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hankinnat, setHankinnat] = useState<Hankinta[]>([]);
  const [selectedHankinta, setSelectedHankinta] = useState<Hankinta | null>(
    null
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // Tarkista auth
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        // Lataa profiili
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        if (!profileData?.ai_profiili_kuvaus) {
          // Profiili ei täytetty, ohjaa onboardingiin
          router.push('/onboarding');
          return;
        }

        setProfile(profileData);

        // Lataa hankinnat
        const { data: hankintaData, error: hankintaError } = await supabase
          .from('hankinnat')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (hankintaError) throw hankintaError;

        setHankinnat(hankintaData || []);
        setLoading(false);
      } catch (error) {
        console.error('Virhe ladattaessa dataa:', error);
        alert('Virhe ladattaessa dataa');
      }
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ladataan hankintoja...</p>
        </div>
      </div>
    );
  }

  // Suodata hankinnat käyttäjän paikkakunnilla
  const filteredHankinnat = hankinnat.filter((h) =>
    profile?.paikkakunnat?.includes(h.organization)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Kirjautuneena</p>
                <p className="font-medium">{profile?.id.slice(0, 8)}...</p>
              </div>
              <button onClick={handleLogout} className="btn-ghost">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Profiili-yhteenveto */}
        <div className="card mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tervetuloa!</h2>
              <p className="text-gray-600 mb-4">
                Seuraat hankintoja seuraavilla kriteereillä:
              </p>
            </div>
            <button
              onClick={() => router.push('/onboarding')}
              className="btn-ghost text-sm"
            >
              Muokkaa profiilia
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">
                Paikkakunnat ({profile?.paikkakunnat?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile?.paikkakunnat?.map((kunta) => (
                  <span key={kunta} className="badge-primary">
                    {kunta}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">
                Toimialat ({profile?.toimialat?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile?.toimialat?.map((toimiala) => (
                  <span key={toimiala} className="badge-primary">
                    {toimiala}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">
              Yrityksen profiili (AI käyttää tätä)
            </h3>
            <p className="text-sm text-gray-700">
              {profile?.ai_profiili_kuvaus}
            </p>
          </div>
        </div>

        {/* Hankinnat */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold">
            Uudet hankinnat ({filteredHankinnat.length})
          </h2>
          <p className="text-gray-600">
            AI on analysoinut nämä hankinnat ja laskenut osuvuusprosentin
            profiiliisi.
          </p>
        </div>

        {filteredHankinnat.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">
              Ei uusia hankintoja valitsemillasi paikkakunnilla.
            </p>
            <p className="text-sm text-gray-500">
              Tarkistamme sivut automaattisesti 30 minuutin välein.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHankinnat.map((hankinta) => (
              <HankintaCard
                key={hankinta.id}
                hankinta={hankinta}
                profile={profile}
                onClick={() => setSelectedHankinta(hankinta)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedHankinta && (
        <HankintaModal
          hankinta={selectedHankinta}
          profile={profile}
          onClose={() => setSelectedHankinta(null)}
        />
      )}
    </div>
  );
}
