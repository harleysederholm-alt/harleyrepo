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
    // Laske AI-osuvuusprosentti
    const calculateMatch = async () => {
      if (!profile?.ai_profiili_kuvaus || !hankinta.tiivistelma_ai) {
        setLoading(false);
        return;
      }

      try {
        // Kutsu Groq API:a Server Actionin kautta
        const response = await fetch('/api/calculate-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profiili: profile.ai_profiili_kuvaus,
            tiivistelma: hankinta.tiivistelma_ai,
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

  const daysLeft = hankinta.maarapaiva ? daysUntil(hankinta.maarapaiva) : null;
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
        {hankinta.otsikko}
      </h3>

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          <span>{hankinta.kunta}</span>
        </div>

        {hankinta.maarapaiva && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>
              {formatDateFi(hankinta.maarapaiva)}
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

        {hankinta.toimiala_ai && (
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
            <span className="badge-primary">{hankinta.toimiala_ai}</span>
          </div>
        )}
      </div>

      {/* Tiivistelmä (lyhyt esikatselu) */}
      {hankinta.tiivistelma_ai && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {hankinta.tiivistelma_ai}
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
