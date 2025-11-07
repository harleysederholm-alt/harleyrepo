'use client';

import { useState } from 'react';
import { createCheckoutSession } from '@/app/actions/subscriptionActions';
import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: number;
  features: readonly string[];
  isCurrentPlan?: boolean;
  isFree?: boolean;
  isPro?: boolean;
  isAgent?: boolean;
  planType?: 'PRO' | 'AGENT';
}

export default function PricingCard({
  name,
  price,
  features,
  isCurrentPlan = false,
  isFree = false,
  isPro = false,
  isAgent = false,
  planType,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!planType) return;

    setLoading(true);
    const result = await createCheckoutSession(planType);

    if (result.error) {
      alert(result.error);
      setLoading(false);
      return;
    }

    if (result.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg p-8 ${
        isAgent ? 'border-4 border-blue-500 transform scale-105' : 'border border-gray-200'
      }`}
    >
      {isAgent && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
            Suosituin
          </span>
        </div>
      )}

      {/* Plan Name */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-extrabold text-gray-900">{price.toFixed(2)}</span>
          <span className="text-xl text-gray-500 ml-2">€/kk</span>
        </div>
        {isFree && <p className="text-sm text-gray-500 mt-2">Ilmainen ikuisesti</p>}
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div className="mt-auto">
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full py-3 px-6 rounded-lg bg-gray-100 text-gray-500 font-semibold cursor-not-allowed"
          >
            Nykyinen tilaus
          </button>
        ) : isFree ? (
          <a
            href="/login"
            className="block w-full py-3 px-6 rounded-lg bg-gray-100 text-gray-900 font-semibold text-center hover:bg-gray-200 transition"
          >
            Aloita ilmaiseksi
          </a>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
              isAgent
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Ladataan...' : 'Valitse tilaus'}
          </button>
        )}
      </div>
    </div>
  );
}
