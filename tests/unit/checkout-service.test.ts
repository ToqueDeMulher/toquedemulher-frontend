import { describe, expect, it, vi } from "vitest";
import {
  cancelCheckout, createCheckoutSession, getActiveCheckout, getCheckoutStatus,
  getPaymentMethods, resumeCheckout,
} from "@/features/cart/api/checkout-service";
import type { CartItem } from "@/features/cart/context/cart-context";
import type { ShippingSelection } from "@/features/cart/api/shipping-service";
import { mockJsonResponse, mockPendingRequest } from "./http-fixtures";

const id = "a1000000-0000-4000-8000-000000000001";
const items: CartItem[] = [{ id, slug: "batom", name: "Batom", price: 49.9, image: "", images: [],
  available: true, stockQuantity: 3, rating: 0, reviews: 0, categories: [], category: null,
  subcategory: "", description: "", composition: "", benefits: "", howToUse: "", quantity: 2 }];
const shipping: ShippingSelection = { quote_id: "fixture-quote", service_id: 2,
  recipient_name: "Cliente", recipient_email: "cliente@example.test",
  recipient_phone: "11999999999", recipient_document: "52998224725" };
const session = { session_id: "fixture-session", order_id: "fixture-order", checkout_url: null };
const create = (key = "fixture-idempotency-key") =>
  createCheckoutSession("fixture-address", items, key, shipping, "PIX");

describe("checkout HTTP contracts and request lifetime", () => {
  it.each(["PIX", "CARD"] as const)("creates a %s session with IDs, quantities and selected shipping, without client prices", async method => {
    const fetch = mockJsonResponse(session);
    const originalItems = structuredClone(items);

    await expect(createCheckoutSession("fixture-address", items, "fixture-key", shipping, method)).resolves.toEqual(session);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/v1/payments/checkout");
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual({ address_id: "fixture-address", method,
      idempotency_key: "fixture-key", shipping, items: [{ id, product_url: `/produto/${id}`, quantity: 2 }] });
    expect(items).toEqual(originalItems);
  });

  it("keeps the caller's idempotency key when retrying an uncertain request", async () => {
    const fetch = mockJsonResponse(session);
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ detail: "Pagamento em verificação." }), { status: 503 }));

    await expect(create()).rejects.toMatchObject({ status: 503, message: "Pagamento em verificação." });
    expect(fetch).toHaveBeenCalledOnce(); // The service does not retry a payment POST automatically.
    await expect(create()).resolves.toEqual(session);

    expect(fetch).toHaveBeenCalledTimes(2);
    const bodies = fetch.mock.calls.map(([, options]) => JSON.parse(String(options?.body)));
    expect(bodies[0]).toEqual(bodies[1]);
    expect(bodies[1].idempotency_key).toBe("fixture-idempotency-key");
  });

  it.each([409, 422])("propagates checkout HTTP %s without creating another attempt", async status => {
    const fetch = mockJsonResponse({ detail: "Confira os dados do pagamento." }, status);
    await expect(create()).rejects.toMatchObject({ status, message: "Confira os dados do pagamento." });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("times out a payment POST without silently retrying it", async () => {
    vi.useFakeTimers();
    const fetch = mockPendingRequest();
    const request = create();
    const assertion = expect(request).rejects.toThrow("A conexão demorou mais que o esperado.");
    await vi.advanceTimersByTimeAsync(14_999);
    expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(fetch).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("aborts an in-flight status request when its caller cancels", async () => {
    const fetch = mockPendingRequest();
    const controller = new AbortController();
    const assertion = expect(getCheckoutStatus(session.session_id, controller.signal)).rejects.toThrow("A conexão");
    controller.abort();
    await assertion;
    expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(fetch.mock.calls[0][1]?.cache).toBe("no-store");
  });

  it("loads available methods with a cancellable request", async () => {
    const fetch = mockJsonResponse(["PIX", "CARD"]);
    await expect(getPaymentMethods(new AbortController().signal)).resolves.toEqual(["PIX", "CARD"]);
    expect(fetch.mock.calls[0][0]).toBe("/api/v1/payments/methods");
    expect(fetch.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("recovers the existing active checkout without caching or creating another session", async () => {
    const fetch = mockJsonResponse(session);
    await expect(getActiveCheckout()).resolves.toEqual(session);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe("/api/v1/payments/checkout/active");
    expect(fetch.mock.calls[0][1]?.cache).toBe("no-store");
    expect(fetch.mock.calls[0][1]?.body).toBeUndefined();
  });

  it.each([
    { operation: cancelCheckout, action: "cancel", response: { ...session, status: "cancelled", amount: 99.8, currency: "BRL" } },
    { operation: resumeCheckout, action: "resume", response: session },
  ])("posts $action using an encoded order ID", async ({ operation, action, response }) => {
    const fetch = mockJsonResponse(response);
    await expect(operation("order/with?special#characters")).resolves.toEqual(response);
    expect(fetch.mock.calls[0][0]).toBe(`/api/v1/payments/checkout/order%2Fwith%3Fspecial%23characters/${action}`);
    expect(fetch.mock.calls[0][1]?.method).toBe("POST");
    expect(fetch.mock.calls[0][1]?.body).toBeUndefined();
  });
});
