'use client';

import { useState, useMemo,useEffect } from 'react';
import { getProductsDB } from '@/lib/data/productsDb';
import { Button } from '@/components/ui/button';
import { Download, Search, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export default function AdminInformeVentasPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const products = getProductsDB();

  // Create sample sales from products
  // Estados para guardar tus ventas reales
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Llamada a tu base de datos al cargar la página
  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        
        // Mapeamos los datos de Prisma para que coincidan con lo que espera tu tabla
        // Mapeamos los datos de Prisma para que coincidan EXACTAMENTE con lo que espera tu tabla HTML
// Mapeamos los datos de Prisma para que coincidan EXACTAMENTE con lo que espera tu tabla y tu modal
        const formattedData = data.map((order: any) => {
          const totalAmount = Number(order.total) || 0;
          const taxAmount = totalAmount * 0.1; // Calculamos un 10% de impuesto ficticio o el que uses
          const subtotalAmount = totalAmount - taxAmount; // Calculamos el subtotal

          return {
            id: order.id,
            date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : "Reciente",
            customer: "Cliente Web", 
            product: "Pedido Online", 
            quantity: 1, 
            unitPrice: subtotalAmount,
            subtotal: subtotalAmount, // 🔥 ESTA ES LA LÍNEA QUE FALTABA PARA EL MODAL
            tax: taxAmount, 
            total: totalAmount,
            paymentMethod: "MercadoPago",
            status: order.status || "Completado",
            source: order.source || "web" 
          };
        });

        setSales(formattedData);
      } catch (error) {
        console.error("Error trayendo datos de Prisma:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSales();
  }, []);
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           sale.product.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [sales, searchQuery]);

