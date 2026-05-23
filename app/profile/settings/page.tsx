'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setName(user.name);
      setEmail(user.email);
      setIsLoading(false);
    }
  }, [user, router]);

  const handleChangeName = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre no puede estar vacío',
        variant: 'destructive',
      });
      return;
    }

    if (name === user?.name) {
      toast({
        title: 'Info',
        description: 'El nombre es igual al anterior',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      updateProfile(name);
      toast({
        title: 'Éxito',
        description: 'Nombre actualizado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el nombre',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      toast({
        title: 'Error',
        description: 'Debes ingresar tu contraseña actual',
        variant: 'destructive',
      });
      return;
    }

    if (!newPassword.trim()) {
      toast({
        title: 'Error',
        description: 'Debes ingresar una nueva contraseña',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada correctamente. Por favor inicia sesión nuevamente.',
      });
      
      // Redirect to login after password change
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('Password updated successfully')) {
        toast({
          title: 'Éxito',
          description: 'Contraseña actualizada. Por favor inicia sesión con tu nueva contraseña',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // setTimeout(() => {
        //   router.push('/login');
        // }, 1500);
      } else if (errorMessage.includes('Current password is incorrect')) {
        toast({
          title: 'Error',
          description: 'La contraseña actual es incorrecta',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar la contraseña',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
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

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6 text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atrás
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Configuración de la Cuenta</h1>
            <p className="text-muted-foreground">
              Administra tu cuenta y preferencias de seguridad
            </p>
          </div>

          {/* Profile Information Section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Información de Perfil</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nombre Completo
                </label>
                <Input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  disabled
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">El email no se puede cambiar</p>
              </div>
              <Button
                onClick={handleChangeName}
                disabled={isSaving || name === user?.name}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? 'Actualizando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </Card>

          {/* Change Password Section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Cambiar Contraseña</h2>
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Ingresa tu nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isSaving || !newPassword || !currentPassword}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? 'Actualizando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
