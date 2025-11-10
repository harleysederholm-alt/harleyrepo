import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Moderni Kauppa',
    template: `%s | Moderni Kauppa`,
  },
  description: 'Moderni verkkokauppa - Etsi tuotteit siististä valikoimasta ja maksa turvallisesti.',
  keywords: [
    'kauppa',
    'verkkokauppa',
    'e-commerce',
    'suomi',
    'tuotteet',
  ],
  authors: [{ name: 'Moderni Kauppa' }],
  creator: 'Moderni Kauppa',
  openGraph: {
    type: 'website',
    locale: 'fi_FI',
    siteName: 'Moderni Kauppa',
    title: 'Moderni Kauppa',
    description: 'Moderni verkkokauppa - Etsi tuotteit siististä valikoimasta',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <head>
        {/* Snipcart CSS */}
        <link rel="preconnect" href="https://cdn.snipcart.com" />
        <link
          rel="stylesheet"
          href="https://cdn.snipcart.com/themes/v3.2.0/default/snipcart.css"
        />
      </head>
      <body className={inter.className}>
        {/* Snipcart Script */}
        <Script
          src="https://cdn.snipcart.com/themes/v3.2.0/default/snipcart.js"
          strategy="lazyOnload"
        />
        <div
          id="snipcart"
          data-api-key="YOUR_SNIPCART_API_KEY"
          hidden
        />

        <div className="min-h-screen flex flex-col">
          {/* Header ja Ostoskori-painike */}
          <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-primary-600">🛍️ Moderni Kauppa</h1>
              <button
                className="btn-primary snipcart-checkout"
                aria-label="Ostoskori"
              >
                🛒 Ostoskori
              </button>
            </div>
          </header>

          {/* Pääsisältö */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-8">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; 2025 Moderni Kauppa. Kaikki oikeudet pidätetään.</p>
              <p className="text-sm text-gray-400 mt-2">
                Turvallinen maksaminen Snipcartin kautta ✓
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
