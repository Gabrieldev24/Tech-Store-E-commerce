import dbData from './db.json';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  additionalImages?: string[];
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  specs?: string[];
  stock?: number;
}

export const products: Product[] = dbData.products.map((product: any) => ({
  ...product,
  stock: product.stock || 10,
  inStock: product.inStock !== false
}));

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}

export function getCategories(): string[] {
  const categories = new Set(products.map(p => p.category));
  return Array.from(categories).sort();
}

export function getProductsDB(): Product[] {
  return products;
}

export function filterProducts(
  searchQuery: string = '',
  category: string = 'All',
  minPrice: number = 0,
  maxPrice: number = Infinity,
  minRating: number = 0
): Product[] {
  return products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    const matchesRating = product.rating >= minRating;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });
}
