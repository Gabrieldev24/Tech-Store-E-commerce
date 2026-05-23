'use client';

import { ShoppingCart, User, LogOut, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useCompany } from '@/lib/context/CompanyContext';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from '@/components/language-selector';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Header() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { companyName } = useCompany();
  const { t } = useTranslation();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Logo */}
          <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/'} className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="TechStore" 
              width={32} 
              height={32}
              className="h-8 w-8"
            />
            <span className="hidden font-bold sm:inline">{companyName}</span>
          </Link>

          {/* Search Bar - Hidden on mobile and for admins */}
          {user?.role !== 'admin' && (
            <div className="hidden flex-1 md:flex">
              <div className="w-full max-w-sm">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    className="w-full rounded-lg border border-input bg-background pl-4 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="hidden gap-6 lg:flex">
            {user?.role === 'admin' && (
              <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {isClientReady && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
                className="text-foreground"
                title={isDarkMode ? t('lightMode') : t('darkMode')}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}
            {user ? (
              <>
                <Link href="/profile">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                    {user.role === 'admin' && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Admin</span>
                    )}
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-foreground hover:text-destructive"
                  title={t('logout')}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    {t('signIn')}
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:inline">
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    {t('signUp')}
                  </Button>
                </Link>
              </>
            )}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative text-foreground">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
