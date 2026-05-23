'use client';

import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle, Lock } from 'lucide-react';

type Step = 'email' | 'code' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Llamar a nuestro nuevo endpoint
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Error al enviar el correo');

      // 2. Avanzar al siguiente paso (ya no generamos el código localmente ni usamos alert)
      setIsLoading(false);
      setStep('code');

    } catch (err) {
      setError('Ocurrió un error al intentar enviar el código.');
      setIsLoading(false);
    }
  };
const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos exactos');
      return;
    }
    
    // Pasamos a la siguiente pantalla sin validar aquí (el backend lo hará al final)
    setStep('reset');
  };

const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // Llamamos al endpoint final enviando los 3 datos clave
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hubo un problema al actualizar la contraseña');
      }

      setIsLoading(false);
      setStep('success'); // ¡Pantalla verde de victoria!
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Back Link */}
          <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4" />
            Volver al login
          </Link>

          {/* Step 1: Email */}
          {step === 'email' && (
            <div className="space-y-6">
              <div className="text-center">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Recuperar Contraseña</h1>
                <p className="text-muted-foreground">
                  Ingresa tu email para recibir un código de recuperación
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Código'}
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: Code Verification */}
          {step === 'code' && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Verifica tu Email</h1>
                <p className="text-muted-foreground">
                  Hemos enviado un código de 6 dígitos a {email}
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Código de Recuperación (6 dígitos)
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-mono"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Verificar Código
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-primary hover:text-primary/80 text-sm"
                >
                  Usar otro email
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <div className="space-y-6">
              <div className="text-center">
                <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Nueva Contraseña</h1>
                <p className="text-muted-foreground">
                  Crea una nueva contraseña para tu cuenta
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </form>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div>
                <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">¡Contraseña Actualizada!</h1>
                <p className="text-muted-foreground">
                  Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>

              <Link href="/login">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Ir al Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
