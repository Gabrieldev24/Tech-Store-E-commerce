'use client';

import { useState, useMemo } from 'react';
import { getProductsDB } from '@/lib/data/productsDb';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductosPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [products, setProducts] = useState(getProductsDB());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Audio',
    stock: '',
    description: '',
    image: ''
  });

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter, products]);

  const handleAddProduct = () => {
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      category: 'Audio',
      stock: '',
      description: '',
      image: ''
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: (product.originalPrice || '').toString(),
      category: product.category,
      stock: (product.stock || '10').toString(),
      description: product.description,
      image: product.image
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast({
        title: 'Error',
        description: 'Por favor completa los campos requeridos',
        variant: 'destructive'
      });
      return;
    }

    if (editingId) {
      // (Opcional para después) Aquí iría la lógica de editar (PUT)
      toast({ title: 'Aviso', description: 'Edición en base de datos pendiente de configurar.' });
    } else {
      // 🔥 CREACIÓN REAL EN LA BASE DE DATOS 🔥
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          const productSaved = await res.json();
          // Agregamos el producto recién guardado a la tabla visualmente
          setProducts([productSaved, ...products]);
          toast({
            title: 'Éxito',
            description: 'Producto guardado en la base de datos real',
          });
        } else {
          throw new Error("Error al guardar");
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo guardar en la base de datos',
          variant: 'destructive'
        });
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: 'Éxito',
        description: 'Producto eliminado correctamente',
      });
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
          <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total de Productos</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Productos Filtrados</p>
            <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Stock Bajo</p>
            <p className="text-2xl font-bold text-red-600">{products.filter(p => (p.stock || 0) < 5).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 transition-colors w-full sm:w-auto"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase">Imagen</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase">Nombre</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden sm:table-cell">Categoría</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase">Precio</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase hidden md:table-cell">Stock</th>
                  <th className="px-3 sm:px-6 py-3 text-xs font-bold text-gray-700 uppercase text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover bg-gray-100"
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{product.name}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{product.category}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm font-semibold text-gray-900">S/ {product.price.toFixed(2)}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm hidden md:table-cell">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${(product.stock || 0) < 5 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button onClick={() => handleEditProduct(product)} className="h-8 w-8 flex items-center justify-center rounded p-1 text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="h-8 w-8 flex items-center justify-center rounded p-1 text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>


      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded p-1 transition-colors flex-shrink-0">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Original</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    {categories.filter(c => c !== 'Todos').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Descripción del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {editingId ? 'Actualizar' : 'Crear'} Producto
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
