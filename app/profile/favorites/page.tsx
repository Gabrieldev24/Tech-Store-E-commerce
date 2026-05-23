'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { ArrowLeft } from 'lucide-react';
import { getProductsDB } from '@/lib/data/productsDb';

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const allProducts = getProductsDB();
  const favoriteProducts = allProducts.filter(p => user.favorites?.includes(p.id));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/profile')}
          className="mb-6 text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atrás
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Favoritos</h1>
          <p className="text-muted-foreground mb-8">
            {favoriteProducts.length === 0
              ? 'No tienes productos guardados aún'
              : `Tienes ${favoriteProducts.length} producto${favoriteProducts.length !== 1 ? 's' : ''} guardado${favoriteProducts.length !== 1 ? 's' : ''}`}
          </p>

          {favoriteProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Aún no has agregado productos a favoritos.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Explorar Productos
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favoriteProducts.map((product) => (
                <div key={product.id} className="flex flex-col h-full">
                  <div className="flex-1">
                    <ProductCard product={product} />
                  </div>
                  <Button
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Ver Producto
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
