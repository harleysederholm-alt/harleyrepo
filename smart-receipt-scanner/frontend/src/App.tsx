import React, { useState } from 'react';
import axios from 'axios';

interface ExtractedData {
  ostopaikka: string | null;
  paivays: string | null;
  summa_yhteensa: number | null;
  alv_prosentti: number | null;
  alv_summa: number | null;
}

interface ProcountorResponse {
  success: boolean;
  invoiceId: string | null;
  message: string;
}

const App: React.FC = () => {
  // Configuration - Replace these with your actual n8n webhook URLs
  const WEBHOOK_URL_VISION = process.env.REACT_APP_N8N_VISION_URL || 'https://your-n8n-instance.com/webhook/receipt-analyze';
  const WEBHOOK_URL_PROCOUNTOR = process.env.REACT_APP_N8N_PROCOUNTOR_URL || 'https://your-n8n-instance.com/webhook/procountor-submit';

  // State Management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [formData, setFormData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setErrorMessage('');
        setSuccessMessage('');
      } else {
        setErrorMessage('Valitse kuvatiedosto (PNG, JPG, GIF, WebP)');
      }
    }
  };

  // Extract receipt data using Claude Vision
  const handleExtractReceipt = async () => {
    if (!selectedFile) {
      setErrorMessage('Valitse kuva ensin');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('data', selectedFile);

      const response = await axios.post<ExtractedData>(WEBHOOK_URL_VISION, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      setExtractedData(data);
      setFormData(data);
      setShowPreview(true);
      setSuccessMessage('Kuitti luettu onnistuneesti!');
    } catch (error) {
      console.error('Error extracting receipt:', error);
      setErrorMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Virhe kuittia analysoitaessa. Tarkista webhook URL.'
          : 'Tuntematon virhe'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (field: keyof ExtractedData, value: string) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: field === 'paivays' ? value : field.includes('summa') || field.includes('alv_prosentti') ? (value ? parseFloat(value) : null) : value,
      };
    });
  };

  // Submit to Procountor
  const handleSubmitToProcountor = async () => {
    if (!formData) {
      setErrorMessage('Ei dataa lähetettäväksi');
      return;
    }

    // Validate required fields
    if (!formData.ostopaikka || !formData.paivays || formData.summa_yhteensa === null) {
      setErrorMessage('Täytä pakolliset kentät: Ostopaikka, Päiväys, Summa');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post<ProcountorResponse>(WEBHOOK_URL_PROCOUNTOR, formData);

      if (response.data.success) {
        setSuccessMessage(`✓ Lasku lähetetty onnistuneesti! Lasku ID: ${response.data.invoiceId}`);
        // Reset form
        setTimeout(() => {
          setSelectedFile(null);
          setExtractedData(null);
          setFormData(null);
          setShowPreview(false);
        }, 2000);
      } else {
        setErrorMessage(response.data.message || 'Virhe laskun lähettämisessä');
      }
    } catch (error) {
      console.error('Error submitting to Procountor:', error);
      setErrorMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Virhe Procountoriin lähettämisessä. Tarkista webhook URL ja Procountor API-avain.'
          : 'Tuntematon virhe'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset application state
  const handleReset = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setFormData(null);
    setShowPreview(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Älykäs Kuittiskanneri</h1>
          <p className="text-lg text-gray-600">Lue kuitti, tarkista tiedot, lähetä Procountoriin</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Step 1: File Upload */}
          {!showPreview && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Vaihe 1: Lataa kuitti</label>
                <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:border-indigo-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                    disabled={isLoading}
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <div className="text-5xl mb-3">📸</div>
                    <p className="text-gray-600 font-medium">
                      {selectedFile ? `Valittu: ${selectedFile.name}` : 'Klikkaa tai raahaa kuva tähän'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF, WebP - enintään 10 MB</p>
                  </label>
                </div>
              </div>

              {selectedFile && (
                <button
                  onClick={handleExtractReceipt}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Analysoidaan kuitista...
                    </span>
                  ) : (
                    '🔍 Lue Kuitti (Claude Vision)'
                  )}
                </button>
              )}
            </div>
          )}

          {/* Step 2: Review and Edit Form */}
          {showPreview && formData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Vaihe 2: Tarkista ja muokkaa tietoja</h2>
                <p className="text-sm text-gray-600 mb-6">Tarkista Claude:n analysoimat tiedot. Voit muokata kenttiä ennen lähettämistä.</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Ostopaikka */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ostopaikka *</label>
                  <input
                    type="text"
                    value={formData.ostopaikka || ''}
                    onChange={(e) => handleFormChange('ostopaikka', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="esim. K-Market Asematie"
                  />
                </div>

                {/* Päiväys */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Päiväys (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    value={formData.paivays || ''}
                    onChange={(e) => handleFormChange('paivays', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Summa */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Summa yhteensä (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.summa_yhteensa || ''}
                      onChange={(e) => handleFormChange('summa_yhteensa', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* ALV Prosentti */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ALV % </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.alv_prosentti || ''}
                      onChange={(e) => handleFormChange('alv_prosentti', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="24"
                    />
                  </div>
                </div>

                {/* ALV Summa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ALV Summa (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.alv_summa || ''}
                    onChange={(e) => handleFormChange('alv_summa', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
                >
                  🔄 Aloita alusta
                </button>
                <button
                  onClick={handleSubmitToProcountor}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Lähetetään...
                    </span>
                  ) : (
                    '✓ Lähetä Procountoriin'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p className="mb-2">💡 Älykäs Kuittiskanneri | Powered by Claude Vision + Procountor</p>
          <p className="text-gray-500">v1.0 - Tuotantovalmis SaaS-ratkaisu</p>
        </div>
      </div>
    </div>
  );
};

export default App;
