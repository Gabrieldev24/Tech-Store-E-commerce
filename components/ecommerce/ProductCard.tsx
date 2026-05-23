'use client';

import { Product } from '@/lib/data/products';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { user, toggleFavorite, isFavorite } = useAuth();
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    setIsAnimating(true);
    toggleFavorite(product.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const isFav = isFavorite(product.id);

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer flex flex-col h-full">
        <div className="relative mb-4 overflow-hidden rounded-lg bg-muted flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {discountPercent > 0 && (
            <div className="absolute right-2 top-2 rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground">
              -{discountPercent}%
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-sm font-semibold text-white">Out of Stock</span>
            </div>
          )}
          <button
            onClick={handleFavoriteClick}
            className={`absolute left-2 top-2 rounded-full p-2 transition-all duration-300 ${
              isFav
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/80 text-red-400 hover:bg-white hover:text-red-500 shadow-md'
            } ${isAnimating ? 'scale-110' : 'scale-100'} hover:scale-125`}
          >
            <Heart className={`h-5 w-5 ${isFav ? 'fill-white' : 'hover:fill-red-400'}`} />
          </button>
        </div>

        <div className="flex flex-col justify-between h-full space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground h-4">{product.category}</p>
            <h3 className="line-clamp-2 font-semibold text-foreground h-12">{product.name}</h3>

            <div className="flex items-center gap-1 h-5 mt-2">
              <span className="text-xs text-muted-foreground">★</span>
              <span className="text-sm font-medium text-foreground">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              S/ {product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                S/ {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
