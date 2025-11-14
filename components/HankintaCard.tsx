'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink, TrendingUp } from 'lucide-react';
import { formatDateFi, daysUntil, formatMatchPercentage } from '@/lib/utils';
import type { Hankinta, Profile } from '@/types/database.types';

interface HankintaCardProps {
  hankinta: Hankinta;
  profile: Profile | null;
  onClick: () => void;
}

export default function HankintaCard({
  hankinta,
  profile,
  onClick,
}: HankintaCardProps) {
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Laske AI-osuvuusprosentti (vain PRO ja AGENT käyttäjille)
    const calculateMatch = async () => {
      // Free plan: ei AI-osuvuusprosenttia
      if (profile?.plan === 'free') {
        setLoading(false);
        setMatchPercentage(null);
        return;
      }

      if (!profile?.ai_profile_description || !hankinta.ai_summary) {
        setLoading(false);
        return;
      }

      try {
        // Kutsu Groq API:a Server Actionin kautta
        const response = await fetch('/api/calculate-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profiili: profile.ai_profile_description,
            ai_summary: hankinta.ai_summary,
          }),
        });

        if (!response.ok) throw new Error('API virhe');

        const data = await response.json();
        setMatchPercentage(data.match || 50); // Fallback 50%
      } catch (error) {
        console.error('Virhe laskettaessa osuvuutta:', error);
        setMatchPercentage(50); // Fallback
      } finally {
        setLoading(false);
      }
    };

    calculateMatch();
  }, [profile, hankinta]);

  const daysLeft = hankinta.deadline ? daysUntil(hankinta.deadline) : null;
  const matchInfo =
    matchPercentage !== null ? formatMatchPercentage(matchPercentage) : null;

  return (
    <div
      onClick={onClick}
      className="card-hover cursor-pointer relative overflow-hidden"
    >
      {/* AI-osuvuusbadge */}
      <div className="absolute top-3 right-3">
        {loading ? (
          <div className="animate-pulse bg-gray-200 rounded-full h-12 w-12"></div>
        ) : profile?.plan === 'free' ? (
          <div className="flex flex-col items-center bg-gray-100 rounded-lg p-2">
            <div className="text-2xl font-bold text-gray-400">
              🔒
            </div>
            <div className="text-xs text-gray-500">Pro+</div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div
              className={`text-2xl font-bold ${matchInfo?.color || 'text-gray-700'}`}
            >
              {matchPercentage !== null ? `${matchPercentage}%` : '?'}
            </div>
            <div className="text-xs text-gray-500">osuvuus</div>
          </div>
        )}
      </div>

      {/* Otsikko */}
      <h3 className="text-lg font-semibold mb-3 pr-16 line-clamp-2">
        {hankinta.title}
      </h3>

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          <span>{hankinta.organization}</span>
        </div>

        {hankinta.deadline && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>
              {formatDateFi(hankinta.deadline)}
              {daysLeft !== null && (
                <span
                  className={`ml-2 font-semibold ${
                    daysLeft <= 7
                      ? 'text-red-600'
                      : daysLeft <= 14
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  ({daysLeft > 0 ? `${daysLeft} pv` : 'Päättynyt'})
                </span>
              )}
            </span>
          </div>
        )}

        {hankinta.category && (
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
            <span className="badge-primary">{hankinta.category}</span>
          </div>
        )}
      </div>

      {/* Tiivistelmä (lyhyt esikatselu) */}
      {hankinta.ai_summary && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {hankinta.ai_summary}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-primary-600 font-medium hover:underline">
          Näytä lisää →
        </span>
        {matchInfo && (
          <span className={`badge ${matchInfo.badge} text-xs`}>
            {matchInfo.label}
          </span>
        )}
      </div>
    </div>
  );
}
