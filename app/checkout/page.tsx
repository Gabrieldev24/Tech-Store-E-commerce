'use client';

import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, addOrder } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  });

  const taxRate = 0.1;
  const tax = total * taxRate;
  const shipping = items.length > 0 ? (total > 50 ? 0 : 10) : 0;
  const finalTotal = total + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate card number - only numbers
    if (name === 'cardNumber') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 16) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    
    // Validate expiry date - MM/YY format
    if (name === 'cardExpiry') {
      let numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 4) {
        numericValue = numericValue.slice(0, 4);
      }
      if (numericValue.length >= 2) {
        const month = numericValue.slice(0, 2);
        const year = numericValue.slice(2, 4);
        setFormData(prev => ({ ...prev, [name]: `${month}/${year}` }));
      } else {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    
    // Validate CVC - only numbers
    if (name === 'cardCVC') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Validate phone - only numbers
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 15) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Validate zip code - only numbers
    if (name === 'zipCode') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Validate phone - only numbers and optional + symbol
    if (name === 'phone') {
      let phoneValue = value.replace(/[^\d+]/g, '');
      // Ensure + is only at the beginning
      if (phoneValue.includes('+')) {
        phoneValue = '+' + phoneValue.replace(/\+/g, '');
      }
      if (phoneValue.length <= 20) {
        setFormData(prev => ({ ...prev, [name]: phoneValue }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    if (!formData.lastName.trim()) {
      alert('Por favor ingresa tu apellido');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      alert('Por favor ingresa un email válido');
      return;
    }
    if (!formData.phone) {
      alert('Por favor ingresa tu teléfono');
      return;
    }
    if (!formData.address.trim()) {
      alert('Por favor ingresa tu dirección');
      return;
    }
    if (!formData.city.trim()) {
      alert('Por favor ingresa tu ciudad');
      return;
    }
    if (!formData.zipCode) {
      alert('Por favor ingresa tu código postal');
      return;
    }
    
    // Validate card expiry format
    if (!formData.cardExpiry.includes('/') || formData.cardExpiry.length !== 5) {
      alert('Por favor ingresa la fecha de vencimiento en formato MM/YY');
      return;
    }
    
    // Validate card number
    if (formData.cardNumber.length !== 16) {
      alert('Por favor ingresa un número de tarjeta válido (16 dígitos)');
      return;
    }
    
    // Validate CVC
    if (formData.cardCVC.length < 3) {
      alert('Por favor ingresa un CVC válido (3-4 dígitos)');
      return;
    }
    
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate order ID
    const orderId = `ORD-${Date.now()}`;

    // Store order data in localStorage (frontend only for now)
    const orderData = {
      id: orderId,
      date: new Date().toLocaleDateString(),
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
      items: items,
      subtotal: total,
      tax: tax,
      shipping: shipping,
      total: finalTotal,
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Add order to user's profile
    if (user) {
      addOrder(orderId);
    }

    clearCart();
    router.push('/success');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-8">Agrega artículos a tu carrito para proceder con el pago.</p>
            <Link href="/products">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Page Header */}
      <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-foreground">{t('checkoutTitle')}</h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Information */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">{t('shippingInformation')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('firstName')}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('lastName')}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('email')}</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('phone')}</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+51 999 999 999"
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        inputMode="tel"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">{t('address')}</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('city')}</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('state')}</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="NY"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">{t('zipCode')}</label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="12345"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">{t('paymentInformation')}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('cardNumber')}</label>
                      <input
                        type="text"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="4532 1234 5678 9010"
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={16}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('expiryDate')}</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          required
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          placeholder="05/27"
                          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          maxLength={5}
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('cvc')}</label>
                        <input
                          type="text"
                          name="cardCVC"
                          required
                          value={formData.cardCVC}
                          onChange={handleInputChange}
                          placeholder="123"
                          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          maxLength={4}
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Link href="/cart" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {t('backToCart')}
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {isProcessing ? 'Procesando...' : t('completePurchase')}
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-border bg-muted/50 p-6 h-fit">
              <h2 className="text-xl font-bold text-foreground mb-6">{t('orderSummary')}</h2>
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {item.product.name} <span className="font-medium">x{item.quantity}</span>
                    </span>
                    <span>S/ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
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
              <div className="flex justify-between">
                <span className="font-bold text-foreground">{t('total')}</span>
                <span className="text-2xl font-bold text-primary">
                  S/ {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
