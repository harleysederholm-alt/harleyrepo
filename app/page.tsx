import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import {
  ArrowRight,
  Target,
  Zap,
  Shield,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Users,
  BarChart3,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/hinnasto" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:inline">
              Hinnoittelu
            </Link>
            <Link href="/login" className="btn-primary">
              Kirjaudu sisään
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20 md:py-32 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Aloita ilmaiseksi – Ei luottokorttia tarvita
              </div>

              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Löydä relevantit<br />
                <span className="text-primary-600">pienhankinta-mahdollisuudet</span><br />
                automaattisesti
              </h2>

              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Tekoäly seuraa 24/7 yli <span className="font-semibold text-gray-900">300 kunnan</span> hankintailmoituksia ja nostaa esiin vain sinulle sopivat tarjouspyynnöt.
                <span className="block mt-2 text-primary-600 font-medium">Säästä 10+ tuntia viikossa!</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/login"
                  className="btn-primary flex items-center justify-center text-lg px-8 py-4"
                >
                  Aloita ilmainen kokeilu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/hinnasto"
                  className="btn-secondary flex items-center justify-center text-lg px-8 py-4"
                >
                  Katso hinnoittelu
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Ei sitoutumisaikaa
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Peruuta milloin vain
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Suomalainen palvelu
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">300+</div>
                <div className="text-gray-600">Seurattavaa kuntaa</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
                <div className="text-gray-600">Automaattinen seuranta</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">30 min</div>
                <div className="text-gray-600">Päivitysväli</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
                <div className="text-gray-600">Osuvuustarkkuus</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Näin se toimii
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Kolme yksinkertaista vaihetta parempiin liiditöihin
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative">
                  <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold mb-6">
                      1
                    </div>
                    <h4 className="text-xl font-semibold mb-3">Luo profiili</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Kerro lyhyesti yrityksestäsi, toimialastasi ja mitä palveluita tarjoat. AI oppii ymmärtämään osaamisesi.
                    </p>
                  </div>
                  {/* Connecting line */}
                  <div className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-primary-200 -translate-y-1/2" />
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold mb-6">
                      2
                    </div>
                    <h4 className="text-xl font-semibold mb-3">AI tekee työn</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Järjestelmä seuraa automaattisesti kuntia, analysoi hankintailmoitukset ja laskee osuvuusprosentin.
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-primary-200 -translate-y-1/2" />
                </div>

                {/* Step 3 */}
                <div>
                  <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold mb-6">
                      3
                    </div>
                    <h4 className="text-xl font-semibold mb-3">Saat ilmoitukset</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Kun löytyy sinulle sopiva hankinta, saat välittömän ilmoituksen dashboardiin tai sähköpostiin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Deep Dive */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-4xl font-bold text-center mb-16 text-gray-900">
              Ominaisuudet jotka tekevät eron
            </h3>

            <div className="max-w-6xl mx-auto space-y-16">
              {/* Feature 1 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
                    <Zap className="h-4 w-4" />
                    Automaatio
                  </div>
                  <h4 className="text-3xl font-bold mb-4 text-gray-900">
                    Automaattinen 24/7 seuranta
                  </h4>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Järjestelmämme tarkistaa yli 300 kunnan hankintasivut joka 30. minuutti. Ei enää manuaalista selailua, ei unohdettuja ilmoituksia.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Kattaa kaikki merkittävät kunnat Suomessa</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Reaaliaikainen päivitys (Pro-tilaus)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Historiadata: näe myös menneet ilmoitukset</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-32 w-32 text-primary-600 mx-auto mb-4" />
                    <div className="text-5xl font-bold text-primary-600 mb-2">24/7</div>
                    <div className="text-gray-700 font-medium">Jatkuvaa seurantaa</div>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 flex items-center justify-center order-2 md:order-1">
                  <div className="text-center">
                    <Target className="h-32 w-32 text-primary-600 mx-auto mb-4" />
                    <div className="text-5xl font-bold text-primary-600 mb-2">95%</div>
                    <div className="text-gray-700 font-medium">Osuvuustarkkuus</div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
                    <Sparkles className="h-4 w-4" />
                    Tekoäly
                  </div>
                  <h4 className="text-3xl font-bold mb-4 text-gray-900">
                    AI-pohjainen suodatus ja pisteytys
                  </h4>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Groq AI (Llama 3.3 70B) analysoi jokaisen hankintailmoituksen ja vertaa sitä yritysprofiiliisi. Näet vain relevantit liidiit.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">0-100% osuvuusprosentti jokaiselle hankinnalle</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">AI-generoitu perustelu jokaiselle pisteytykselle</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Suodata näkymä minimiosuvuuden mukaan</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
                    <Shield className="h-4 w-4" />
                    Turvallisuus
                  </div>
                  <h4 className="text-3xl font-bold mb-4 text-gray-900">
                    Automaattinen riskianalyysi
                  </h4>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    AI tunnistaa riskit automaattisesti ja varoittaa sinua ajoissa. Vältä sudenkuopat ja keskity parhaimpiin mahdollisuuksiin.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Havaitsee lyhyet tarjousajat (alle 7 päivää)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Tunnistaa epätavalliset tai monimutkaiset vaatimukset</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Analysoi kilpailutilanteen ja arvioi voittomahdollisuudet</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="h-32 w-32 text-primary-600 mx-auto mb-4" />
                    <div className="text-gray-700 font-semibold text-xl">Älykäs riskianalyysi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-4xl font-bold text-center mb-4 text-gray-900">
              Asiakkaamme rakastavat meitä
            </h3>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Kuule mitä suomalaiset yrittäjät sanovat PienHankinta-Vahdista
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Säästän vähintään 10 tuntia viikossa kun en enää selaa kuntien sivuja manuaalisesti. AI löytää juuri meille sopivat hankinnat!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    MK
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Matti Korhonen</div>
                    <div className="text-sm text-gray-600">IT-konsultti, Helsinki</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Osuvuusprosentti on uskomattoman tarkka. Ei turhia liiditöitä, vain oikeasti relevantteja tarjouspyyntöjä. Suosittelen lämpimästi!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    LV
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Laura Virtanen</div>
                    <div className="text-sm text-gray-600">Kiinteistöhuolto Oy, Tampere</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Riskianalyysi on todella hyödyllinen. Näen heti mitkä hankinnat kannattaa skipata ja mihin keskittää aikaa. Paras investointi vuosiin!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    JL
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Jari Laine</div>
                    <div className="text-sm text-gray-600">Rakennuspalvelut, Oulu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-4xl font-bold mb-4 text-gray-900">
              Aloita ilmaiseksi tänään
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Ei luottokorttia. Ei sitoutumista. Peru milloin vain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/login"
                className="btn-primary flex items-center justify-center text-lg px-8 py-4"
              >
                Kokeile ilmaiseksi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/hinnasto"
                className="btn-secondary flex items-center justify-center text-lg px-8 py-4"
              >
                Katso hinnoittelu
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Yli 150 suomalaista yritystä käyttää jo PienHankinta-Vahtia
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-4xl font-bold text-center mb-16 text-gray-900">
              Usein kysytyt kysymykset
            </h3>
            <div className="max-w-3xl mx-auto space-y-6">
              <details className="bg-white rounded-lg p-6 shadow-sm">
                <summary className="font-semibold text-lg cursor-pointer text-gray-900">
                  Miten palvelu toimii ilmaisella tasolla?
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Ilmaisella tasolla näet kaikki hankinnat 24 tunnin viiveellä. Voit selata maksimissaan 20 uusinta hankintaa kerrallaan.
                  Tämä on täydellinen tapa tutustua palveluun ennen maksulliseen tilaukseen siirtymistä.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm">
                <summary className="font-semibold text-lg cursor-pointer text-gray-900">
                  Miten AI-pisteytys toimii?
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Groq AI (Llama 3.3 70B) analysoi jokaisen hankintailmoituksen ja vertaa sitä yritysprofiiliisi.
                  Se arvioi osuvuuden 0-100% asteikolla ja antaa kirjallisen perustelun pisteytykselle.
                  AI oppii jatkuvasti ja tarkentuu käytön myötä.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm">
                <summary className="font-semibold text-lg cursor-pointer text-gray-900">
                  Mitä kuntia palvelu seuraa?
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Seuraamme yli 300 suomalaista kuntaa ja kaupunkia. Kattavuus kattaa kaikki merkittävät kunnat
                  ja useimmat pienet kunnat. Lisäämme jatkuvasti uusia seurattavia kuntia.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm">
                <summary className="font-semibold text-lg cursor-pointer text-gray-900">
                  Voinko perua milloin tahansa?
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Kyllä! Kaikki tilaukset ovat kuukausittaisia ja voit perua milloin tahansa ilman peruutusmaksuja
                  tai sitoutumisaikoja. Jos perut, pääset käyttämään palvelua loppukuukauden ajan.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm">
                <summary className="font-semibold text-lg cursor-pointer text-gray-900">
                  Saanko tukea jos tarvitsen apua?
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Kyllä! Tarjoamme sähköpostituen kaikille käyttäjille. Pro ja Agent -tilausten
                  asiakkaat saavat prioriteettituen ja vastaamme 24 tunnin sisällä.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              Valmis löytämään parempia liiditöitä?
            </h3>
            <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
              Liity yli 150 suomalaisen yrityksen joukkoon jotka käyttävät
              PienHankinta-Vahtia päivittäin
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-white text-primary-600 hover:bg-gray-50 font-semibold text-lg px-10 py-4 rounded-lg transition-colors"
            >
              Aloita ilmainen kokeilu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-sm mt-6 opacity-75">
              Ei luottokorttia tarvita • Peru milloin vain • Suomalainen palvelu
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-6 w-6 text-primary-400" />
                <span className="font-bold text-white">{APP_NAME}</span>
              </div>
              <p className="text-sm text-gray-400">
                Älykäs työkalu pienhankinta-mahdollisuuksien löytämiseen suomalaisille yrittäjille.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Tuote</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/hinnasto" className="hover:text-white transition-colors">Hinnoittelu</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Kirjaudu sisään</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Yritys</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Tietoa meistä</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Yhteystiedot</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Juridiikka</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Käyttöehdot</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tietosuoja</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 {APP_NAME}. Kaikki oikeudet pidätetään.</p>
            <p className="mt-2 text-gray-400">
              Tehty ❤️ suomalaisille pienyrittäjille
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
