'use client';

import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { CheckCircle, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const { t } = useTranslation();
  const [orderData, setOrderData] = useState<any>(null);
  
  useEffect(() => {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      setOrderData(JSON.parse(lastOrder));
    }
  }, []);

  const orderNumber = orderData?.id || 'ORD-PENDING';
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Success Section */}
      <div className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-accent/10 p-4">
                <CheckCircle className="h-16 w-16 text-accent" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">¡Pedido Confirmado!</h1>
            <p className="text-xl text-muted-foreground mb-2">
              Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
            </p>
            {orderData?.customer && (
              <p className="text-muted-foreground mb-8">
                Se ha enviado un correo de confirmación a <span className="font-semibold text-foreground">{orderData.customer.email}</span>
              </p>
            )}

            {/* Order Details Card */}
            <div className="rounded-lg border border-border bg-card p-8 mb-8 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Número de Pedido</p>
                  <p className="text-2xl font-bold text-foreground">{orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Entrega Estimada</p>
                  <p className="text-2xl font-bold text-foreground">{estimatedDelivery}</p>
                </div>
              </div>

              {/* Order Items */}
              {orderData?.items && orderData.items.length > 0 && (
                <div className="mb-8 pb-8 border-b border-border">
                  <h3 className="font-bold text-foreground text-lg mb-4">Artículos Pedidos</h3>
                  <div className="space-y-3">
                    {orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        {item.price && item.quantity ? (
                          <p className="font-semibold text-foreground">S/ {(item.price * item.quantity).toFixed(2)}</p>
                        ) : (
                          <p className="font-semibold text-foreground text-sm text-muted-foreground">x{item.quantity}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              {orderData && (
                <div className="mb-8 pb-8 border-b border-border space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('subtotal')}:</span>
                    <span>S/ {(orderData.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('tax')} (10%):</span>
                    <span>S/ {(orderData.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('shipping')}:</span>
                    <span>S/ {(orderData.shipping || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2">
                    <span>{t('total')}:</span>
                    <span>S/ {(orderData.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* What's Next */}
              <div className="space-y-4 border-t border-border pt-8">
                <h3 className="font-bold text-foreground text-lg">¿Qué sigue?</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Correo de Confirmación</p>
                      <p className="text-sm text-muted-foreground">
                        Revisa tu correo para obtener la confirmación del pedido e información de seguimiento.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Procesamiento del Pedido</p>
                      <p className="text-sm text-muted-foreground">
                        Tu pedido será procesado y enviado en 1-2 días hábiles.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Entrega</p>
                      <p className="text-sm text-muted-foreground">
                        Tu paquete llegará en 3-5 días hábiles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-left">
                <div className="flex gap-3 items-start">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Soporte por Email</p>
                    <p className="text-muted-foreground text-sm">support@techstore.com</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-left">
                <div className="flex gap-3 items-start">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Soporte Telefónico</p>
                    <p className="text-muted-foreground text-sm">+1-800-TECHSTORE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/track-order" className="flex-1">
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Rastrear Mi Pedido
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {t('continueShopping')}
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  {t('viewAllProducts')}
                </Button>
              </Link>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="rounded-lg border border-border bg-muted/30 p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Preguntas Frecuentes</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">¿Puedo cancelar mi pedido?</h3>
                <p className="text-muted-foreground text-sm">
                  Los pedidos pueden ser cancelados dentro de 30 minutos después de su realización. Contacta a nuestro equipo de soporte para ayuda.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">¿Cuál es su política de devolución?</h3>
                <p className="text-muted-foreground text-sm">
                  Ofrecemos una garantía de devolución de dinero de 30 días. Si no estás satisfecho, te reembolsaremos tu compra.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">¿Cómo puedo rastrear mi pedido?</h3>
                <p className="text-muted-foreground text-sm">
                  Recibirás un número de seguimiento por correo electrónico una vez que tu pedido sea enviado. Úsalo para monitorear tu paquete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
