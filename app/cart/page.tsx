'use client';

import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { useCart } from '@/lib/context/CartContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { t } = useTranslation();

  const taxRate = 0.1;
  const tax = total * taxRate;
  const shipping = items.length > 0 ? (total > 50 ? 0 : 10) : 0;
  const finalTotal = total + tax + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Page Header */}
      <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-foreground">{t('shoppingCart')}</h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6 text-5xl">🛒</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('emptyCart')}</h2>
              <p className="text-muted-foreground mb-8">
                Agrega algunos productos para comenzar con tu pedido.
              </p>
              <Link href="/">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('continueShopping')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {items.map(item => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 rounded-lg border border-border bg-card p-4"
                    >
                      {/* Product Image */}
                      <div className="h-24 w-24 flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <Link href={`/product/${item.product.id}`}>
                          <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4">{item.product.category}</p>
                        <p className="text-lg font-bold text-foreground">
                          S/ {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2 border border-border rounded-lg bg-muted">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-lg border border-border bg-muted/50 p-6 h-fit">
                <h2 className="text-xl font-bold text-foreground mb-6">{t('orderSummary')}</h2>
                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('subtotal')}</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('tax')} (10%)</span>
                    <span>S/ {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('shipping')}</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-accent font-medium">{t('freeShip')}</span>
                      ) : (
                        `S/ ${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>
                <div className="mb-6 flex justify-between">
                  <span className="font-bold text-foreground">{t('total')}</span>
                  <span className="text-2xl font-bold text-primary">
                    S/ {finalTotal.toFixed(2)}
                  </span>
                </div>
                <Link href="/checkout" className="w-full block">
                  <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-3">
                    {t('proceedToCheckout')}
                  </Button>
                </Link>
                <Link href="/" className="w-full block">
                  <Button size="lg" variant="outline" className="w-full">
                    {t('continueShopping')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
