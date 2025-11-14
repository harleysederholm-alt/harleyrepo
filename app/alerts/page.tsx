'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Bell, BellOff, Mail, ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';

interface AlertRule {
  id?: string;
  user_id: string;
  name: string;
  criteria: {
    keywords?: string[];
    categories?: string[];
    min_budget?: number;
    max_budget?: number;
    organizations?: string[];
    min_match_score?: number;
  };
  notification_method: 'email' | 'in_app' | 'both';
  enabled: boolean;
  created_at?: string;
}

export default function AlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [alerts, setAlerts] = useState<AlertRule[]>([]);

  // Form state for new alert
  const [showNewAlertForm, setShowNewAlertForm] = useState(false);
  const [newAlertName, setNewAlertName] = useState('');
  const [newAlertKeywords, setNewAlertKeywords] = useState('');
  const [newAlertMinScore, setNewAlertMinScore] = useState(70);
  const [newAlertMethod, setNewAlertMethod] = useState<'email' | 'in_app' | 'both'>('email');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
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

      // Load alerts from database (table doesn't exist yet, this is a placeholder)
      // TODO: Create alert_rules table in Supabase
      // For now, show demo alerts
      setAlerts([
        {
          id: '1',
          user_id: session.user.id,
          name: 'Korkean osuvuuden hankinnat',
          criteria: {
            min_match_score: 80,
          },
          notification_method: 'email',
          enabled: true,
        },
        {
          id: '2',
          user_id: session.user.id,
          name: 'Suuret hankinnat',
          criteria: {
            min_budget: 50000,
          },
          notification_method: 'both',
          enabled: true,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlertName.trim()) {
      alert('Anna hälytykselle nimi');
      return;
    }

    setSaving(true);

    try {
      // Parse keywords
      const keywords = newAlertKeywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const newAlert: AlertRule = {
        user_id: userId,
        name: newAlertName,
        criteria: {
          keywords: keywords.length > 0 ? keywords : undefined,
          min_match_score: newAlertMinScore,
        },
        notification_method: newAlertMethod,
        enabled: true,
      };

      // TODO: Save to database
      // For now, just add to local state
      setAlerts([...alerts, { ...newAlert, id: Date.now().toString() }]);

      // Reset form
      setNewAlertName('');
      setNewAlertKeywords('');
      setNewAlertMinScore(70);
      setShowNewAlertForm(false);

      alert('✓ Hälytys luotu!');
    } catch (error) {
      console.error('Error:', error);
      alert('Virhe hälytyksen luomisessa');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAlert = async (alertId: string) => {
    // TODO: Update in database
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän hälytyksen?')) {
      return;
    }

    // TODO: Delete from database
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
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
            <h1 className="text-2xl font-bold text-gray-900">Hälytykset</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Info Card */}
          <div className="card mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <Mail className="h-6 w-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Sähköposti-ilmoitukset
                </h3>
                <p className="text-sm text-blue-700">
                  Saat ilmoituksen osoitteeseen <strong>{email}</strong> kun uusia
                  hankintoja löytyy kriteerien perusteella.
                </p>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Bell className="h-6 w-6 text-primary-600 mr-2" />
                Aktiiviset hälytykset ({alerts.filter((a) => a.enabled).length})
              </h2>
              <button
                onClick={() => setShowNewAlertForm(!showNewAlertForm)}
                className="btn-primary text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Uusi hälytys
              </button>
            </div>

            {/* Alert List */}
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BellOff className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Ei aktiivisia hälytyksiä</p>
                <p className="text-sm mt-1">Luo ensimmäinen hälytyksesi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 ${
                      alert.enabled
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {alert.name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              alert.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {alert.enabled ? 'Aktiivinen' : 'Pois päältä'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {alert.criteria.min_match_score && (
                            <p>• Vähintään {alert.criteria.min_match_score}% osuvuus</p>
                          )}
                          {alert.criteria.keywords && (
                            <p>
                              • Avainsanat: {alert.criteria.keywords.join(', ')}
                            </p>
                          )}
                          {alert.criteria.min_budget && (
                            <p>
                              • Budjetti vähintään{' '}
                              {alert.criteria.min_budget.toLocaleString('fi-FI')} €
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Ilmoitustapa:{' '}
                            {alert.notification_method === 'email'
                              ? 'Sähköposti'
                              : alert.notification_method === 'in_app'
                              ? 'Sovellus'
                              : 'Molemmat'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleToggleAlert(alert.id!)}
                          className={`p-2 rounded-lg ${
                            alert.enabled
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={alert.enabled ? 'Poista käytöstä' : 'Ota käyttöön'}
                        >
                          {alert.enabled ? (
                            <Bell className="h-4 w-4" />
                          ) : (
                            <BellOff className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(alert.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Poista"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Alert Form */}
          {showNewAlertForm && (
            <div className="card border-2 border-primary-200">
              <h3 className="text-lg font-bold mb-4">Luo uusi hälytys</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hälytyksen nimi
                  </label>
                  <input
                    type="text"
                    value={newAlertName}
                    onChange={(e) => setNewAlertName(e.target.value)}
                    placeholder="Esim. Suuret maalaustyöt"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avainsanat (pilkulla eroteltu)
                  </label>
                  <input
                    type="text"
                    value={newAlertKeywords}
                    onChange={(e) => setNewAlertKeywords(e.target.value)}
                    placeholder="Esim. maalaus, julkisivu, saneeraus"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vähimmäisosuvuus: {newAlertMinScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newAlertMinScore}
                    onChange={(e) => setNewAlertMinScore(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ilmoitustapa
                  </label>
                  <select
                    value={newAlertMethod}
                    onChange={(e) =>
                      setNewAlertMethod(e.target.value as 'email' | 'in_app' | 'both')
                    }
                    className="input"
                  >
                    <option value="email">Sähköposti</option>
                    <option value="in_app">Sovelluksessa</option>
                    <option value="both">Molemmat</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowNewAlertForm(false)}
                    className="btn-ghost flex-1"
                  >
                    Peruuta
                  </button>
                  <button
                    onClick={handleCreateAlert}
                    disabled={saving || !newAlertName.trim()}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Luodaan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Luo hälytys
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feature Note */}
          <div className="card bg-yellow-50 border-yellow-200 mt-6">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tulossa pian:</strong> Hälytyshistoria, lisää suodatusvaihtoehtoja
              ja Slack/Teams-integraatiot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
