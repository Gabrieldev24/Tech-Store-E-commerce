'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterState {
  categories: string[];
  priceRanges: string[];
  discountRanges: string[];
}

interface ProductFiltersProps {
  categories: string[];
  priceRanges: { min: number; max: number; label: string }[];
  discountRanges: { min: number; label: string }[];
  onFilterChange: (filters: FilterState) => void;
  selectedFilters: FilterState;
}

export function ProductFilters({
  categories,
  priceRanges,
  discountRanges,
  onFilterChange,
  selectedFilters,
}: ProductFiltersProps) {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    discount: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedFilters.categories.includes(category)
      ? selectedFilters.categories.filter(c => c !== category)
      : [...selectedFilters.categories, category];
    onFilterChange({ ...selectedFilters, categories: newCategories });
  };

  const handlePriceChange = (priceRange: string) => {
    const newPrices = selectedFilters.priceRanges.includes(priceRange)
      ? selectedFilters.priceRanges.filter(p => p !== priceRange)
      : [...selectedFilters.priceRanges, priceRange];
    onFilterChange({ ...selectedFilters, priceRanges: newPrices });
  };

  const handleDiscountChange = (discountRange: string) => {
    const newDiscounts = selectedFilters.discountRanges.includes(discountRange)
      ? selectedFilters.discountRanges.filter(d => d !== discountRange)
      : [...selectedFilters.discountRanges, discountRange];
    onFilterChange({ ...selectedFilters, discountRanges: newDiscounts });
  };

  const clearFilters = () => {
    onFilterChange({ categories: [], priceRanges: [], discountRanges: [] });
  };

  return (
    <div className="w-full bg-card rounded-lg border border-border p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('filters')}</h2>
        {(selectedFilters.categories.length > 0 ||
          selectedFilters.priceRanges.length > 0 ||
          selectedFilters.discountRanges.length > 0) && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:underline"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="mb-6 border-b border-border pb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex w-full items-center justify-between text-foreground hover:text-primary"
        >
          <span className="font-semibold">Categoría</span>
          {expandedSections.categories ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {expandedSections.categories && (
          <div className="mt-4 space-y-3">
            {categories.map(category => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedFilters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <span className="text-sm text-foreground">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-6 border-b border-border pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex w-full items-center justify-between text-foreground hover:text-primary"
        >
          <span className="font-semibold">{t('price')}</span>
          {expandedSections.price ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {expandedSections.price && (
          <div className="mt-4 space-y-3">
            {priceRanges.map((range, idx) => (
              <label
                key={`${range.min}-${range.max}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedFilters.priceRanges.includes(
                    `${range.min}-${range.max}`
                  )}
                  onCheckedChange={() =>
                    handlePriceChange(`${range.min}-${range.max}`)
                  }
                />
                <span className="text-sm text-foreground">{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Discount Filter */}
      <div>
        <button
          onClick={() => toggleSection('discount')}
          className="flex w-full items-center justify-between text-foreground hover:text-primary"
        >
          <span className="font-semibold">{t('discount')}</span>
          {expandedSections.discount ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {expandedSections.discount && (
          <div className="mt-4 space-y-3">
            {discountRanges.map((range, idx) => (
              <label
                key={`discount-${idx}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedFilters.discountRanges.includes(
                    `${range.min}`
                  )}
                  onCheckedChange={() => handleDiscountChange(`${range.min}`)}
                />
                <span className="text-sm text-foreground">{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
