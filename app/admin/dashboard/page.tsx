'use client';

import { useMemo } from 'react';
import { getProductsDB } from '@/lib/data/productsDb';
import { TrendingUp, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const products = getProductsDB();

  // Calculate metrics from JSON data
  const metrics = useMemo(() => {
    const totalSales = products.reduce((sum, p) => sum + p.price, 0);
    const lowStockProducts = products.filter(p => (p.stock || 0) < 5).length;
    const todaysSales = parseFloat((Math.random() * 500 + 500).toFixed(2));
    
    // Get category distribution for top products
    const categoryTotals: { [key: string]: number } = {};
    products.forEach(p => {
      categoryTotals[p.category] = (categoryTotals[p.category] || 0) + p.price;
    });
    
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({
        name,
        percentage: Math.round((total / totalSales) * 100)
      }));

    return {
      totalSales,
      lowStockProducts,
      todaysSales,
      topCategories,
    };
  }, [products]);

  // Create sample sales data from products
  const salesData = products.slice(0, 5).map((p, i) => ({
    id: `ORD-${String(i + 1).padStart(3, '0')}`,
    customer: ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Rodríguez'][i],
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: ['Completado', 'Enviado', 'Completado', 'Pendiente', 'Entregado'][i],
    total: p.price,
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
              <p className="text-xs text-emerald-600 mt-2">Hemos vendido 123 artículos</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Ingresos Actuales */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">Ingresos actuales</p>
              <p className="text-2xl font-bold text-gray-900">S/ {(metrics.totalSales * 0.4).toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">Disponible para pago</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Depósito */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">Depósito</p>
              <p className="text-2xl font-bold text-gray-900">S/ {(metrics.totalSales * 0.25).toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">Disponible para pago</p>
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
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Ventas de hoy</h3>
            <div className="flex items-end justify-center gap-2 h-48">
              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'].map((month, i) => (
                <div key={month} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors"
                    style={{ height: `${Math.random() * 100 + 20}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{month}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-emerald-600 mt-4">↑ 5% que el mes pasado</p>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Artículos más vendidos</h3>
            <div className="space-y-4">
              {metrics.topCategories.map(item => (
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
              ))}
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
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Monto</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((order, idx) => (
                  <tr key={order.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${idx === salesData.length - 1 ? '' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">S/ {order.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
