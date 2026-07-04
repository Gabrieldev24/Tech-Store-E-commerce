"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "@/lib/data/products";
import { getProductsDB } from "@/lib/data/productsDb"; 

// 1. Añadimos source al tipo de dato del carrito
export interface CartItem {
  product: Product;
  quantity: number;
  source: string; 
}

// 2. Actualizamos la firma de addItem para recibir source
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, source?: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>; // 🔥 Agregamos esta línea para que TypeScript no llore
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  loadCart: () => Promise<void>;
}




const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // ======================
  // 1. CARGAR CARRITO (BD O INVITADO)
  // ======================
  const loadCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    const allProducts = getProductsDB(); 
    
    // MODO INVITADO: Buscar en localStorage
    if (!token) {
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart);
          const mappedItems = parsed.map((item: any) => {
            const product = allProducts.find(p => p.id === item.productId);
            // Recuperamos el source o le ponemos 'web' por defecto
            return { product, quantity: item.quantity, source: item.source || 'web' };
          }).filter((item: any) => item.product !== undefined);
          setItems(mappedItems);
        } catch (e) {
          setItems([]);
        }
      } else {
        setItems([]);
      }
      return;
    }

    // MODO AUTENTICADO: Traer de Postgres
    try {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al traer el carrito');
      
      const data = await response.json();
      const mappedItems: CartItem[] = data.cart.items.map((cartItem: any) => {
        const product = allProducts.find(p => p.id === cartItem.productId);
        // Recuperamos el source de la base de datos
        return { product, quantity: cartItem.quantity, source: cartItem.source || 'web' };
      }).filter((item: any) => item.product !== undefined);
      
      setItems(mappedItems);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Cargar al iniciar
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // ======================
  // AUTO-GUARDADO PARA INVITADOS
  // ======================
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Ahora también guardamos el source en el localStorage
      const guestStorage = items.map(i => ({ 
        productId: i.product.id, 
        quantity: i.quantity,
        source: i.source 
      }));
      localStorage.setItem('guest_cart', JSON.stringify(guestStorage));
    }
  }, [items]);

  // ======================
  // 2. AGREGAR AL CARRITO
  // ======================
  // 3. Añadimos source como tercer parámetro, por defecto 'web'
  const addItem = useCallback(async (product: Product, quantity: number, source: string = 'web') => {
    const token = localStorage.getItem('token');
    
    // MODO INVITADO: Solo actualizamos la memoria
    if (!token) {
      setItems(prev => {
        const existing = prev.find(i => i.product.id === product.id);
        if (existing) {
          return prev.map(i => 
            i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        // Agregamos el item nuevo con su respectivo source
        return [...prev, { product, quantity, source }];
      });
      return;
    }

    // MODO AUTENTICADO: Guardar en Postgres
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // 4. Enviamos el source a tu backend
        body: JSON.stringify({ productId: product.id, quantity, source })
      });

      if (!response.ok) throw new Error('Error al agregar a Postgres');
      
      await loadCart();

    } catch (error) {
      console.error(error);
    }
  }, [loadCart]);

  // ======================
  // FUNCIONES LOCALES 
  // ======================
const removeItem = useCallback(async (productId: string) => {
    const token = localStorage.getItem('token');

    // 1. ACTUALIZACIÓN OPTIMISTA: Lo borramos de la pantalla al instante (cero lag)
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));

    // 2. MODO INVITADO: Si no hay token, el useEffect de auto-guardado 
    // ya se encarga de actualizar el localStorage, así que cortamos aquí.
    if (!token) return;

    // 3. MODO AUTENTICADO: Le disparamos la orden a Postgres
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al borrar en Postgres');

    } catch (error) {
      console.error("Error al sincronizar el borrado con Postgres:", error);
      // 4. ROLLBACK: Si se cae el internet o falla el servidor, le devolvemos 
      // el producto a la pantalla recargando la verdad absoluta desde la BD.
      await loadCart();
    }
  }, [loadCart]);

const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    // Si baja a 0 o menos, usamos la función de eliminar
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    // 1. ACTUALIZACIÓN OPTIMISTA: Cambiamos la pantalla al instante sin lag
    setItems((prevItems) =>
      prevItems.map((item) => item.product.id === productId ? { ...item, quantity } : item)
    );

    const token = localStorage.getItem('token');
    
    // 2. MODO INVITADO: El useEffect guarda esto automáticamente
    if (!token) return;

    // 3. MODO AUTENTICADO: Avisamos a nuestra API
    try {
      const response = await fetch(`/api/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      if (!response.ok) throw new Error('Error al actualizar cantidad en servidor');

    } catch (error) {
      console.error("Error de sincronización con Postgres:", error);
      // 4. ROLLBACK: Si el internet falla, devolvemos la cantidad real desde la BD
      await loadCart();
    }
  }, [removeItem, loadCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, loadCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}