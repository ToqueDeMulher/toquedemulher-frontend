import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { CartProvider, useCart } from "@/features/cart/context/cart-context";
import type { CatalogProduct } from "@/features/catalog/data/catalog-products";
import type { ShippingQuote } from "@/features/cart/api/shipping-service";

const state = vi.hoisted(() => ({ products: [] as CatalogProduct[], loading: false, error: null as string | null }));
vi.mock("@/features/catalog/context/catalog-context", () => ({ useCatalog: () => state }));
vi.mock("@/features/gamification/context/gamification-context", () => ({ useGamification: () => ({ trackCartAdd: vi.fn() }) }));

const id = "a1000000-0000-4000-8000-000000000001";
function product(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return { id, slug: "batom", name: "Batom", price: 49.9, image: "", images: [], available: true,
    stockQuantity: 3, rating: 0, reviews: 0, categories: [], category: null, subcategory: "",
    description: "", composition: "", benefits: "", howToUse: "", ...overrides };
}
function cart() {
  state.products = [product()];
  state.loading = false;
  state.error = null;
  return renderHook(useCart, { wrapper: CartProvider });
}
function quote(): ShippingQuote {
  return { id: "quote", postal_code: "70040010", subtotal: 49.9,
    expires_at: new Date(Date.now() + 60_000).toISOString(), item_prices: [],
    services: [{ id: 1, name: "PAC", company: "Correios", price: 12, cost: 12, delivery_min: 2, delivery_max: 4 }] };
}

describe("cart ownership of prices and quantities", () => {
  it("replaces client-stored prices with the live catalog and caps new additions", () => {
    localStorage.setItem("tdm_cart_items", JSON.stringify([{ productId: id, quantity: 1, product: { price: 0.01 } }]));
    const { result } = cart();
    expect(result.current.subtotal).toBe(49.9);
    act(() => result.current.addItem(id, 10));
    expect(result.current.itemCount).toBe(3);
    expect(result.current.subtotal).toBeCloseTo(149.7);
    expect(JSON.parse(localStorage.getItem("tdm_cart_items")!)).toEqual([{ productId: id, quantity: 3 }]);
  });
  it.each([null, {}, "broken-json", [{ productId: "fake", quantity: 1 }], [{ productId: id, quantity: 0 }], [{ productId: id, quantity: 101 }]])(
    "ignores invalid stored cart data %j", (stored) => {
      localStorage.setItem("tdm_cart_items", typeof stored === "string" ? stored : JSON.stringify(stored));
      const { result } = cart();
      expect(result.current.items).toEqual([]);
      expect(result.current.ready).toBe(false);
    },
  );
  it("rejects nonexistent and unavailable products and non-finite quantities", () => {
    const { result, rerender } = cart();
    act(() => { result.current.addItem("missing"); result.current.addItem(id, NaN); });
    expect(result.current.itemCount).toBe(0);
    state.products = [product({ available: false })];
    rerender();
    act(() => result.current.addItem(id));
    expect(result.current.items).toEqual([]);
  });
  it("invalidates checkout after the catalog stock drops", () => {
    const { result, rerender } = cart();
    act(() => result.current.addItem(id, 3));
    expect(result.current.ready).toBe(true);
    state.products = [product({ stockQuantity: 1 })];
    rerender();
    expect(result.current.ready).toBe(false);
  });
  it("removes quantity zero, ignores fractions and resets drawer and shipping", () => {
    const { result } = cart();
    act(() => result.current.addItem(id, 2));
    act(() => result.current.updateItemQuantity(id, 1.5));
    expect(result.current.itemCount).toBe(2);
    act(() => result.current.updateItemQuantity(id, 0));
    expect(result.current.items).toEqual([]);
    act(() => result.current.addItem(id));
    expect(result.current.isCartOpen).toBe(true);
    act(() => result.current.reset());
    expect(result.current.itemCount).toBe(0);
    expect(result.current.isCartOpen).toBe(false);
    expect(result.current.shippingQuote).toBeNull();
  });
  it("invalidates freight when quantity or price changes", () => {
    const { result, rerender } = cart();
    act(() => result.current.addItem(id));
    act(() => result.current.setShippingQuote(quote()));
    expect(result.current.shippingService?.price).toBe(12);
    state.products = [product({ price: 55 })];
    rerender();
    expect(result.current.shippingQuote).toBeNull();
    act(() => result.current.setShippingQuote(quote()));
    act(() => result.current.updateItemQuantity(id, 2));
    expect(result.current.shippingQuote).toBeNull();
  });
  it("expires the selected freight without changing the cart", () => {
    vi.useFakeTimers();
    const { result } = cart();
    act(() => result.current.addItem(id));
    act(() => result.current.setShippingQuote(quote()));
    act(() => vi.advanceTimersByTime(60_001));
    expect(result.current.shippingQuote).toBeNull();
    expect(result.current.itemCount).toBe(1);
  });
  it("preserves stored cart while the catalog is temporarily unavailable", () => {
    const { result, rerender } = cart();
    act(() => result.current.addItem(id));
    state.error = "Unavailable";
    rerender();
    expect(result.current.ready).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(JSON.parse(localStorage.getItem("tdm_cart_items")!)).toEqual([{ productId: id, quantity: 1 }]);
  });
});
