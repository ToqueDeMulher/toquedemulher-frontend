import type {
  ShippingQuote,
  ShippingService,
} from "@/features/cart/api/shipping-service";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getProductById,
  type CatalogProduct,
} from "@/features/catalog/data/catalog-products";
import { useGamification } from "@/features/gamification/context/gamification-context";

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
  cartFingerprint: string;
  shippingQuote: ShippingQuote | null;
  shippingService: ShippingService | null;
  setShippingQuote: (quote: ShippingQuote) => void;
  selectShippingService: (id: number) => void;
  clearShippingQuote: () => void;
};

type StoredShipping = {
  quote: ShippingQuote;
  fingerprint: string;
  serviceId: number;
};
function readShipping(): StoredShipping | null {
  try {
    const data = JSON.parse(
      sessionStorage.getItem("tdm_shipping_selection") || "null",
    );
    return data?.quote?.services?.length &&
      Number.isFinite(Date.parse(data.quote.expires_at))
      ? data
      : null;
  } catch {
    return null;
  }
}

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
  const [storedShipping, setStoredShipping] = useState<StoredShipping | null>(
    readShipping,
  );
  const cartFingerprint = JSON.stringify(
    items
      .map((item) => [item.id, item.quantity, item.price])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  );
  const shippingQuote =
    storedShipping?.fingerprint === cartFingerprint &&
    Date.parse(storedShipping.quote.expires_at) > Date.now()
      ? storedShipping.quote
      : null;
  const shippingService =
    shippingQuote?.services.find(
      (service) => service.id === storedShipping?.serviceId,
    ) ?? null;
  useEffect(() => {
    if (!storedShipping) return;
    if (storedShipping.fingerprint !== cartFingerprint) {
      setStoredShipping(null);
      return;
    }
    const timeout = window.setTimeout(
      () => setStoredShipping(null),
      Math.max(0, Date.parse(storedShipping.quote.expires_at) - Date.now()),
    );
    return () => window.clearTimeout(timeout);
  }, [storedShipping, cartFingerprint]);
  useEffect(() => {
    try {
      if (storedShipping)
        sessionStorage.setItem(
          "tdm_shipping_selection",
          JSON.stringify(storedShipping),
        );
      else sessionStorage.removeItem("tdm_shipping_selection");
    } catch {}
  }, [storedShipping]);

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
    } catch {}
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      items,
      clearShippingQuote: () => setStoredShipping(null),
      cartFingerprint,
      shippingQuote,
      shippingService,
      setShippingQuote: (quote: ShippingQuote) =>
        setStoredShipping({
          quote,
          fingerprint: cartFingerprint,
          serviceId: quote.services[0].id,
        }),
      selectShippingService: (serviceId: number) =>
        setStoredShipping((current) =>
          current ? { ...current, serviceId } : null,
        ),
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
        setStoredShipping(null);
        setIsCartOpen(false);
      },
    }),
    [
      isCartOpen,
      itemCount,
      items,
      subtotal,
      trackCartAdd,
      cartFingerprint,
      shippingQuote,
      shippingService,
    ],
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
