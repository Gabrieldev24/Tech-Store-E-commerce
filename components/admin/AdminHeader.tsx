'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Moon, Sun, Bell, Calendar, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/lib/context/SidebarContext';

const PAGE_TITLES: { [key: string]: string } = {
  '/admin/dashboard': 'Dashboard',   // ✅ Correcto
  '/admin/productos': 'Productos',
  '/admin/transacciones': 'Transacciones',
  '/admin/informe-ventas': 'Informe de Ventas',
  '/admin/configuracion': 'Configuración',
};

export function AdminHeader() {
  const { isOpen, toggle } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  const [startDate, setStartDate] = useState('28/03/2025');
  const [endDate, setEndDate] = useState('28/04/2025');

  useEffect(() => {
    setIsClientReady(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
  }, []);

  const handleThemeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Dispatch custom event for layout to listen to
    window.dispatchEvent(new CustomEvent('themeChange'));
  };



  const pageTitle = PAGE_TITLES[pathname] || 'Dashboard';

  return (
    <header className="bg-background border-b-2 border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-3 sm:px-6 py-4 gap-4">
        {/* Left Section - Hamburger & Logo */}
        <div className="flex items-center gap-3 sm:gap-8 min-w-0">
          {/* Hamburger Menu - Mobile only */}
          <Button
            onClick={toggle}
            variant="ghost"
            size="sm"
            className="md:hidden text-foreground flex-shrink-0"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <Image 
              src='/Icono.png' 
              alt="TechStore" 
              width={32} 
              height={32}
              className="h-8 w-8 flex-shrink-0"
            />
            <span className="font-bold text-foreground hidden sm:inline">TechStore</span>
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{pageTitle}</h1>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      
    </header>
  );
}
