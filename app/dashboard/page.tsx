'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';
import type { Profile, Hankinta } from '@/types/database.types';
import { Target, LogOut, Search, RefreshCw, Bell, Settings, LayoutDashboard, MapPin, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hankinnat, setHankinnat] = useState<Hankinta[]>([]);
  const [selectedHankinta, setSelectedHankinta] = useState<Hankinta | null>(null);

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'score'>('deadline');

  // Available filters
  const categories = ['Rakentaminen', 'LVI', 'Maalaus', 'Sähkö', 'Pihatyöt', 'Muut'];
  const regions = ['Uusimaa', 'Pirkanmaa', 'Varsinais-Suomi', 'Pohjois-Pohjanmaa', 'Päijät-Häme', 'Keski-Suomi', 'Pohjois-Savo', 'Lappi', 'Kanta-Häme'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Get or create profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      // If error and not just "no rows", throw it
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If no profile exists, create one (upsert to avoid conflicts)
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            plan: 'free'
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }
        profileData = newProfile;
      }

      // Check if onboarding is completed
      if (!profileData?.ai_profile_description && !profileData?.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      setProfile(profileData);

      // FREEMIUM LOGIC: 24h viive Free-käyttäjille
      const isPremium = profileData.plan === 'pro' || profileData.plan === 'agent';
      const timeLimit = isPremium
        ? new Date(0).toISOString() // Premium: Ei rajoitusta
        : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Free: 24h viive

      const { data: hankintaData, error: hankintaError } = await supabase
        .from('hankinnat')
        .select('*')
        .lte('published_at', timeLimit)
        .order('published_at', { ascending: false })
        .limit(isPremium ? 500 : 20); // Premium: 500, Free: 20

      if (hankintaError) throw hankintaError;

      // Add mock AI scores for demo (in real app, calculate via API)
      const dataWithScores = (hankintaData || []).map(h => ({
        ...h,
        ai_score: Math.floor(Math.random() * 30 + 65) // 65-95%
      }));

      setHankinnat(dataWithScores);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Virhe ladattaessa dataa');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Filter and sort hankinnat
  const filteredHankinnat = useMemo(() => {
    let filtered = hankinnat;

    // Category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(h => selectedCategories.has(h.category || 'Muut'));
    }

    // Region filter (using organization as proxy)
    if (selectedRegions.size > 0) {
      filtered = filtered.filter(h => {
        // Simple mapping - in production, have proper region data
        return selectedRegions.has('Uusimaa'); // Simplified for demo
      });
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(h =>
        h.title?.toLowerCase().includes(q) ||
        h.organization?.toLowerCase().includes(q) ||
        h.category?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'deadline') {
      filtered.sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
        return dateA - dateB;
      });
    } else if (sortBy === 'score') {
      filtered.sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));
    }

    return filtered;
  }, [hankinnat, selectedCategories, selectedRegions, searchQuery, sortBy]);

  // Metrics
  const avgScore = useMemo(() => {
    if (filteredHankinnat.length === 0) return 0;
    const sum = filteredHankinnat.reduce((acc, h) => acc + (h.ai_score || 0), 0);
    return Math.round(sum / filteredHankinnat.length);
  }, [filteredHankinnat]);

  const dueToday = useMemo(() => {
    const today = new Date().toDateString();
    return filteredHankinnat.filter(h => h.deadline && new Date(h.deadline).toDateString() === today).length;
  }, [filteredHankinnat]);

  const last24h = useMemo(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return filteredHankinnat.filter(h => new Date(h.published_at) > oneDayAgo).length;
  }, [filteredHankinnat]);

  const toggleCategory = (cat: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(cat)) {
      newSet.delete(cat);
    } else {
      newSet.add(cat);
    }
    setSelectedCategories(newSet);
  };

  const toggleRegion = (reg: string) => {
    const newSet = new Set(selectedRegions);
    if (newSet.has(reg)) {
      newSet.delete(reg);
    } else {
      newSet.add(reg);
    }
    setSelectedRegions(newSet);
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedRegions(new Set());
    setSearchQuery('');
    setSortBy('deadline');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Ei määräaikaa';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ladataan hankintoja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[520px] h-[520px] rounded-full blur-3xl opacity-20 bg-blue-200"></div>
        <div className="absolute -bottom-24 -left-24 w-[520px] h-[520px] rounded-full blur-3xl opacity-20 bg-blue-100"></div>
      </div>

      <div className="grid grid-cols-12 min-h-screen">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-white/80 backdrop-blur-sm border-r border-blue-100">
          <div className="px-5 py-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-700">{APP_NAME}</div>
              <div className="text-xs text-gray-500">B2B SaaS</div>
            </div>
          </div>

          <nav className="px-3 mt-2 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-blue-50 text-blue-700">
              <div className="w-9 h-9 rounded-md bg-blue-100 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Liidi-Feedi</div>
                <div className="text-xs text-gray-500">Uudet hankinnat</div>
              </div>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">{filteredHankinnat.length}</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50">
              <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Hälytykset</div>
                <div className="text-xs text-gray-500">Säädä kriteerit</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/onboarding')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50"
            >
              <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Asetukset</div>
                <div className="text-xs text-gray-500">Profiili</div>
              </div>
            </button>
          </nav>

          <div className="px-5 mt-8">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">Yhteenveto</div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tänään uusia</span>
                <span className="font-semibold">{last24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Määräaika tänään</span>
                <span className="font-semibold">{dueToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Keskim. osuvuus</span>
                <span className="font-semibold">{avgScore}%</span>
              </div>
            </div>
          </div>

          <div className="px-5 mt-8">
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
              <LogOut className="w-4 h-4" />
              Kirjaudu ulos
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <h1 className="text-2xl font-semibold text-gray-900">Liidi-Feedi</h1>
              <span className="hidden md:inline text-sm text-gray-500">Reaaliaikaiset pienhankinnat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Haku: nimi, kunta, avainsana…"
                  className="w-56 md:w-72 rounded-lg border border-blue-200 bg-white/70 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm hover:bg-blue-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Päivitä
              </button>
            </div>
          </header>

          {/* Premium Banner for Free Users */}
          {profile && profile.plan === 'free' && (
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Free-tilaus: 24h viive hankinta-aineistossa
                  </h3>
                  <p className="text-blue-100 text-sm mb-3">
                    Näet hankinnat 24 tunnin viiveellä. Päivitä Pro-tasolle nähdäksesi hankinnat heti ja käyttääksesi AI-ominaisuuksia.
                  </p>
                  <a
                    href="/hinnasto?paywall=true"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition"
                  >
                    Päivitä Pro-tasolle
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <section className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl p-5 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Toimiala</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition ${
                        selectedCategories.has(cat)
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Alue</label>
                <div className="flex flex-wrap gap-2">
                  {regions.slice(0, 4).map(reg => (
                    <button
                      key={reg}
                      onClick={() => toggleRegion(reg)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition ${
                        selectedRegions.has(reg)
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg border border-blue-200 text-gray-700 hover:bg-blue-50 text-sm"
                >
                  Tyhjennä
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Live
              </span>
              <span>Suodatettuja tuloksia: <strong className="text-gray-700">{filteredHankinnat.length}</strong></span>
            </div>
          </section>

          {/* Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-500">Keskim. AI-Osuvuus</div>
              <div className="mt-2 flex items-end gap-2">
                <div className="text-2xl font-semibold text-gray-900">{avgScore}%</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${avgScore}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-500">Määräaika tänään</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{dueToday}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-500">Uusia viime 24h</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{last24h}</div>
            </div>
          </section>

          {/* Feed Controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">
              Järjestä:
              <button
                onClick={() => setSortBy('deadline')}
                className={`ml-2 ${sortBy === 'deadline' ? 'text-blue-700 font-semibold' : 'text-blue-600 hover:underline'}`}
              >
                Määräaika
              </button>
              {' • '}
              <button
                onClick={() => setSortBy('score')}
                className={`${sortBy === 'score' ? 'text-blue-700 font-semibold' : 'text-blue-600 hover:underline'}`}
              >
                Osuvuus
              </button>
            </div>
            <div className="text-xs text-gray-500">Klikkaa korttia nähdäksesi lisätiedot</div>
          </div>

          {/* Feed */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {filteredHankinnat.length === 0 ? (
              <div className="col-span-full bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl p-12 text-center shadow-sm">
                <p className="text-gray-600 mb-2">Ei hankintoja valituilla kriteereillä.</p>
                <p className="text-sm text-gray-500">Kokeile muuttaa suodattimia tai tyhjennä valinnat.</p>
              </div>
            ) : (
              filteredHankinnat.map((hankinta) => (
                <article
                  key={hankinta.id}
                  onClick={() => setSelectedHankinta(hankinta)}
                  className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">{hankinta.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">
                      {hankinta.category || 'Muut'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{hankinta.organization}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(hankinta.deadline)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                            style={{ width: `${hankinta.ai_score || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-800 rounded-full font-semibold">
                          {hankinta.ai_score || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </main>
      </div>

      {/* Modal */}
      {selectedHankinta && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center p-4 z-50"
          onClick={() => setSelectedHankinta(null)}
        >
          <div
            className="w-full md:max-w-2xl bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Hankinta</div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedHankinta.title}</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">{selectedHankinta.category || 'Muut'}</span>
                  <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md">{selectedHankinta.organization}</span>
                  <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">Määräaika: {formatDate(selectedHankinta.deadline)}</span>
                  <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">AI-Osuvuus: {selectedHankinta.ai_score}%</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedHankinta(null)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">AI-Tiivistelmä</h3>
                <p className="text-sm text-gray-700">{selectedHankinta.ai_summary || 'Ei tiivistelmää saatavilla.'}</p>
              </div>
              {selectedHankinta.ai_analysis && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Riskit ja huomiot</h3>
                  <p className="text-sm text-gray-700">{selectedHankinta.ai_analysis}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Toimenpiteet</h3>
                <div className="flex flex-col md:flex-row gap-2">
                  <button className="px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                    Merkitse kiinnostavaksi
                  </button>
                  {selectedHankinta.linkki_lahteeseen && (
                    <a
                      href={selectedHankinta.linkki_lahteeseen}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-lg border border-blue-200 hover:bg-blue-50 text-sm text-center"
                    >
                      Avaa tarjouspyyntö
                    </a>
                  )}
                  <button className="px-4 py-2.5 rounded-lg border border-blue-200 hover:bg-blue-50 text-sm">
                    Jaa tiimille
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
