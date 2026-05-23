'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/lib/context/SidebarContext';

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const { close } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    close();
    router.push('/');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      close();
    }
  };

  return (
    <div className="w-64 bg-blue-600 text-white flex flex-col h-screen overflow-hidden shadow-lg">
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto">
        {/* GENERAL Section */}
        <div className="pt-8 pb-6">
          <h3 className="px-6 text-xs font-bold text-blue-200 uppercase tracking-wider mb-4">General</h3>
          
          <Link
            href="/admin/dashboard"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 sm:px-6 py-3 mx-2 rounded-lg transition-colors mb-1 ${
              pathname === '/admin/dashboard'
                ? 'bg-blue-700/60 text-white'
                : 'text-blue-100 hover:bg-blue-700/40'
            }`}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm truncate">Dashboard</span>
          </Link>

          {/* Productos */}
          <Link
            href="/admin/productos"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 sm:px-6 py-3 mx-2 rounded-lg transition-colors mb-1 ${
              pathname === '/admin/productos'
                ? 'bg-blue-700/60 text-white'
                : 'text-blue-100 hover:bg-blue-700/40'
            }`}
          >
            <Package className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm truncate">Productos</span>
          </Link>

          {/* Transacciones */}
          <Link
            href="/admin/transacciones"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 sm:px-6 py-3 mx-2 rounded-lg transition-colors mt-1 ${
              pathname === '/admin/transacciones'
                ? 'bg-blue-700/60 text-white'
                : 'text-blue-100 hover:bg-blue-700/40'
            }`}
          >
            <ShoppingCart className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm truncate">Transacciones</span>
          </Link>

          {/* Informe de Ventas */}
          <Link
            href="/admin/informe-ventas"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 sm:px-6 py-3 mx-2 rounded-lg transition-colors ${
              pathname === '/admin/informe-ventas'
                ? 'bg-blue-700/60 text-white'
                : 'text-blue-100 hover:bg-blue-700/40'
            }`}
          >
            <TrendingUp className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm truncate">Informe de ventas</span>
          </Link>
        </div>

        {/* HERRAMIENTAS Section */}
        <div className="border-t border-blue-500/30 py-6">
          <h3 className="px-6 text-xs font-bold text-blue-200 uppercase tracking-wider mb-4">Herramientas</h3>
          
          <Link
            href="/admin/configuracion"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 sm:px-6 py-3 mx-2 rounded-lg transition-colors mb-1 ${
              pathname === '/admin/configuracion'
                ? 'bg-blue-700/60 text-white'
                : 'text-blue-100 hover:bg-blue-700/40'
            }`}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm truncate">Configuración de la cuenta</span>
          </Link>

        </div>
      </nav>

      {/* User Profile */}
      {user && (
        <div className="border-t border-blue-500/30 p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg bg-blue-700/40 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-xs text-blue-200">Administrador</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-blue-100 hover:bg-blue-700/40 text-xs h-8"
          >
            <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Cerrar Sesión</span>
          </Button>
        </div>
      )}
    </div>
  );
}
