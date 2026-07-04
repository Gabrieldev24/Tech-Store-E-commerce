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

  // --- INICIO CÓDIGO DEL CARRUSEL ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = ['/1.jpg', '/2.jpg', '/3.jpg']; // Tus 3 imágenes en la carpeta public

  // Efecto para que las imágenes pasen solas cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  // --- FIN CÓDIGO DEL CARRUSEL ---

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
    {/* Hero Image (Carrusel Automático) */}
          <div className="relative h-96 lg:h-full min-h-96 overflow-hidden rounded-2xl shadow-2xl group border border-border/50">
            
            {/* Contenedor que se desliza */}
            <div 
              className="flex h-full w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
      {heroSlides.map((slide, index) => (
                // 🔥 Le agregamos bg-gray-50 o bg-white para que se funda con tu imagen
                <div key={index} className="h-full w-full flex-shrink-0 relative bg-gray-50 flex items-center justify-center p-2">
                  <img 
                    src={slide} 
                    alt={`Promoción TechStore ${index + 1}`} 
                    // 🔥 LA MAGIA: Cambiamos object-cover por object-contain
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Los 3 circulitos de navegación */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-10">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 shadow-md ${
                    currentSlide === index 
                      ? 'bg-primary w-8' // El circulito activo se vuelve una "pastilla" de color
                      : 'bg-white/80 w-3 hover:bg-white' 
                  }`}
                  aria-label={`Ir a la promoción ${index + 1}`}
                />
              ))}
            </div>

            {/* Flechas laterales (Opcionales, aparecen al pasar el mouse) */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/80 text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/80 text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

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
