'use client';

import { useState } from 'react';
import { Send, Loader, AlertCircle, CheckCircle, MessageSquare, Lock } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ApiResponse {
  success: boolean;
  question: string;
  answer: string;
  timestamp: string;
  source: string;
}

export default function MyCashflowReporterPage() {
  const [apiKey, setApiKey] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Syötä MyCashflow API-avain');
      return;
    }
    setError('');
    setShowApiInput(false);
  };

  const handleChangeApiKey = () => {
    setShowApiInput(true);
    setApiKey('');
    setMessages([]);
    setQuestion('');
  };

  const sendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Kirjoita kysymys');
      return;
    }

    setError('');
    setLoading(true);

    // Lisää käyttäjän kysymys chatiin
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Lähettää kysymys n8n Webhook API:lle
      const response = await fetch(
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/mycashflow-reporter',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: apiKey,
            question: question,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API virhe: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      // Lisää assistentin vastaus chatiin
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setQuestion('');
    } catch (err) {
      setError(`Virhe: ${err instanceof Error ? err.message : 'Tuntematon virhe'}`);
      // Poista viimeisin käyttäjän viesti jos tapahtui virhe
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">MyCashflow Raportoija</h1>
          </div>
          <p className="text-slate-600">Kysy mitä tahansa omista myyntitiedoistasi suomeksi</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* API Key Section */}
        {showApiInput && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-blue-600">
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Yhdistä MyCashflow-kauppaasi</h2>
                <form onSubmit={handleApiKeySubmit} className="space-y-4">
                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-2">
                      MyCashflow API-avain
                    </label>
                    <input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Liitä MyCashflow API-avaimesi tähän"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      API-avaintasi ei säilytetä. Se lähetetään vain n8n-työnkulkuun analyysia varten.
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Yhdistä
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Chat Container */}
        {!showApiInput && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Kysy mitä tahansa omistasi</p>
                    <p className="text-sm mt-2">esim. "Mitkä tuotteet myyvät parhaiten?"</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl rounded-lg px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {new Date(message.timestamp).toLocaleTimeString('fi-FI', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-900 rounded-lg rounded-bl-none px-4 py-3 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analysoidaan...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* API Key Change Button */}
            {!showApiInput && (
              <div className="px-6 py-2 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={handleChangeApiKey}
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Vaihda API-avain
                </button>
              </div>
            )}

            {/* Input Area */}
            {!showApiInput && (
              <div className="border-t border-slate-200 bg-white p-4">
                <form onSubmit={sendQuestion} className="flex gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Esim. Mitkä tuotteet ostetaan useimmin yhdessä?"
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Turvallinen</h3>
            <p className="text-sm text-slate-600">API-avaimesi ei säilytetä</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Suomeksi</h3>
            <p className="text-sm text-slate-600">Ymmärrä tulokset äidinkielellään</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <Lock className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Nopea</h3>
            <p className="text-sm text-slate-600">Sekuntien sisällä saat vastauksen</p>
          </div>
        </div>
      </div>
    </div>
  );
}
