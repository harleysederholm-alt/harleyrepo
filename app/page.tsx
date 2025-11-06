import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { ArrowRight, Target, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          </div>
          <Link href="/login" className="btn-primary">
            Kirjaudu sisään
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary-50 to-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Löydä relevantit pienhankintamahdollisuudet
              <br />
              <span className="text-primary-600">automaattisesti</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              PienHankinta-Vahti käyttää tekoälyä analysoimaan ja suodattamaan
              pienhankintailmoituksia kunnista ja kaupungeista.
              Keskity tarjousten tekemiseen – me hoidamme etsinnän.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login" className="btn-primary flex items-center">
                Aloita ilmaiseksi <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Miksi PienHankinta-Vahti?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="flex justify-center mb-4">
                  <Zap className="h-12 w-12 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  Automaattinen seuranta
                </h4>
                <p className="text-gray-600">
                  Järjestelmä tarkistaa kuntien sivut automaattisesti 30 minuutin välein.
                  Sinun ei tarvitse tehdä mitään.
                </p>
              </div>

              <div className="card text-center">
                <div className="flex justify-center mb-4">
                  <Target className="h-12 w-12 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  AI-pohjainen suodatus
                </h4>
                <p className="text-gray-600">
                  Groq AI analysoi jokaisen hankinnan ja laskee osuvuusprosentin
                  profiiliisi. Näet vain relevantit liidiit.
                </p>
              </div>

              <div className="card text-center">
                <div className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Riskianalyysi</h4>
                <p className="text-gray-600">
                  AI tunnistaa automaattisesti lyhyet määräajat, epätavalliset
                  vaatimukset ja muut riskit.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 {APP_NAME}. Kaikki oikeudet pidätetään.</p>
          <p className="text-sm mt-2">
            Tehty ❤️ suomalaisille pienyrittäjille
          </p>
        </div>
      </footer>
    </div>
  );
}
