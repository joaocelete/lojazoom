import { createContext, useContext, useState } from "react";
import type { Product } from "@shared/schema";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  width: number;
  height: number;
  pricePerM2: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, width: number, height: number, total: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, width: number, height: number, total: number) => {
    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      image: product.imageUrl || "",
      width,
      height,
      pricePerM2: parseFloat(product.pricePerM2),
      total,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.length;
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
