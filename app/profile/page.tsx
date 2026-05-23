'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Heart, Package, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Sidebar - User Info */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mb-4 text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>

              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-6">{user.email}</p>

                {user.role === 'admin' && (
                  <span className="inline-block px-3 py-1 mb-6 bg-primary/20 text-primary text-sm font-semibold rounded-full">
                    Administrador
                  </span>
                )}

                <div className="w-full space-y-2">
                  <Button
                    className="w-full bg-primary/80 text-primary-foreground hover:bg-primary text-foreground"
                    onClick={() => router.push('/profile/settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Middle - Profile Content */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Mi Cuenta</h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => router.push('/profile/favorites')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center"
                >
                  <Heart className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Favoritos</span>
                  <span className="font-semibold text-foreground text-lg">
                    {user.favorites?.length || 0}
                  </span>
                </button>

                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Órdenes</span>
                  <span className="font-semibold text-foreground text-lg">
                    {user.orders?.length || 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* User Info Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Información Personal</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Nombre</p>
                  <p className="text-foreground font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>
              </div>
            </Card>
          </div>


        </div>
      </main>

      <Footer />
    </div>
  );
}
