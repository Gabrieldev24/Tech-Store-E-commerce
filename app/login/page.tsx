'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/context/AuthContext';
import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { sendGAEvent } from '@next/third-parties/google';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data.email, data.password);

      sendGAEvent('event', 'intento_ingreso_test'

        ,{method: 'credenciales_web' 
      });
      // 🔥 LA SINTAXIS CORRECTA PARA GA4


      // TRAMPA 2: La pausa obligatoria
      console.log("⏱️ Esperando 1 segundo para que Google atrape el evento...");
      await new Promise(resolve => setTimeout(resolve, 1000)); 

      // Redirect based on user role
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("🚀 Redirigiendo a:", user.role === 'admin' ? '/admin/dashboard' : '/');
        router.push(user.role === 'admin' ? '/admin/dashboard' : '/');
      }
    } catch (err) {
      // TRAMPA 3: Ver si está fallando en secreto
      console.error("❌ ERROR EN EL LOGIN:", err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-foreground mb-2">Bienvenido</h1>
            <p className="text-muted-foreground mb-6">Inicia sesión en tu cuenta</p>

            {error && (
              <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 border-t border-border pt-6">
              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Regístrate
                </Link>
              </p>
            </div>

            <div className="mt-6 p-4 bg-secondary/20 rounded-md">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Demo Credentials:</p>
              <p className="text-xs text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Admin:</span> admin@techstore.com / admin123
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Customer:</span> customer@example.com / customer123
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
