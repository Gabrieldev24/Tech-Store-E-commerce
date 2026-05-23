'use client';

import { useMemo, useState } from 'react';
import { getProductsDB } from '@/lib/data/productsDb';
import { Button } from '@/components/ui/button';
import { Download, Filter, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export default function AdminTransaccionesPage() {
  const { toast } = useToast();
  const products = getProductsDB();
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Create sample transactions from products
  const allTransactions = useMemo(() => {
    const trans: any[] = [];
    
    products.forEach((product, index) => {
      // Compra inicial
      trans.push({
        id: `COMP-${String(index + 1).padStart(4, '0')}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'Compra',
        concept: `Compra de ${product.name}`,
        quantity: Math.floor(Math.random() * 20) + 5,
        unitPrice: product.price * 0.6,
        total: (product.price * 0.6) * (Math.floor(Math.random() * 20) + 5),
        supplier: ['Proveedor A', 'Proveedor B', 'Proveedor C'][Math.floor(Math.random() * 3)],
        status: 'Completado',
        products: [{ name: product.name, qty: Math.floor(Math.random() * 20) + 5 }]
      });

      // Venta
      if (Math.random() > 0.3) {
        trans.push({
          id: `VENTA-${String(index + 1).padStart(4, '0')}`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'Venta',
          concept: `Venta de ${product.name}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          unitPrice: product.price,
          total: product.price * (Math.floor(Math.random() * 5) + 1),
          supplier: `Cliente ${Math.floor(Math.random() * 100)}`,
          status: 'Completado',
          products: [{ name: product.name, qty: Math.floor(Math.random() * 5) + 1 }]
        });
      }
    });

    return trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [products]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const matchesType = typeFilter === 'Todos' || t.type === typeFilter;
      const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesDate = true;
      if (startDate && endDate) {
        const tDate = new Date(t.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDate = tDate >= start && tDate <= end;
      }
      
      return matchesType && matchesSearch && matchesDate;
    });
  }, [allTransactions, typeFilter, searchQuery, startDate, endDate]);

  const totals = useMemo(() => {
    const compras = filteredTransactions.filter(t => t.type === 'Compra').reduce((sum, t) => sum + t.total, 0);
    const ventas = filteredTransactions.filter(t => t.type === 'Venta').reduce((sum, t) => sum + t.total, 0);
    return { compras, ventas, diferencia: ventas - compras };
  }, [filteredTransactions]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleExportExcel = () => {
    const data = filteredTransactions.map(t => ({
      'ID Transacción': t.id,
      'Fecha': t.date,
      'Tipo': t.type,
      'Concepto': t.concept,
      'Cantidad': t.quantity,
      'Precio Unit.': `S/ ${t.unitPrice.toFixed(2)}`,
      'Total': `S/ ${t.total.toFixed(2)}`,
      'Proveedor/Cliente': t.supplier,
      'Estado': t.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
    XLSX.writeFile(wb, `transacciones_${new Date().toISOString().split('T')[0]}.xlsx`);
    
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
          <h2 className="text-2xl font-bold text-gray-900">Transacciones</h2>
          <Button onClick={handleExportExcel} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

       
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Total Compras</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">S/ {totals.compras.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Mercadería adquirida</p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Total Ventas</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600">S/ {totals.ventas.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Mercadería vendida</p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Diferencia</p>
            <p className={`text-2xl sm:text-3xl font-bold ${totals.diferencia >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              S/ {totals.diferencia.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Ganancia / Pérdida</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Filter className="h-4 w-4 text-gray-600 hidden sm:block" />
            <select 
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
            >
              <option value="Todos">Todos los tipos</option>
              <option value="Compra">Compras</option>
              <option value="Venta">Ventas</option>
            </select>
            <input
              type="text"
              placeholder="Buscar transacción..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-full"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden sm:table-cell">Fecha</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase">Tipo</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden md:table-cell">Concepto</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden lg:table-cell text-center">Cant.</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden lg:table-cell text-right">Total</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden lg:table-cell">Estado</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase text-center">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">{transaction.id}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{transaction.date}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === 'Compra' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {transaction.type.charAt(0)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 truncate max-w-xs hidden md:table-cell">{transaction.concept}</td>
                    <td className="px-3 sm:px-6 py-4 text-center text-sm text-gray-600 hidden lg:table-cell">{transaction.quantity}</td>
                    <td className="px-3 sm:px-6 py-4 text-right text-sm font-semibold text-gray-900 hidden lg:table-cell">S/ {transaction.total.toFixed(2)}</td>
                    <td className="px-3 sm:px-6 py-4 text-center hidden lg:table-cell">
                      <span className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-center">
                      <button 
                        onClick={() => setDetailsId(transaction.id)}
                        className="inline-flex items-center justify-center h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded p-1 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            ← Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {Math.max(1, totalPages)}
          </span>
          <Button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            variant="outline"
          >
            Siguiente →
          </Button>
        </div>

        {/* Details Modal */}
        {detailsId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Detalles de Transacción</h3>
                <button onClick={() => setDetailsId(null)} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded p-1 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {(() => {
                const trans = allTransactions.find(t => t.id === detailsId);
                return trans ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">ID Transacción</p>
                      <p className="text-gray-900 font-semibold">{trans.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Concepto</p>
                      <p className="text-gray-900">{trans.concept}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Productos</p>
                      <ul className="text-gray-900 mt-2 space-y-1">
                        {trans.products?.map((p: any, i: number) => (
                          <li key={i} className="text-sm">• {p.name} (x{p.qty})</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                        <p className="text-lg font-bold text-gray-900">S/ {trans.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Estado</p>
                        <p className="text-sm font-semibold text-green-600">{trans.status}</p>
                      </div>
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
