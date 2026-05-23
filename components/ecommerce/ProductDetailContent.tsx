'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Truck, Shield, RotateCcw, ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/data/productsDb';

interface ProductDetailContentProps {
  product: Product;
  allProducts: Product[];
}

export function ProductDetailContent({ product, allProducts }: ProductDetailContentProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expandSpecs, setExpandSpecs] = useState(false);

  const allImages = [product.image, ...(product.additionalImages || [])];
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    addItem(product, quantity);
    router.push('/checkout');
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/products" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6">
          <ArrowLeft className="h-4 w-4" />
          {t('backToProducts')}
        </Link>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('home')}
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('products')}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image Gallery */}
          <div>
            <div className="relative mb-4 overflow-hidden rounded-lg bg-muted aspect-square group">
              <img
                src={allImages[selectedImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {discountPercent > 0 && (
                <div className="absolute right-4 top-4 rounded-full bg-destructive px-4 py-2 font-bold text-destructive-foreground">
                  -{discountPercent}%
                </div>
              )}
              
              {/* Image Navigation Arrows */}
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/70"
                title="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/70"
                title="Siguiente imagen"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-20 w-20 flex-shrink-0 cursor-pointer rounded-lg border-2 overflow-hidden bg-muted transition-colors ${
                    selectedImageIndex === index ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Brand & Title */}
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">{product.category}</p>
              <h1 className="text-3xl font-bold text-foreground mt-2">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-muted-foreground'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-foreground font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews} {t('reviews')})</span>
            </div>

              {/* Pricing Section */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-foreground">S/ {product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">S/ {product.originalPrice.toFixed(2)}</span>
                      <span className="text-sm font-bold text-destructive bg-destructive/10 px-3 py-1 rounded">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
              </div>

            {/* Description */}
            <div className="border-t border-border pt-6">
              <p className="text-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4 border-t border-border pt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">{t('quantity')}:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-l border-r border-border bg-background text-foreground py-2"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-semibold"
              >
                {product.inStock ? t('addToCart') : t('outOfStock')}
              </Button>

              <Button 
                onClick={handleBuyNow}
                disabled={!product.inStock}
                variant="outline" 
                className="w-full py-6 text-lg font-semibold"
              >
                {t('buyNow')}
              </Button>
            </div>

            {/* Stock Status */}
            <div className="rounded-lg bg-secondary/50 p-4 text-sm">
              {product.inStock ? (
                <p className="text-green-600 font-medium">{t('inStock')}</p>
              ) : (
                <p className="text-destructive font-medium">{t('outOfStockDetail')}</p>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{t('freeShipping')}</p>
                  <p className="text-sm text-muted-foreground">{t('freeShippingDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{t('securePurchase')}</p>
                  <p className="text-sm text-muted-foreground">{t('securePurchaseDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{t('easyReturn')}</p>
                  <p className="text-sm text-muted-foreground">{t('easyReturnDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specs && product.specs.length > 0 && (
          <div className="mt-12 rounded-lg border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('specifications')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.specs.slice(0, expandSpecs ? undefined : 6).map((spec, index) => {
                const [key, value] = spec.split(':').map(s => s.trim());
                return (
                  <div key={index} className="flex justify-between py-3 border-b border-border last:border-b-0">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="text-foreground font-medium">{value}</span>
                  </div>
                );
              })}
            </div>
            {product.specs.length > 6 && (
              <Button 
                variant="outline" 
                className="mt-6 flex items-center gap-2"
                onClick={() => setExpandSpecs(!expandSpecs)}
              >
                {expandSpecs ? (
                  <>
                    {t('showLessSpecs')}
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {t('showMoreSpecs')}
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Related Products Section */}
        {(() => {
          const relatedProducts = allProducts.filter(
            p => p.category === product.category && p.id !== product.id
          );
          
          if (relatedProducts.length === 0) {
            return null;
          }

          return (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('alsoInterested')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map(relatedProduct => (
                  <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                    <div className="rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                      <div className="relative overflow-hidden bg-muted aspect-square">
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="h-full w-full object-cover hover:scale-105 transition-transform"
                        />
                        {relatedProduct.originalPrice && (
                          <div className="absolute right-2 top-2 rounded bg-destructive px-3 py-1 text-sm font-bold text-destructive-foreground">
                            -{Math.round(((relatedProduct.originalPrice - relatedProduct.price) / relatedProduct.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h3 className="font-semibold text-foreground line-clamp-2">{relatedProduct.name}</h3>
                        <div className="mt-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-foreground">S/ {relatedProduct.price.toFixed(2)}</span>
                            {relatedProduct.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">S/ {relatedProduct.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{relatedProduct.category}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
