'use client';

import { useState } from 'react';
import { X, Calendar, MapPin, ExternalLink, AlertTriangle, FileText, Sparkles } from 'lucide-react';
import { formatDateFi, daysUntil } from '@/lib/utils';
import type { Hankinta, Profile } from '@/types/database.types';
import { generateTarjousluonnos } from '@/app/actions';

interface HankintaModalProps {
  hankinta: Hankinta;
  profile: Profile | null;
  onClose: () => void;
}

export default function HankintaModal({
  hankinta,
  profile,
  onClose,
}: HankintaModalProps) {
  const daysLeft = hankinta.maarapaiva ? daysUntil(hankinta.maarapaiva) : null;
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);

  const handleGenerateProposal = async () => {
    if (!profile?.ai_profiili_kuvaus) {
      alert('Profiili puuttuu. Täytä profiilisi ensin.');
      return;
    }

    setGeneratingProposal(true);

    try {
      const result = await generateTarjousluonnos(
        hankinta,
        profile.ai_profiili_kuvaus
      );

      if (result.success && result.luonnos) {
        setProposal(result.luonnos);
      } else {
        alert(`Virhe: ${result.error || 'Tuntematon virhe'}`);
      }
    } catch (error) {
      console.error('Virhe tarjousluonnoksen generoinnissa:', error);
      alert('Virhe tarjousluonnoksen generoinnissa');
    } finally {
      setGeneratingProposal(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1 pr-8">
            <h2 className="text-2xl font-bold mb-2">{hankinta.otsikko}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{hankinta.kunta}</span>
              </div>
              {hankinta.maarapaiva && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
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
                        ({daysLeft > 0 ? `${daysLeft} päivää` : 'Päättynyt'})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Toimiala */}
          {hankinta.toimiala_ai && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Toimiala
              </h3>
              <span className="badge-primary">{hankinta.toimiala_ai}</span>
            </div>
          )}

          {/* AI-Tiivistelmä */}
          {hankinta.tiivistelma_ai && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                📝 AI-Tiivistelmä
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">
                  {hankinta.tiivistelma_ai}
                </p>
              </div>
            </div>
          )}

          {/* AI-Riskit */}
          {hankinta.riskit_ai && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Huomioitavaa (AI-analyysi)
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">
                  {hankinta.riskit_ai}
                </p>
              </div>
            </div>
          )}

          {/* Linkki alkuperäiseen */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Alkuperäinen ilmoitus
            </h3>
            <a
              href={hankinta.linkki_lahteeseen}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center"
            >
              Avaa kunnan sivulla <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>

          {/* Tarjousapuri (Premium-ominaisuus) */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-primary-600" />
                AI-Tarjousapuri
              </h3>
              <span className="badge bg-purple-100 text-purple-800 text-xs">
                Premium
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Generoi ammattimainen tarjousluonnos tämän hankinnan perusteella käyttäen AI:ta.
            </p>

            {!proposal ? (
              <button
                onClick={handleGenerateProposal}
                disabled={generatingProposal}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingProposal ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Generoidaan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 inline-block mr-2" />
                    Luo tarjousluonnos
                  </>
                )}
              </button>
            ) : (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-900">
                      ✅ Tarjousluonnos valmis!
                    </h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(proposal);
                        alert('Kopioitu leikepöydälle!');
                      }}
                      className="text-sm text-green-700 hover:underline"
                    >
                      Kopioi
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                    {proposal}
                  </pre>
                </div>
                <button
                  onClick={() => setProposal(null)}
                  className="btn-ghost w-full text-sm"
                >
                  Generoi uudelleen
                </button>
              </div>
            )}
          </div>

          {/* Raakadata (Debug - piilota tuotannossa) */}
          {process.env.NODE_ENV === 'development' && hankinta.raakadata && (
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-500 font-mono">
                [Debug] Raakadata
              </summary>
              <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
                {JSON.stringify(hankinta.raakadata, null, 2)}
              </pre>
            </details>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <button onClick={onClose} className="btn-secondary w-full">
            Sulje
          </button>
        </div>
      </div>
    </div>
  );
}
