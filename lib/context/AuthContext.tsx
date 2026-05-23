'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/lib/data/users';
import { mockUsers, updateMockUsers } from '@/lib/data/users';
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';

interface UserWithFavorites extends Omit<User, 'password'> {
  favorites?: string[];
  orders?: string[];
}

interface AuthContextType {
  user: UserWithFavorites | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;

  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  updateProfile: (name: string) => void;

  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;

  addOrder: (orderId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithFavorites | null>(null);
  const { clearCart, loadCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ======================
  // LOAD USER
  // ======================
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }

    setIsLoading(false);
  }, []);

  // ======================
  // LOGIN
  // ======================
  // ======================
  // LOGIN (CONECTADO A POSTGRES Y JWT)
  // ======================
 const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid email or password');
    }

    const userWithExtras: UserWithFavorites = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      favorites: [],
      orders: [],
    };

    // Guardamos en el almacenamiento de sesión
    setUser(userWithExtras);
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(userWithExtras));

    //Destruimos el carrito de invitado para que no estorbe
    localStorage.removeItem('guest_cart');

    // LA MAGIA: Mandamos a llamar al carrito inmediatamente con el nuevo token ya guardado
    await loadCart(); 
    
    // Redirección suave sin recargar la página
    // router.push('/');
  };

  // ======================
  // REGISTER
  // ======================
const register = async (email: string, password: string, name: string) => {
    setIsLoading(true); // [cite: 80]

    try {
      // 1. Petición POST real a tu Endpoint de Next.js
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      // 2. Si el backend nos da un error (como Email already exists), lo lanzamos al catch
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong during registration');
      }

      // 3. Estructuramos el usuario con los campos extras que maneja tu Front (favorites y orders)
      const userWithExtras: UserWithFavorites = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        favorites: [],
        orders: [],
      };

      // 4. Guardamos los datos de sesión en el estado y en el localStorage
      setUser(userWithExtras);
      localStorage.setItem('token', data.token); // Guardamos tu JWT por si lo necesitamos luego
      localStorage.setItem('currentUser', JSON.stringify(userWithExtras)); // Mantenemos el nombre original 'currentUser'

    } catch (err) {
      // El error se propaga hacia RegisterPage para que useForm y Zod lo pinten en pantalla
      throw err; 
    } finally {
      setIsLoading(false); // [cite: 87]
    }
  };
  // ======================
  // LOGOUT
  // ======================
 const logout = () => {
    // Limpiamos credenciales del almacenamiento
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    // 🔥 LA MAGIA: Vaciamos la memoria RAM del carrito al instante
    clearCart(); 
    
    // Redirección suave
    // router.push('/');
  };

  // ======================
  // FAVORITES
  // ======================
  const toggleFavorite = (productId: string) => {
    if (!user) return;

    const favorites = user.favorites || [];

    const updatedFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];

    const updatedUser = { ...user, favorites: updatedFavorites };

    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const isFavorite = (productId: string) => {
    if (!user) return false;
    return (user.favorites || []).includes(productId);
  };

  // ======================
  // UPDATE PROFILE
  // ======================
  const updateProfile = (name: string) => {
    if (!user) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    const updatedUser = { ...user, name: trimmed };

    const index = mockUsers.findIndex((u) => u.id === user.id);

    if (index !== -1) {
      const updated = [...mockUsers];
      updated[index] = {
        ...updated[index],
        name: trimmed,
      };
      updateMockUsers(updated);
    }

    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  // ======================
  // CHANGE PASSWORD (FIXED REAL)
  // ======================
// Busca tu función changePassword en AuthContext y actualízala así:
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) throw new Error('No hay un usuario autenticado');

    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: user.email, 
        currentPassword, 
        newPassword 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Lanzamos el error para que el bloque catch del SettingsPage lo atrape
      throw new Error(data.error || 'Error al actualizar la contraseña');
    }

    return data;
  };

  // ======================
  // ORDERS
  // ======================
  const addOrder = (orderId: string) => {
    if (!user) return;

    const orders = user.orders || [];

    if (!orders.includes(orderId)) {
      const updatedUser = { ...user, orders: [...orders, orderId] };

      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        toggleFavorite,
        isFavorite,
        updateProfile,
        changePassword,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}