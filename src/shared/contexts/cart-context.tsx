import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getProductById,
  type CatalogProduct,
} from "@/shared/data/catalog-products";
import { useGamification } from "@/shared/contexts/gamification-context";

type StoredCartItem = {
  productId: string;
  quantity: number;
};

export type CartItem = CatalogProduct & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    productId: string,
    quantity?: number,
    options?: { openDrawer?: boolean },
  ) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  reset: () => void;
};

const CART_STORAGE_KEY = "tdm_cart_items";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function hydrateCartItems(entries: StoredCartItem[]) {
  return entries.reduce<CartItem[]>((items, entry) => {
    if (entry.quantity < 1) {
      return items;
    }

    const product = getProductById(entry.productId);
    if (!product) {
      return items;
    }

    items.push({
      ...product,
      quantity: entry.quantity,
    });

    return items;
  }, []);
}

function readInitialCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? hydrateCartItems(parsed as StoredCartItem[])
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { trackCartAdd } = useGamification();
  const [items, setItems] = useState<CartItem[]>(readInitialCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const nextValue: StoredCartItem[] = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextValue));
    } catch {
      // ignore persistence errors
    }
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      toggleCart: () => setIsCartOpen((prev) => !prev),
      addItem: (
        productId: string,
        quantity: number = 1,
        options?: { openDrawer?: boolean },
      ) => {
        const safeQuantity = Math.max(quantity, 1);
        const product = getProductById(productId);
        if (!product) {
          return;
        }

        setItems((prev) => {
          const existingItem = prev.find((item) => item.id === productId);
          if (existingItem) {
            return prev.map((item) =>
              item.id === productId
                ? { ...item, quantity: item.quantity + safeQuantity }
                : item,
            );
          }

          return [
            ...prev,
            {
              ...product,
              quantity: safeQuantity,
            },
          ];
        });

        trackCartAdd(safeQuantity);
        if (options?.openDrawer !== false) {
          setIsCartOpen(true);
        }
      },
      updateItemQuantity: (productId: string, quantity: number) => {
        if (quantity < 1) {
          setItems((prev) => prev.filter((item) => item.id !== productId));
          return;
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, quantity } : item,
          ),
        );
      },
      removeItem: (productId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
      },
      reset: () => {
        setItems([]);
        setIsCartOpen(false);
      },
    }),
    [isCartOpen, itemCount, items, subtotal, trackCartAdd],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
