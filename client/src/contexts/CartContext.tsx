import { createContext, useContext, useState, useEffect } from "react";
import type { Product } from "@shared/schema";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  pricingType: "per_m2" | "fixed";
  width?: number;
  height?: number;
  pricePerM2?: number;
  quantity?: number;
  fixedPrice?: number;
  total: number;
  artOption: "upload" | "create";
  artFile?: string;
  artCreationFee: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, width: number, height: number, total: number, artOption: "upload" | "create", artFile?: string, quantity?: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  artCreationFeeTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        
        return parsed.map((item: any) => ({
          ...item,
          pricingType: item.pricingType || "per_m2",
          width: item.width ? Number(item.width) : undefined,
          height: item.height ? Number(item.height) : undefined,
          pricePerM2: item.pricePerM2 ? Number(item.pricePerM2) : undefined,
          quantity: item.quantity ? Number(item.quantity) : undefined,
          fixedPrice: item.fixedPrice ? Number(item.fixedPrice) : undefined,
          total: Number(item.total) || 0,
          artCreationFee: Number(item.artCreationFee) || 0,
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const addItem = (product: Product, width: number, height: number, total: number, artOption: "upload" | "create", artFile?: string, quantity?: number) => {
    const artCreationFee = artOption === "create" ? 35.00 : 0;
    
    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      image: product.imageUrl || "",
      pricingType: product.pricingType as "per_m2" | "fixed",
      total,
      artOption,
      artFile,
      artCreationFee,
    };

    if (product.pricingType === "fixed") {
      newItem.quantity = quantity || 1;
      newItem.fixedPrice = parseFloat(product.fixedPrice || "0");
    } else {
      newItem.width = width;
      newItem.height = height;
      newItem.pricePerM2 = parseFloat(product.pricePerM2 || "0");
    }
    
    console.log("CartContext - addItem:", {
      productName: product.name,
      pricingType: product.pricingType,
      total,
      totalType: typeof total,
      isNaN: isNaN(total),
      artCreationFee,
      newItem
    });
    
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items]);

  const totalItems = items.length;
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const artCreationFeeTotal = items.reduce((sum, item) => sum + item.artCreationFee, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
        artCreationFeeTotal,
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
