'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  // 1. Estados para nuestros datos reales
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Traemos todo de tu base de datos al cargar la página
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders')
        ]);
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        
        setProducts(productsData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // 3. Calculamos las métricas reales
  const metrics = useMemo(() => {
    // Total de ingresos históricos
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    
    // Productos con stock bajo (menor a 5)
    const lowStockProducts = products.filter(p => (p.stock || 0) < 5).length;
    
    // Ventas de hoy
    const today = new Date().toISOString().split('T')[0];
    const todaysOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === today);
    const todaysSales = todaysOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    
    // Distribución de categorías basada en tu inventario real
    const categoryTotals: { [key: string]: number } = {};
    let totalInventoryValue = 0;
    
    products.forEach(p => {
      const value = Number(p.price || 0);
      categoryTotals[p.category || 'General'] = (categoryTotals[p.category || 'General'] || 0) + value;
      totalInventoryValue += value;
    });
   
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({
        name,
        percentage: totalInventoryValue > 0 ? Math.round((total / totalInventoryValue) * 100) : 0
      }));

    return {
      totalSales,
      lowStockProducts,
      todaysSales,
      todaysOrdersCount: todaysOrders.length,
      topCategories,
    };
  }, [products, orders]);

  // 4. Mapeamos las últimas 5 órdenes reales para la tabla
  const latestOrders = orders.slice(0, 5).map(o => ({
    id: o.id,
    customer: "Cliente Web", // Si tienes usuarios, puedes usar o.user.name
    date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : "Reciente",
    status: o.status || 'Completado',
    total: Number(o.total || 0),
    source: o.source || 'web'
  }));

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
      case 'completado':
        return 'bg-emerald-100 text-emerald-800';
      case 'enviado':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center bg-gray-50"><p className="text-gray-500">Cargando métricas reales...</p></div>;
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Metrics Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas de Hoy */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">Ventas de hoy</p>
              <p className="text-2xl font-bold text-gray-900">S/ {metrics.todaysSales.toFixed(2)}</p>
              <p className="text-xs text-emerald-600 mt-2">Hemos recibido {metrics.todaysOrdersCount} órdenes</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Ingresos Totales (Históricos) */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">S/ {metrics.totalSales.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">Histórico de la tienda</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Depósito (Simulado de MercadoPago) */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">A liquidar</p>
              <p className="text-2xl font-bold text-gray-900">S/ {(metrics.totalSales * 0.95).toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">Después de comisiones (5%)</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">Stock bajo</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.lowStockProducts}</p>
              <p className="text-xs text-red-600 mt-2">Productos por reabastecer</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart (Simulado visualmente pero puedes adaptarlo luego) */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Ventas anuales</h3>
            <div className="flex items-end justify-center gap-2 h-48">
              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'].map((month) => (
                <div key={month} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors"
                    style={{ height: `${Math.random() * 100 + 20}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{month}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-emerald-600 mt-4">↑ Gráfico demostrativo</p>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Categorías principales</h3>
            <div className="space-y-4">
              {metrics.topCategories.length > 0 ? metrics.topCategories.map(item => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">Agrega productos para ver esta métrica</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Orders Table */}
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Últimos pedidos</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Orden ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Canal</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Monto</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order, idx) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                    {/* Añadí la columna del Chatbot para que luzca en el dashboard principal también */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.source === 'techbot' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.source === 'techbot' ? '🤖 Bot' : '🌐 Web'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">S/ {order.total.toFixed(2)}</td>
                  </tr>
                ))}
                
                {latestOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No hay órdenes recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}