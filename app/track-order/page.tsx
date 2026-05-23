'use client';

import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function TrackOrderPage() {
  const { t } = useTranslation();
  const [orderNumber, setOrderNumber] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular búsqueda de pedido
    if (orderNumber.trim()) {
      setSearchResult({
        id: orderNumber,
        status: 'enviado',
        statusText: 'Tu pedido está en camino',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        carrier: 'FedEx',
        items: [
          { name: 'Producto de prueba', quantity: 1, price: 159.00 }
        ],
        timeline: [
          { step: 'confirmado', label: 'Pedido Confirmado', completed: true, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString() },
          { step: 'procesado', label: 'Procesado', completed: true, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString() },
          { step: 'enviado', label: 'Enviado', completed: true, date: new Date().toLocaleDateString() },
          { step: 'entrega', label: 'Entrega Estimada', completed: false, date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() }
        ]
      });
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Rastrear Mi Pedido</h1>
            <p className="text-xl text-muted-foreground">
              Ingresa tu número de pedido para ver el estado de tu envío
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-12 bg-card rounded-lg border border-border p-8">
            <label className="block text-sm font-medium text-foreground mb-3">
              Número de Pedido
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ej. ORD-1778608749382"
                className="flex-1 px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Buscar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Encontrarás tu número de pedido en el correo de confirmación que recibiste
            </p>
          </form>

          {/* Search Results */}
          {searched && searchResult && (
            <div className="space-y-8">
              {/* Order Status Summary */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Número de Pedido</p>
                    <p className="text-2xl font-bold text-foreground">{searchResult.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Número de Seguimiento</p>
                    <p className="text-xl font-bold text-foreground">{searchResult.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Transportista</p>
                    <p className="text-lg font-medium text-foreground">{searchResult.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Entrega Estimada</p>
                    <p className="text-lg font-medium text-foreground">{searchResult.estimatedDelivery}</p>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-accent font-semibold">{searchResult.statusText}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-xl font-bold text-foreground mb-8">Estado del Pedido</h2>
                
                <div className="space-y-6">
                  {searchResult.timeline.map((event: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          event.completed 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {event.completed ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Clock className="w-6 h-6" />
                          )}
                        </div>
                        {index < searchResult.timeline.length - 1 && (
                          <div className={`w-1 h-12 ${event.completed ? 'bg-green-200' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="pt-1">
                        <p className="font-semibold text-foreground">{event.label}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Summary */}
              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Artículos en Este Pedido</h2>
                <div className="space-y-4">
                  {searchResult.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center pb-4 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-foreground">S/ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Info */}
              <div className="bg-muted/30 rounded-lg border border-border p-8">
                <h2 className="text-lg font-bold text-foreground mb-4">¿Necesitas Ayuda?</h2>
                <p className="text-muted-foreground mb-4">
                  Si tienes problemas con tu pedido o preguntas sobre el rastreo, contacta con nuestro equipo de soporte:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:support@techstore.com" className="flex-1">
                    <Button variant="outline" className="w-full">
                      soporte@techstore.com
                    </Button>
                  </a>
                  <a href="tel:+18008324876" className="flex-1">
                    <Button variant="outline" className="w-full">
                      +1-800-TECHSTORE
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {searched && !searchResult && (
            <div className="text-center bg-card rounded-lg border border-border p-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-foreground mb-2">Pedido No Encontrado</h2>
              <p className="text-muted-foreground mb-6">
                No pudimos encontrar un pedido con ese número. Por favor, verifica que el número sea correcto.
              </p>
              <Button onClick={() => setSearched(false)} variant="outline">
                Intentar Nuevamente
              </Button>
            </div>
          )}

          {/* Info Section */}
          {!searched && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg border border-border p-6 text-center">
                <Package className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Confirmación Inmediata</h3>
                <p className="text-sm text-muted-foreground">
                  Recibirás un correo con tu número de pedido al completar la compra
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-6 text-center">
                <Truck className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Seguimiento en Tiempo Real</h3>
                <p className="text-sm text-muted-foreground">
                  Rastrear tu paquete con actualizaciones en cada paso del proceso
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-6 text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Entrega Garantizada</h3>
                <p className="text-sm text-muted-foreground">
                  Garantizamos la entrega o te devolvemos tu dinero
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
