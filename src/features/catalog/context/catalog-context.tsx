import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest, resolveApiAssetUrl } from "@/shared/api/api-client";
import type { CatalogProduct } from "@/features/catalog/data/catalog-products";

type CatalogState = {
  products: CatalogProduct[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  freeShippingThreshold: number | null;
  contactEmail: string | null;
};
const CatalogContext = createContext<CatalogState | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<{ free_shipping_threshold: number; contact_email: string | null } | null>(null);

  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiRequest<CatalogProduct[]>("/products", { signal: controller.signal, cache: "no-store" })
      .then(products => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(products) || products.some(product =>
          typeof product.id !== "string" || !/^[a-f0-9-]{36}$/i.test(product.id) ||
          typeof product.name !== "string" || !Number.isFinite(product.price) || product.price < 0 ||
          !Array.isArray(product.categories) || !product.categories.every(category => typeof category === "string") ||
          !Number.isInteger(product.stockQuantity) || typeof product.available !== "boolean"
        )) throw new Error("Não foi possível carregar os produtos. Tente novamente.");
        setData(products.map(product => ({
          ...product,
          image: product.image ? resolveApiAssetUrl(product.image) : "",
          images: product.images?.map(image => ({ ...image, url: resolveApiAssetUrl(image.url) })) ?? [],
        })));
      })
      .catch(reason => {
        if (controller.signal.aborted) return;
        setData([]);
        setError(reason instanceof Error ? reason.message : "Não foi possível carregar os produtos.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    apiRequest<NonNullable<typeof store>>("/store", { signal: controller.signal, cache: "no-store" })
      .then(value => { if (!controller.signal.aborted) setStore(value); })
      .catch(() => { if (!controller.signal.aborted) setStore(null); });
    return () => controller.abort();
  }, [pathname, revision]);

  return <CatalogContext.Provider value={{
    products: loading || error ? [] : data, loading, error,
    reload: () => setRevision(value => value + 1),
    freeShippingThreshold: store && store.free_shipping_threshold > 0 ? store.free_shipping_threshold : null,
    contactEmail: store?.contact_email ?? null,
  }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("CatalogProvider ausente");
  return value;
}
