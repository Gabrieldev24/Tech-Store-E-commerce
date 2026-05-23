"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "@/lib/data/products";
import { getProductsDB } from "@/lib/data/productsDb"; 

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => Promise<void>;
  removeItem: (productId: string) => void;
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
            return { product, quantity: item.quantity };
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
        return { product, quantity: cartItem.quantity };
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
  // Si NO hay sesión, cualquier cambio en "items" se guarda en 'guest_cart'
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      const guestStorage = items.map(i => ({ productId: i.product.id, quantity: i.quantity }));
      localStorage.setItem('guest_cart', JSON.stringify(guestStorage));
    }
  }, [items]);

  // ======================
  // 2. AGREGAR AL CARRITO
  // ======================
  const addItem = useCallback(async (product: Product, quantity: number) => {
    const token = localStorage.getItem('token');
    
    // MODO INVITADO: Solo actualizamos la memoria (el useEffect de arriba lo guarda)
    if (!token) {
      setItems(prev => {
        const existing = prev.find(i => i.product.id === product.id);
        if (existing) {
          return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
        }
        return [...prev, { product, quantity }];
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
        body: JSON.stringify({ productId: product.id, quantity })
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
  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => item.product.id === productId ? { ...item, quantity } : item)
    );
  }, [removeItem]);

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