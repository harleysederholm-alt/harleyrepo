'use client';

import { useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import products from '@/lib/products.json';

export default function HomePage() {
  useEffect(() => {
    // Lataa Snipcart-skripti dynamiisesti ja initialisoi se
    if (window.Snipcart) {
      window.Snipcart.setup();
    }
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tervetuloa <span className="text-primary-600">Moderni Kauppaan</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Etsi laadukkaita tuotteita siististä valikoimasta. Turvallinen maksaminen
            Snipcartin kautta, nopea toimitus ja palautusoikeus 30 päivään.
          </p>
        </div>
      </section>

      {/* Tuotegalleria */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Tuotteet
          </h3>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            Valitse haluamasi tuotteet ja lisää ne ostoskoriin. Kaikki tuotteet toimitetaan
            nopeasti ja turvallisesti.
          </p>

          {/* Tuoteruudukko */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Edut */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Miksi valita meidät?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h4 className="text-xl font-semibold mb-2">Nopea toimitus</h4>
              <p className="text-gray-600">
                Tilaukset käsitellään 24 tunnissa ja tuotteet toimitetaan ripeästi.
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="text-xl font-semibold mb-2">Turvallinen maksaminen</h4>
              <p className="text-gray-600">
                Käytämme Snipcartin varmennettua maksupalvelua. Tietosi ovat suojassa.
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">↩️</div>
              <h4 className="text-xl font-semibold mb-2">Palautusoikeus</h4>
              <p className="text-gray-600">
                Palautuspalvelu 30 päivää. Jos tuote ei miellytä, palauta se ilmaisesti.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
