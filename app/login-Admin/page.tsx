'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Credenciales maestras para tu demostración
    setTimeout(() => {
      if (email === 'admin@cubaaprende.site' && password === 'admin123') {
        toast({
          title: 'Acceso concedido',
          description: 'Bienvenido al panel de administración.',
        });
        // Redirección directa a tu panel
        router.push('/admin/informe-ventas'); 
      } else {
        toast({
          title: 'Error de acceso',
          description: 'Credenciales incorrectas.',
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    }, 1000); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Acceso Administrativo</h2>
          <p className="text-sm text-gray-500 mt-2">Panel de control exclusivo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              placeholder="admin@cubaaprende.site"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Ingresar al Panel'}
          </Button>
        </form>
      </div>
    </div>
  );
}