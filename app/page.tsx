import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import {
  ArrowRight,
  Target,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#ominaisuudet"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Ominaisuudet
            </Link>
            <Link
              href="/hinnasto"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Hinnasto
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Kirjaudu sisään
            </Link>
            <Link href="/login" className="btn-primary">
              Aloita ilmaiseksi
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                <span>AI-pohjainen hankintavalvonta suomalaisille yrittäjille</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Älä missaa yhtään{' '}
                <span className="text-primary-600">pienhankintaa</span>
                <br />
                koskaan enää
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                300+ Suomen kuntaa julkaisee pienhankintoja verkkosivuillaan –{' '}
                <strong>ei HILMA-portaalissa</strong>. Me seuraamme niitä 24/7 ja
                lähetämme sinulle vain <strong>sinulle sopivat</strong> liidit.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/login"
                  className="btn-primary flex items-center justify-center text-lg px-8 py-4"
                >
                  Aloita ilmaiseksi – Ei luottokorttia
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/hinnasto"
                  className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-lg"
                >
                  Katso hinnoittelu
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Ei sitoutumista</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Aloitus 2 minuutissa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>GDPR-yhteensopiva</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tiedätkö kuinka monta sopivaa hankintaa menetit viime viikolla?
              </h3>
              <p className="text-xl text-gray-600">
                Suomen kunnat julkaisevat <strong>tuhansia pienhankintoja</strong>{' '}
                vuosittain (alle 60 000€), jotka{' '}
                <strong className="text-red-600">
                  eivät ole HILMA-portaalissa
                </strong>
                . Ne ovat piilossa 300+ eri kunnan verkkosivuilla, PDF-tiedostoissa
                ja ilmoitustauluilla.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Aikaa hukkaan</h4>
                <p className="text-gray-600">
                  Yrittäjät käyttävät <strong>10-20 tuntia viikossa</strong>{' '}
                  manuaaliseen hankintailmoitusten etsintään
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Menetetyt liidit</h4>
                <p className="text-gray-600">
                  <strong>80% pienhankintailmoituksista</strong> jää huomaamatta,
                  koska ne eivät ole keskitetysti
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Epäreilua kilpailua</h4>
                <p className="text-gray-600">
                  Isommat yritykset käyttävät kalliita työkaluja ja saavat
                  kaikki liidit ensin
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ratkaisu: PienHankinta-Vahti "Solo-Stack"
              </h3>
              <p className="text-xl text-gray-600">
                Me hoitamme raskaan työn puolestasi. 24/7 automaattisella
                seurannalla ja AI-analytiikalla.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Kaivaja-Agentit */}
              <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl shadow-lg border border-primary-100">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-lg mb-6 mx-auto">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-center mb-4">
                  1. Kaivaja-Agentit
                </h4>
                <p className="text-gray-600 text-center mb-4">
                  n8n-automaatio skannaa <strong>300+ lähdettä</strong> 24/7.
                  Tämä on meidän "Ansaittu Vaiva" – sinun ei tarvitse tehdä mitään.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Seuraa kuntatiedotteita ja PDF-tiedostoja</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Tunnistaa uudet ilmoitukset automaattisesti</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Ei duplikaatteja</span>
                  </li>
                </ul>
              </div>

              {/* Jalostaja-Agentit */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl shadow-lg border border-purple-100">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-lg mb-6 mx-auto">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-center mb-4">
                  2. Jalostaja-Agentit (AI)
                </h4>
                <p className="text-gray-600 text-center mb-4">
                  <strong>Groq AI (Llama 3 70B)</strong> lukee PDF:t ja luo
                  tiivistelmät. Tämä on "Nollakustannuksen AI-Jalostus".
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Tiivistelmä jokaisesta hankinnasta</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Riskianalyysi (lyhyet määräajat, vaatimukset)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Osuvuuspisteytys profiiliisi (0-100%)</span>
                  </li>
                </ul>
              </div>

              {/* Sovellus */}
              <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-lg border border-green-100">
                <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-lg mb-6 mx-auto">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-center mb-4">
                  3. Sovellus (Sinulle)
                </h4>
                <p className="text-gray-600 text-center mb-4">
                  Pääsy jalostettuun, <strong>reaaliaikaiseen data-feediin</strong>.
                  Vain sopivat liidit, ei hälyä.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Dashboard, jossa näet vain relevantit hankinnat</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Deadline-hälytykset</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>AI-Tarjousapuri (Agentti-taso)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="ominaisuudet" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Miksi PienHankinta-Vahti?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <Zap className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  Automaattinen seuranta 24/7
                </h4>
                <p className="text-gray-600">
                  Järjestelmä tarkistaa kuntien sivut jatkuvasti. Sinun ei tarvitse
                  tehdä mitään.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <Target className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  AI oppii yrityksesi profiilista
                </h4>
                <p className="text-gray-600">
                  Kerro kerran mitä teet, niin AI laskee osuvuusprosentin jokaiselle
                  hankinnalle (0-100%).
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <Shield className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Riskianalyysi</h4>
                <p className="text-gray-600">
                  AI tunnistaa automaattisesti lyhyet määräajat, epätavalliset
                  vaatimukset ja muut riskit.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Deadline-hälytykset</h4>
                <p className="text-gray-600">
                  Saat ilmoituksen kun sopiva hankinta on julkaistu ja kun määräaika
                  lähestyy.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <Sparkles className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  AI-Tarjousapuri (Premium)
                </h4>
                <p className="text-gray-600">
                  Agentti-taso luo tarjouspohjan puolestasi. Sinun tarvitsee vain
                  täyttää hinta.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Kasvata liiketoimintaa</h4>
                <p className="text-gray-600">
                  Saat pääsyn liideihin, joita kilpailijasi eivät löydä.
                  Vallihautamme on skreippausinfra.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Valmis löytämään seuraavan liidisi?
            </h3>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Liity satojen suomalaisten pienyrittäjien joukkoon, jotka käyttävät
              PienHankinta-Vahtia liidien löytämiseen.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg shadow-lg"
            >
              Aloita ilmaiseksi – Ei luottokorttia
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-8 w-8 text-primary-600" />
                <h3 className="text-xl font-bold text-white">{APP_NAME}</h3>
              </div>
              <p className="text-gray-400">
                Älykäs työkalu pienhankintamahdollisuuksien löytämiseen
                suomalaisille yrittäjille.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Linkit</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/hinnasto"
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    Hinnasto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    Kirjaudu sisään
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    Tuki
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Laki</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    Käyttöehdot
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    Tietosuojaseloste
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 {APP_NAME}. Kaikki oikeudet pidätetään.</p>
            <p className="text-sm mt-2 text-gray-500">
              Tehty ❤️ suomalaisille pienyrittäjille
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
