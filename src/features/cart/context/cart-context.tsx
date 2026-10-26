import { useCatalog } from "@/features/catalog/context/catalog-context";
import type {
  ShippingQuote,
  ShippingService,
} from "@/features/cart/api/shipping-service";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type CatalogProduct,
} from "@/features/catalog/data/catalog-products";
import { useGamification } from "@/features/gamification/context/gamification-context";

type StoredCartItem = {
  productId: string;
  quantity: number;
  product?: CatalogProduct;
};

export type CartItem = CatalogProduct & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  ready: boolean;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    product: string | CatalogProduct,
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

function readInitialCart(): StoredCartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(entry => entry && typeof entry.productId === "string" &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(entry.productId) &&
      Number.isInteger(entry.quantity) && entry.quantity > 0 && entry.quantity <= 100)
      .map(({ productId, quantity }) => ({ productId, quantity }));
  } catch { return []; }
}

function missingProduct(id: string): CatalogProduct {
  return { id, slug: "", name: "Produto indisponível", price: 0, image: "", images: [],
    rating: 0, reviews: 0, categories: [], category: null, subcategory: "",
    description: "", composition: "", benefits: "", howToUse: "", available: false, stockQuantity: 0 };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { trackCartAdd } = useGamification();
  const { products, loading, error } = useCatalog();
  const [entries, setEntries] = useState<StoredCartItem[]>(readInitialCart);
  const items = useMemo<CartItem[]>(() => loading || error ? [] : entries.map(entry => ({
    ...(products.find(product => product.id === entry.productId) ?? missingProduct(entry.productId)),
    quantity: entry.quantity,
  })), [entries, products, loading, error]);
  const ready = !loading && !error && items.length > 0 && items.every(item => item.available && item.quantity <= item.stockQuantity);
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
    ready && storedShipping?.fingerprint === cartFingerprint &&
    Date.parse(storedShipping.quote.expires_at) > Date.now()
      ? storedShipping.quote
      : null;
  const shippingService =
    shippingQuote?.services.find(
      (service) => service.id === storedShipping?.serviceId,
    ) ?? null;
  useEffect(() => {
    if (!storedShipping) return;
    if (!loading && !error && storedShipping.fingerprint !== cartFingerprint) {
      setStoredShipping(null);
      return;
    }
    const timeout = window.setTimeout(
      () => setStoredShipping(null),
      Math.max(0, Date.parse(storedShipping.quote.expires_at) - Date.now()),
    );
    return () => window.clearTimeout(timeout);
  }, [storedShipping, cartFingerprint, loading, error]);
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
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  }, [entries]);

  const itemCount = entries.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      items,
      ready,
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
        product: string | CatalogProduct,
        quantity: number = 1,
        options?: { openDrawer?: boolean },
      ) => {
        const safeQuantity = Math.max(1, Math.floor(quantity));
        const productId = typeof product === "string" ? product : product.id;
        const catalogProduct = products.find(item => item.id === productId);
        if (!catalogProduct?.available || !Number.isFinite(safeQuantity)) return;
        setEntries(previous => {
          const current = previous.find(entry => entry.productId === productId);
          const nextQuantity = Math.min(catalogProduct.stockQuantity, 100, (current?.quantity ?? 0) + safeQuantity);
          return current ? previous.map(entry => entry.productId === productId ? { productId, quantity: nextQuantity } : entry)
            : [...previous, { productId, quantity: nextQuantity }];
        });

        trackCartAdd(safeQuantity);
        if (options?.openDrawer !== false) {
          setIsCartOpen(true);
        }
      },
      updateItemQuantity: (productId: string, quantity: number) => {
        if (quantity < 1) {
          setEntries((prev) => prev.filter((item) => item.productId !== productId));
          return;
        }

        if (!Number.isInteger(quantity)) return;
        const product = products.find(item => item.id === productId);
        if (!product?.available) return;
        setEntries(previous => previous.map(entry => entry.productId === productId
          ? { productId, quantity: Math.min(quantity, product.stockQuantity, 100) } : entry));
      },
      removeItem: (productId: string) => {
        setEntries((prev) => prev.filter((item) => item.productId !== productId));
      },
      reset: () => {
        setEntries([]);
        setStoredShipping(null);
        setIsCartOpen(false);
      },
    }),
    [
      isCartOpen,
      ready,
      entries,
      products,
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
