'use client';

import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, addOrder } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSource = searchParams.get('source') || 'web';
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
  });

  const taxRate = 0.1;
  const tax = total * taxRate;
  const shipping = items.length > 0 ? (total > 50 ? 0 : 10) : 0;
  const finalTotal = total + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validación de teléfono
    if (name === 'phone') {
      let phoneValue = value.replace(/[^\d+]/g, '');
      if (phoneValue.includes('+')) {
        phoneValue = '+' + phoneValue.replace(/\+/g, '');
      }
      if (phoneValue.length <= 20) {
        setFormData(prev => ({ ...prev, [name]: phoneValue }));
      }
      return;
    }

    // Validación de código postal (solo números)
    if (name === 'zipCode') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones de envío completas
    if (!formData.firstName.trim()) { alert('Por favor ingresa tu nombre'); return; }
    if (!formData.lastName.trim()) { alert('Por favor ingresa tu apellido'); return; }
    if (!formData.email.trim() || !formData.email.includes('@')) { alert('Por favor ingresa un email válido'); return; }
    if (!formData.phone) { alert('Por favor ingresa tu teléfono'); return; }
    if (!formData.address.trim()) { alert('Por favor ingresa tu dirección'); return; }
    if (!formData.city.trim()) { alert('Por favor ingresa tu ciudad'); return; }
    if (!formData.zipCode) { alert('Por favor ingresa tu código postal'); return; }
    
    setIsProcessing(true);

  try {
      // 1. Usamos el origen que capturamos de la URL (ej: 'techbot')
      const orderSource = urlSource;

      // 2. Llamamos a nuestra ruta de MercadoPago
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          source: orderSource, // Aquí viaja la etiqueta
          userId: user?.id,
          customerData: formData 
        }),
      });

      const data = await response.json();

      if (data.url) {
        // 3. ¡Nos vamos a la bóveda segura de MercadoPago!
        window.location.href = data.url;
      } else {
        alert('Hubo un error al generar el pago. Intenta de nuevo.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error procesando el pago:', error);
      alert('Error de conexión.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-8">Agrega artículos a tu carrito para proceder con el pago.</p>
            <Link href="/">
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

      <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-foreground">{t('checkoutTitle')}</h1>
        </div>
      </section>

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Shipping Information Completita */}
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

                {/* Aviso MercadoPago en lugar de tarjeta */}
                <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center text-center">
                  <h2 className="text-xl font-bold text-foreground mb-4">Pago Seguro</h2>
                  <p className="text-muted-foreground mb-4">Serás redirigido a MercadoPago para completar tu compra de forma segura con Tarjeta, Yape o PagoEfectivo.</p>
                  <img src="https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png" alt="MercadoPago" className="h-12 object-contain grayscale opacity-70" />
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
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {isProcessing ? 'Conectando...' : 'Pagar con MercadoPago'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary (Intacto) */}
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