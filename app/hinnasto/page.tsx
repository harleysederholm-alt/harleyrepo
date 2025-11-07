import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import {
  Target,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  Crown,
} from 'lucide-react';

export default function HinnastoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          </Link>
          <Link href="/login" className="btn-primary">
            Aloita ilmaiseksi
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Selkeä hinnoittelu ilman yllätyksiä
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Aloita ilmaiseksi. Päivitä kun olet valmis. Ei piilokustannuksia.
              Peruuta milloin vain.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-6 w-6 text-gray-600" />
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">0€</span>
                <span className="text-gray-600">/kk</span>
              </div>
              <p className="text-gray-600 mb-6">
                Kokeile palvelua ilmaiseksi. Näet hankinnat 24h viiveellä.
              </p>

              <Link
                href="/login"
                className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center block mb-8"
              >
                Aloita ilmaiseksi
              </Link>

              <div className="space-y-4 flex-1">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Mitä saat:
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">
                      Pääsy hankintailmoituksiin{' '}
                      <strong className="text-yellow-700">24h viiveellä</strong>
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">
                      Perushaku ja filtterit (kunta, toimiala)
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">
                      Pääset tutustumaan käyttöliittymään
                    </span>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 line-through">
                      AI-osuvuuspisteet
                    </span>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 line-through">
                      AI-tiivistelmät ja riskianalyysit
                    </span>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 line-through">
                      Deadline-hälytykset
                    </span>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 line-through">
                      AI-Tarjousapuri
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Plan (POPULAR) */}
            <div className="bg-white rounded-xl shadow-2xl border-4 border-primary-600 p-8 flex flex-col relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  SUOSITUIN
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-primary-600">
                  19.90€
                </span>
                <span className="text-gray-600">/kk</span>
              </div>
              <p className="text-gray-600 mb-6">
                Reaaliaikaiset liidit + AI-analyysi. Pienyrittäjän paras valinta.
              </p>

              <Link
                href="/login"
                className="w-full btn-primary flex items-center justify-center mb-8"
              >
                Aloita Pro-tasolla
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <div className="space-y-4 flex-1">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Kaikki Free-tason ominaisuudet, plus:
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 font-medium">
                      ⚡ Reaaliaikaiset hankintailmoitukset (ei viivettä!)
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 font-medium">
                      🎯 AI-osuvuuspisteet (0-100%) jokaiselle hankinnalle
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 font-medium">
                      📝 AI-tiivistelmät ja riskianalyysit (Groq)
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 font-medium">
                      🔔 Deadline-hälytykset
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 font-medium">
                      💾 Tallenna hakuvahdit
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 font-medium">
                      📧 Sähköposti-ilmoitukset uusista hankinnois ta
                    </span>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 line-through">
                      AI-Tarjousapuri
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agentti Plan */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg border-2 border-purple-300 p-8 flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="h-6 w-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900">Agentti</h3>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-purple-600">
                  49.90€
                </span>
                <span className="text-gray-600">/kk</span>
              </div>
              <p className="text-gray-600 mb-6">
                Täysi AI-valta. Agentti kirjoittaa tarjouspohjan puolestasi.
              </p>

              <Link
                href="/login"
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center block mb-8"
              >
                Aloita Agentti-tasolla
              </Link>

              <div className="space-y-4 flex-1">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Kaikki Pro-tason ominaisuudet, plus:
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 font-medium">
                      🤖 AI-Tarjousapuri (Premium-ominaisuus!)
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">
                      Agentti luo tarjouspohjan (sähköpostiluonnoksen)
                      automaattisesti
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">
                      Pohja perustuu hankintailmoitukseen ja yrityksesi
                      profiiliin
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">
                      Sinä täytät vain hinnan (ei hinta-arvioita AI:lta)
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">
                      Säästä 5-10 tuntia viikossa tarjousten kirjoittamisessa
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">
                      Prioriteettituki
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Usein kysytyt kysymykset
            </h3>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Miksi Free-tasolla on 24h viive?
                </h4>
                <p className="text-gray-600">
                  Haluamme antaa sinulle mahdollisuuden kokeilla palvelua
                  ilmaiseksi. 24h viive varmistaa, että Pro-tason käyttäjät
                  saavat kilpailuedun ja pääsevät jättämään tarjouksen
                  ensimmäisinä. Free-taso on täydellinen tutustumiseen ja pieniin
                  yrityksiin, jotka eivät tarvitse reaaliaikaista dataa.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Voinko vaihtaa tasoa milloin tahansa?
                </h4>
                <p className="text-gray-600">
                  Kyllä! Voit päivittää tai alentaa tasoa milloin tahansa. Päivitys
                  tapahtuu välittömästi, ja alennuksessa laskutuskausi jatkuu
                  normaalisti.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Mitä maksutapoja hyväksytte?
                </h4>
                <p className="text-gray-600">
                  Hyväksymme kaikki yleiset maksukortit (Visa, Mastercard,
                  American Express) Stripen kautta. Kaikki maksut ovat
                  turvallisia ja PCI DSS -yhteensopivia.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Voinko peruuttaa milloin tahansa?
                </h4>
                <p className="text-gray-600">
                  Kyllä, ei sitoutumista! Voit peruuttaa milloin tahansa
                  asetuksista. Saat käyttää palvelua laskutuskauden loppuun asti.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Miten AI-Tarjousapuri toimii?
                </h4>
                <p className="text-gray-600">
                  Agentti-tason AI-Tarjousapuri lukee hankintailmoituksen ja
                  yrityksesi profiilin, ja kirjoittaa ammattisen tarjouspohjan
                  (sähköpostiluonnoksen). Sinun tarvitsee vain täyttää hinta ja
                  lähettää. Huom: AI ei koskaan ehdota hintaa (juridinen riski).
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-primary-600 rounded-2xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Valmis aloittamaan?
            </h3>
            <p className="text-xl text-primary-100 mb-8">
              Aloita ilmaiseksi tänään. Ei luottokorttia tarvita.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg shadow-lg"
            >
              Aloita ilmaiseksi
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 {APP_NAME}. Kaikki oikeudet pidätetään.</p>
          <p className="text-sm mt-2 text-gray-500">
            Tehty ❤️ suomalaisille pienyrittäjille
          </p>
        </div>
      </footer>
    </div>
  );
}
