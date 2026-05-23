import { products } from '@/lib/data/productsDb';
import type { Product } from '@/lib/data/productsDb';

export interface PriceRange {
  min: number;
  max: number;
  label: string;
}

export interface DiscountRange {
  min: number;
  label: string;
}

export function extractCategories(): string[] {
  const categories = new Set<string>();
  products.forEach(product => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  return Array.from(categories).sort();
}

export function getPriceRanges(): PriceRange[] {
  return [
    { min: 0, max: 50, label: 'Menos de S/ 50.00' },
    { min: 50, max: 100, label: 'S/ 50.00 - S/ 100.00' },
    { min: 100, max: 250, label: 'S/ 100.00 - S/ 250.00' },
    { min: 250, max: 500, label: 'S/ 250.00 - S/ 500.00' },
    { min: 500, max: 1000, label: 'S/ 500.00 - S/ 1,000.00' },
    { min: 1000, max: 2000, label: 'S/ 1,000.00 - S/ 2,000.00' },
    { min: 2000, max: 5000, label: 'S/ 2,000.00 - S/ 5,000.00' },
    { min: 5000, max: Infinity, label: 'Mayor de S/ 5,000.00' },
  ];
}

export function getDiscountRanges(): DiscountRange[] {
  return [
    { min: 20, label: '20% dcto. o más' },
    { min: 30, label: '30% dcto. o más' },
    { min: 40, label: '40% dcto. o más' },
    { min: 50, label: '50% dcto. o más' },
    { min: 60, label: '60% dcto. o más' },
  ];
}

export function calculateDiscount(price: number, originalPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function filterProducts(
  products: Product[],
  selectedCategories: string[],
  selectedPriceRanges: string[],
  selectedDiscounts: string[],
  searchQuery: string = ''
): Product[] {
  return products.filter(product => {
    // Filter by search query
    if (
      searchQuery &&
      !product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(product.category)) {
        return false;
      }
    }

    // Filter by price ranges
    if (selectedPriceRanges.length > 0) {
      const priceRanges = getPriceRanges();
      const matchesPrice = selectedPriceRanges.some(rangeStr => {
        const [minStr, maxStr] = rangeStr.split('-');
        const min = parseInt(minStr);
        const max = parseInt(maxStr);
        return product.price >= min && product.price <= max;
      });
      if (!matchesPrice) return false;
    }

    // Filter by discount
    if (selectedDiscounts.length > 0) {
      const discount = calculateDiscount(product.price, product.originalPrice);
      const matchesDiscount = selectedDiscounts.some(discountStr => {
        const minDiscount = parseInt(discountStr);
        return discount >= minDiscount;
      });
      if (!matchesDiscount) return false;
    }

    return true;
  });
}
