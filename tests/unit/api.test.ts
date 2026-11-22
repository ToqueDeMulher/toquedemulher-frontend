import { describe, expect, it, vi } from "vitest";
import { apiRequest, ApiError, AUTH_TOKEN_KEY, AUTH_USER_KEY, REFRESH_TOKEN_KEY, AUTH_UNAUTHORIZED_EVENT } from "@/shared/api/api-client";
import { getCheckoutStatus } from "@/features/cart/api/checkout-service";
import { normalizeAuthUser } from "@/features/auth/api/auth-service";
import { shippingDeadline, formatShippingMoney } from "@/features/cart/api/shipping-service";
import { normalizeCheckoutFlowStep } from "@/features/cart/lib/checkout-flow";
import { updateProduct } from "@/features/admin/api/product-service";

function respond(body: unknown, status = 200) {
  const fetch = vi.fn().mockResolvedValue(new Response(body === undefined ? null : JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
describe("API, checkout and account contracts", () => {
  it("attaches the session token and supports JSON and empty responses", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "fixture-token");
    const fetch = respond({ ok: true });
    await expect(apiRequest("/user/me")).resolves.toEqual({ ok: true });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/v1/user/me");
    expect(options.headers.get("Authorization")).toBe("Bearer fixture-token");
    respond(undefined, 204);
    await expect(apiRequest("/remove")).resolves.toBeUndefined();
  });
  it("clears all authentication state and notifies listeners on 401", async () => {
    [AUTH_TOKEN_KEY, AUTH_USER_KEY, REFRESH_TOKEN_KEY].forEach(key => localStorage.setItem(key, "fixture"));
    const event = vi.fn();
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, event, { once: true });
    respond({ detail: "Sessão expirada" }, 401);
    await expect(apiRequest("/user/me")).rejects.toMatchObject({ status: 401, message: "Sessão expirada" });
    expect(event).toHaveBeenCalledOnce();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
  });
  it.each([403, 422, 429, 500, 503])("preserves session on HTTP %s", async (status) => {
    localStorage.setItem(AUTH_TOKEN_KEY, "fixture");
    respond({ detail: "Tente novamente" }, status);
    await expect(apiRequest("/payments/checkout")).rejects.toBeInstanceOf(ApiError);
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("fixture");
  });
  it("reports validation arrays without exposing field internals", async () => {
    respond({ detail: [{ loc: ["body", "password"], input: "secret" }] }, 422);
    await expect(apiRequest("/user/register")).rejects.toThrow("Verifique os campos");
  });
  it("handles network failure and invalid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(apiRequest("/products")).rejects.toThrow("Não foi possível conectar");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Error</html>")));
    await expect(apiRequest("/products")).rejects.toThrow("Não foi possível carregar");
  });
  it("aborts a request after the configured deadline", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    })));
    const request = apiRequest("/products");
    const assertion = expect(request).rejects.toThrow("demorou");
    await vi.advanceTimersByTimeAsync(15001);
    await assertion;
  });
  it("encodes status IDs and prevents cached payment responses", async () => {
    const fetch = respond({ status: "pending" });
    await getCheckoutStatus("fake/id");
    expect(fetch.mock.calls[0][0]).toBe("/api/v1/payments/checkout/fake%2Fid");
    expect(fetch.mock.calls[0][1].cache).toBe("no-store");
  });
  it.each(["admin", "cliente", "customer"] as const)("maps backend role %s", role => {
    expect(normalizeAuthUser({ id: "user", name: "Cliente", email: "user@example.com", role }).role)
      .toBe(role === "admin" ? "admin" : "customer");
  });
  it("sends product changes to the authenticated admin API", async () => {
    const fetch = respond({ id: "product" });
    await updateProduct("product", { name: "Batom", price: 49.9, active: true });
    expect(fetch.mock.calls[0][1].method).toBe("PATCH");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ name: "Batom", price: 49.9, active: true });
  });
  it.each([undefined, "", "invalid", "success"])("normalizes unsupported checkout step %s", step => {
    expect(normalizeCheckoutFlowStep(step)).toBe("address");
  });
  it("formats freight prices and date ranges for the customer", () => {
    expect(shippingDeadline({ delivery_min: 2, delivery_max: 2 })).toBe("2 dias úteis");
    expect(shippingDeadline({ delivery_min: 2, delivery_max: 4 })).toBe("2 a 4 dias úteis");
    expect(formatShippingMoney(19.9)).toMatch(/19,90/);
  });
});
