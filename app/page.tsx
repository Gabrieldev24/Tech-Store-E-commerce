'use client';

import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { ChatBotFloat } from '@/components/chatbot-float';
import { getProductsDB } from '@/lib/data/productsDb';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Truck, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PRODUCTS_PER_PAGE = 15;

export default function Home() {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const products = getProductsDB();

  // Redirect admin to dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addItem(product, 1);
    }
  };

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-primary">Ofertas por tiempo limitado</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance text-foreground">
                {t('premiumTech')} <br /> {t('forEveryone')}
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                {t('heroDesc')}
              </p>
              
            </div>

            {/* Hero Image */}
            <div className="relative h-96 lg:h-full min-h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
              <div className="relative h-full flex items-center justify-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🛍️</div>
                  <p className="text-muted-foreground">Compra Productos Tecnológicos Premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('freeShipping')}</h3>
                <p className="text-sm text-muted-foreground">{t('freeShippingDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('securePurchase')}</h3>
                <p className="text-sm text-muted-foreground">{t('securePurchaseDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('easyReturn')}</h3>
                <p className="text-sm text-muted-foreground">{t('easyReturnDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('featuredProducts')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('featuredDesc')}
              </p>
            </div>
            <Button 
              onClick={() => router.push('/')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t('viewAllProducts')}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 auto-rows-max">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="flex flex-col h-full">
                <div className="flex-1">
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </div>
                <Button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={!product.inStock}
                  className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {product.inStock ? t('addToCart') : t('outOfStock')}
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('previous')}
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className={currentPage === page ? 'bg-primary text-primary-foreground' : ''}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {t('next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
