"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
  packageId: string;
  productName: string;
  packageName: string;
  price: number;
  image: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (packageId: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.packageId === item.packageId);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (packageId: string) => {
    setItems(prev => prev.filter(i => i.packageId !== packageId));
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce((sum, i) => sum + i.price, 0);
  const totalItems = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider');
  return ctx;
}