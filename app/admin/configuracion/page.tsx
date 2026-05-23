"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Mail, Lock, Bell, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/context/AuthContext";

export default function AdminConfiguracionPage() {
  const { toast } = useToast();

  // 👇 AQUÍ estaba el error: faltaba changePassword
  const { user, updateProfile, changePassword } = useAuth();

  const [email, setEmail] = useState("admin@techstore.com");
  const [fullName, setFullName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsOrders, setNotificationsOrders] = useState(true);
  const [notificationsInventory, setNotificationsInventory] = useState(true);

  const [savedProfile, setSavedProfile] = useState(false);
  const [savedPassword, setSavedPassword] = useState(false);
  const [savedNotifications, setSavedNotifications] = useState(false);

  useEffect(() => {
    if (user?.name) setFullName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleSaveProfile = () => {
    // 👇 mejor práctica: enviar objeto completo si tu backend lo soporta
    updateProfile({ name: fullName, email });

    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 3000);

    toast({
      title: "Éxito",
      description: "Perfil actualizado",
    });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);

      setSavedPassword(true);

      toast({
        title: "Éxito",
        description:
          "Contraseña actualizada. Debes iniciar sesión nuevamente.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al cambiar contraseña",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotifications = () => {
    setSavedNotifications(true);

    toast({
      title: "Éxito",
      description: "Preferencias de notificaciones actualizadas",
    });

    setTimeout(() => setSavedNotifications(false), 3000);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Configuración de la Cuenta
        </h2>

        {/* PROFILE */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold">Información de Perfil</h3>
            </div>

            {savedProfile && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                Guardado
              </div>
            )}
          </div>

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Nombre completo"
          />

          {/* email solo lectura (mejor práctica) */}
          <input
            value={email}
            disabled
            className="w-full p-2 border rounded mb-4 bg-gray-100"
            placeholder="Correo"
          />

          <Button onClick={handleSaveProfile} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>

        {/* PASSWORD */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-bold">Cambiar Contraseña</h3>
            </div>

            {savedPassword && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                Guardado
              </div>
            )}
          </div>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Contraseña actual"
            className="w-full p-2 border rounded mb-4"
          />

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            className="w-full p-2 border rounded mb-4"
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            className="w-full p-2 border rounded mb-4"
          />

          <Button onClick={handleChangePassword} className="gap-2">
            <Lock className="h-4 w-4" />
            Cambiar Contraseña
          </Button>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-bold">
                Preferencias de Notificaciones
              </h3>
            </div>

            {savedNotifications && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                Guardado
              </div>
            )}
          </div>

          <label className="flex justify-between mb-3">
            <span>Email</span>
            <input
              type="checkbox"
              checked={notificationsEmail}
              onChange={(e) => setNotificationsEmail(e.target.checked)}
            />
          </label>

          <label className="flex justify-between mb-3">
            <span>Órdenes</span>
            <input
              type="checkbox"
              checked={notificationsOrders}
              onChange={(e) => setNotificationsOrders(e.target.checked)}
            />
          </label>

          <label className="flex justify-between mb-6">
            <span>Inventario</span>
            <input
              type="checkbox"
              checked={notificationsInventory}
              onChange={(e) => setNotificationsInventory(e.target.checked)}
            />
          </label>

          <Button onClick={handleSaveNotifications} className="w-full gap-2">
            <Save className="h-4 w-4" />
            Guardar Notificaciones
          </Button>
        </div>
      </div>
    </main>
  );
}