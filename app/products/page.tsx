'use client';

import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { ProductFilters, FilterState } from '@/components/ecommerce/ProductFilters';
import { products } from '@/lib/data/productsDb';
import { useCart } from '@/lib/context/CartContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  extractCategories,
  getPriceRanges,
  getDiscountRanges,
  filterProducts as filterByFilters,
  calculateDiscount,
} from '@/lib/utils/filterUtils';

export default function ProductsPage() {
  const { addItem } = useCart();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRanges: [],
    discountRanges: [],
  });

  const categories = useMemo(() => extractCategories(), []);
  const priceRanges = useMemo(() => getPriceRanges(), []);
  const discountRanges = useMemo(() => getDiscountRanges(), []);

  const filteredProductsList = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      result = result.filter(product => {
        return filters.categories.includes(product.category);
      });
    }

    // Filter by price ranges
    if (filters.priceRanges.length > 0) {
      result = result.filter(product => {
        return filters.priceRanges.some(rangeStr => {
          const [minStr, maxStr] = rangeStr.split('-');
          const min = parseInt(minStr);
          const max = parseInt(maxStr);
          return product.price >= min && product.price <= max;
        });
      });
    }

    // Filter by discount
    if (filters.discountRanges.length > 0) {
      result = result.filter(product => {
        const discount = calculateDiscount(product.price, product.originalPrice);
        return filters.discountRanges.some(discountStr => {
          const minDiscount = parseInt(discountStr);
          return discount >= minDiscount;
        });
      });
    }

    return result;
  }, [searchQuery, filters]);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addItem(product, 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Page Header */}
      <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('products')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('productCatalog')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full sm:w-80 flex-shrink-0">
              <ProductFilters
                categories={categories}
                priceRanges={priceRanges}
                discountRanges={discountRanges}
                selectedFilters={filters}
                onFilterChange={setFilters}
              />
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-6 text-sm text-muted-foreground">
                {typeof t('showingProducts') === 'function'
                  ? (t('showingProducts') as any)(filteredProductsList.length, products.length)
                  : `${filteredProductsList.length} de ${products.length}`}
              </div>
              {filteredProductsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                  {filteredProductsList.map(product => (
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
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">{t('noProductsFound')}</p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                  >
                    {t('clearSearch')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
