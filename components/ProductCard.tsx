'use client';

import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
      {/* Kuva */}
      <div className="relative h-48 bg-gray-200">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Sisältö */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Kategoria */}
        <div className="mb-2">
          <span className="badge-primary text-xs py-1 px-2 rounded">
            {product.category}
          </span>
        </div>

        {/* Tuotteen nimi */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>

        {/* Kuvaus */}
        <p className="text-gray-600 text-sm mb-4 flex-grow">
          {product.description}
        </p>

        {/* Hinta ja painike */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            {product.price.toFixed(2)}€
          </span>

          {/* Snipcart "Lisää ostoskoriin" -painike */}
          <button
            className="btn-primary text-sm py-2 px-3 whitespace-nowrap"
            data-item-id={product.id}
            data-item-name={product.name}
            data-item-price={product.price}
            data-item-url="/"
            data-item-image={product.image}
          >
            Lisää koriin
          </button>
        </div>
      </div>
    </div>
  );
}