const totals = useMemo(() => {
    // 1. Contamos las ventas por canal
    const webSales = filteredSales.filter(s => s.source === 'web').length;
    const botSales = filteredSales.filter(s => s.source === 'techbot').length;
    const totalCount = filteredSales.length;

    // 2. Calculamos porcentajes seguros (evitando dividir por cero)
    const webPercentage = totalCount > 0 ? Math.round((webSales / totalCount) * 100) : 0;
    const botPercentage = totalCount > 0 ? Math.round((botSales / totalCount) * 100) : 0;

    return {
      totalSales: filteredSales.reduce((sum, s) => sum + s.total, 0),
      totalTax: filteredSales.reduce((sum, s) => sum + s.tax, 0),
      count: totalCount,
      average: totalCount > 0 ? filteredSales.reduce((sum, s) => sum + s.total, 0) / totalCount : 0,
      // 🔥 Agregamos las nuevas métricas para la gráfica
      webSales,
      botSales,
      webPercentage,
      botPercentage
    };
  }, [filteredSales]);

  const handleExportExcel = () => {
    const data = filteredSales.map(s => ({
      'ID Venta': s.id,
      'Cliente': s.customer,
      'Producto': s.product,
      'Cantidad': s.quantity,
      'P. Unit.': `S/ ${s.unitPrice.toFixed(2)}`,
      'Subtotal': `S/ ${s.subtotal.toFixed(2)}`,
      'IGV': `S/ ${s.tax.toFixed(2)}`,
      'Total': `S/ ${s.total.toFixed(2)}`,
      'Fecha': s.date,
      'Pago': s.paymentMethod,
      'Estado': s.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Informe de Ventas');
    XLSX.writeFile(wb, `informe-ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Éxito',
      description: 'Excel exportado correctamente',
    });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Informe de Ventas</h2>
          <Button onClick={handleExportExcel} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Total de Ventas</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">S/ {totals.totalSales.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{totals.count} transacciones</p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Cantidad de Ventas</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{totals.count}</p>
            <p className="text-xs text-gray-500 mt-2">Número de órdenes</p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Promedio por Venta</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">S/ {totals.average.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Monto promedio</p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Impuestos Totales</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">S/ {totals.totalTax.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">IGV recaudado</p>
          </div>
        </div>

        {/* Gráfica de Rendimiento de Canales (Web vs Bot) */}
        {totals.count > 0 && (
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rendimiento por Canal de Venta</h3>
            
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-blue-700 flex items-center gap-1">
                🌐 Tienda Web ({totals.webPercentage}%)
              </span>
              <span className="font-semibold text-purple-700 flex items-center gap-1">
                🤖 Chatbot ({totals.botPercentage}%)
              </span>
            </div>
            
            {/* La barra gráfica creada con Tailwind */}
            <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-bold transition-all duration-1000"
                style={{ width: `${totals.webPercentage}%` }}
                title={`Ventas Web: ${totals.webSales}`}
              >
                {totals.webPercentage > 10 ? `${totals.webSales}` : ''}
              </div>
              <div
                className="bg-purple-500 h-full flex items-center justify-center text-xs text-white font-bold transition-all duration-1000"
                style={{ width: `${totals.botPercentage}%` }}
                title={`Ventas Chatbot: ${totals.botSales}`}
              >
                {totals.botPercentage > 10 ? `${totals.botSales}` : ''}
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-3">
              <span>{totals.webSales} transacciones directas</span>
              <span>{totals.botSales} transacciones asistidas</span>
            </div>
          </div>
        )}









        {/* Search */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-6 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <Search className="h-4 w-4 text-gray-400 hidden sm:block flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente o producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden sm:table-cell">Cliente</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden md:table-cell">Producto</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden lg:table-cell text-center">Cant.</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden lg:table-cell text-right">P. Unit.</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase text-right">Total</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden sm:table-cell">Fecha</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase text-center">Detalles</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Canal de Venta</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">{sale.id}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell truncate max-w-xs">{sale.customer}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 truncate max-w-xs hidden md:table-cell">{sale.product}</td>
                    <td className="px-3 sm:px-6 py-4 text-center text-sm text-gray-600 hidden lg:table-cell">{sale.quantity}</td>
                    <td className="px-3 sm:px-6 py-4 text-right text-sm text-gray-900 hidden lg:table-cell">S/ {sale.unitPrice.toFixed(2)}</td>
                    <td className="px-3 sm:px-6 py-4 text-right text-sm font-bold text-gray-900">S/ {sale.total.toFixed(2)}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{sale.date}</td>
                    
                    {/* 8. Celda de Detalles (El botón del ojito) */}
                    <td className="px-3 sm:px-6 py-4 text-center">
                      <button
                        onClick={() => setDetailsId(sale.id)}
                        className="inline-flex items-center justify-center h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded p-1 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>

                    {/* 9. Celda del Canal de Venta (Chatbot / Web) */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.source === 'techbot' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-blue-100 text-blue-800' 
                      }`}>
                        {sale.source === 'techbot' ? '🤖 Chatbot' : '🌐 Tienda Web'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron ventas</p>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {detailsId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Detalles de Venta</h3>
                <button onClick={() => setDetailsId(null)} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded p-1 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {(() => {
                const sale = sales.find(s => s.id === detailsId);
                return sale ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">ID Venta</p>
                      <p className="text-gray-900 font-semibold">{sale.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Cliente</p>
                      <p className="text-gray-900">{sale.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Producto</p>
                      <p className="text-gray-900">{sale.product}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Cantidad</p>
                        <p className="text-sm font-semibold text-gray-900">{sale.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Precio Unit.</p>
                        <p className="text-sm font-semibold text-gray-900">S/ {sale.unitPrice.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Subtotal</p>
                        <p className="text-sm font-semibold text-gray-900">S/ {sale.subtotal.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">IGV</p>
                        <p className="text-sm font-semibold text-gray-900">S/ {sale.tax.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                        <p className="text-lg font-bold text-gray-900">S/ {sale.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Fecha</p>
                        <p className="text-sm font-semibold text-gray-900">{sale.date}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Método de Pago</p>
                      <p className="text-sm font-semibold text-gray-900">{sale.paymentMethod}</p>
                    </div>
                  </div>
                ) : null;
              })()}

              <Button onClick={() => setDetailsId(null)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
