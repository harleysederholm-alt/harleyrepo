'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader, Copy } from 'lucide-react';

type TabType = 'train' | 'generate';

interface BrandProfile {
  tone: string[];
  formality: number;
  sentence_structure: string;
  key_terminology: string[];
  negative_keywords: string[];
  vocabulary_level?: string;
  emotional_appeal?: string;
  writing_style?: string;
}

export default function BrandVoiceAI() {
  const [activeTab, setActiveTab] = useState<TabType>('train');
  const [exampleTexts, setExampleTexts] = useState('');
  const [promptText, setPromptText] = useState('');
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
  const TRAIN_WEBHOOK_PATH = 'd6bf33f3-5e99-4a36-9e52-8f3c6e8b2a1d';
  const GENERATE_WEBHOOK_PATH = 'a7cg44g4-6f00-5b47-0f63-9g4d7f9c3b2e';

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleTrainBrand = async () => {
    clearMessages();

    if (!exampleTexts.trim()) {
      setErrorMessage('Lisää vähintään yksi esimerkkiteksti');
      return;
    }

    setIsLoading(true);

    try {
      // Parse examples (separated by ----)
      const examples = exampleTexts
        .split('----')
        .map((text) => text.trim())
        .filter((text) => text.length > 0);

      const response = await fetch(`${API_BASE_URL}/${TRAIN_WEBHOOK_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_examples: examples,
          user_id: 'default', // In production, use actual user ID
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.profile) {
        // Parse the profile if it's a string
        const profile = typeof data.profile === 'string'
          ? JSON.parse(data.profile)
          : data.profile;
        setBrandProfile(profile);
        setSuccessMessage('✅ Brändiprofiili tallennettu onnistuneesti!');
      }
    } catch (error) {
      console.error('Error training brand:', error);
      setErrorMessage(
        error instanceof Error
          ? `Virhe: ${error.message}`
          : 'Virhe brändin kouluttamisessa. Tarkista n8n-konfiguraatio.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    clearMessages();

    if (!promptText.trim()) {
      setErrorMessage('Kirjoita pyynnön sisältö');
      return;
    }

    if (!brandProfile) {
      setErrorMessage('Kouluta ensin brändiprofiili "Kouluta Brändi"-välilehdellä');
      return;
    }

    setIsLoading(true);
    setResultText('');

    try {
      const response = await fetch(`${API_BASE_URL}/${GENERATE_WEBHOOK_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          user_id: 'default', // In production, use actual user ID
          brand_profile: brandProfile,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.generated_content) {
        setResultText(data.generated_content);
        setSuccessMessage('✅ Sisältö generoitu onnistuneesti!');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setErrorMessage(
        error instanceof Error
          ? `Virhe: ${error.message}`
          : 'Virhe sisällön generoinnissa. Tarkista n8n-konfiguraatio.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎯 Brändi-äänellä varustettu Tekoäly</h1>
          <p className="text-slate-300">Kouluta Claude oppimaan yrityksesi äänen ja generoi sisältöä automaattisesti</p>
        </div>

        {/* Alert Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-200">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('train')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'train'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            🎓 Kouluta Brändi
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            ✨ Generoi Sisältö
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8">
          {/* Train Tab */}
          {activeTab === 'train' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Esimerkkitekstit
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Liitä 5-10 esimerkkiä yrityksen teksteistä. Erota ne neljällä viivalla (----)
                </p>
                <textarea
                  value={exampleTexts}
                  onChange={(e) => setExampleTexts(e.target.value)}
                  placeholder={`Liitä esimerkkiteksti 1 tähän...

----

Liitä esimerkkiteksti 2 tähän...

----

Liitä esimerkkiteksti 3 tähän...`}
                  className="w-full h-64 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={handleTrainBrand}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Koulutetaan...
                  </>
                ) : (
                  '🚀 Tallenna Brändiprofiili'
                )}
              </button>

              {brandProfile && (
                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-300 mb-3">📊 Tallennettu Brändiprofiili</h3>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p><span className="font-medium text-blue-300">Sävy:</span> {brandProfile.tone?.join(', ')}</p>
                    <p><span className="font-medium text-blue-300">Muodollisuus:</span> {brandProfile.formality}/10</p>
                    <p><span className="font-medium text-blue-300">Lauserakenne:</span> {brandProfile.sentence_structure}</p>
                    <p><span className="font-medium text-blue-300">Avaintermit:</span> {brandProfile.key_terminology?.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Mitä haluat kirjoittaa?
                </label>
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Esim: LinkedIn-postaus uudesta tuotteesta, Instagram-story, asiakassähköposti..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={handleGenerateContent}
                disabled={isLoading || !brandProfile}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isLoading || !brandProfile
                    ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generoidaan...
                  </>
                ) : !brandProfile ? (
                  '⚠️ Kouluta ensin brändiprofiili'
                ) : (
                  '✨ Generoi Sisältö'
                )}
              </button>

              {resultText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Generoitu sisältö
                    </label>
                    <button
                      onClick={handleCopyToClipboard}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded flex items-center gap-2 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      {copySuccess ? 'Kopioitu!' : 'Kopioi'}
                    </button>
                  </div>
                  <textarea
                    value={resultText}
                    readOnly
                    className="w-full h-64 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none resize-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700 rounded-lg text-sm text-slate-400">
          <p>
            <span className="font-medium text-slate-300">💡 Vihje:</span> Paremmat esimerkkitekstit johtavat parempaan brändiprofiiliin.
            Käytä eri tyyppejä tekstejä: sosiaalisen median postauksia, sähköposteja, verkkosisältöä jne.
          </p>
        </div>
      </div>
    </div>
  );
}
