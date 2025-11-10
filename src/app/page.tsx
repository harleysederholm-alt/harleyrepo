import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🎯 Toimipaikka-analysaattori</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-blue-600">
              Kirjaudu
            </Link>
            <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Rekisteröidy
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 py-20 text-white text-center">
        <h2 className="text-5xl font-bold mb-4">
          Löydä paras sijainti liiketoiminnallesi
        </h2>
        <p className="text-2xl mb-8">
          Älä arvaa, vaan tiedä. Tekoälyn avulla.
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            🚀 Aloita Ilmaiseksi
          </Button>
        </Link>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
            <p className="text-3xl mb-2">📊</p>
            <h3 className="text-xl font-semibold mb-2">Väestödata</h3>
            <p className="text-sm text-gray-100">
              Analysoi alueen väestötietoja, ikäjakaumaa ja ostovoima-indeksiä
            </p>
          </div>

          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
            <p className="text-3xl mb-2">🔍</p>
            <h3 className="text-xl font-semibold mb-2">Kilpailuanalyysi</h3>
            <p className="text-sm text-gray-100">
              Tunnista kilpailijat ja arvioi kilpailun intensiteettiä
            </p>
          </div>

          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
            <p className="text-3xl mb-2">⚡</p>
            <h3 className="text-xl font-semibold mb-2">Tekoälyn pisteytys</h3>
            <p className="text-sm text-gray-100">
              Saata yhdellä numerolla kaikki tieto sijainnin potentiaalista
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div>
            <p className="text-4xl font-bold">1000+</p>
            <p className="text-sm text-gray-100 mt-2">Analysoitua sijaintia</p>
          </div>
          <div>
            <p className="text-4xl font-bold">500+</p>
            <p className="text-sm text-gray-100 mt-2">Tyytyväistä käyttäjää</p>
          </div>
          <div>
            <p className="text-4xl font-bold">95%</p>
            <p className="text-sm text-gray-100 mt-2">Ennustetarkkuus</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-800 text-white text-center py-6 mt-20">
        <p>&copy; 2024 Toimipaikka-analysaattori. Kaikki oikeudet pidätetään.</p>
      </footer>
    </div>
  )
}
