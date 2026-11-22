import type { ShippingSelection } from "./shipping-service";
import { routes } from "@/app/router/paths";
import type { CartItem } from "@/features/cart/context/cart-context";
import { apiRequest } from "@/shared/api/api-client";

export type CheckoutSessionResponse = {
  checkout_url?: string | null;
  session_id: string;
  order_id: string;
};

export type PaymentMethod = "PIX" | "CARD";

export type PixDetails = {
  code: string;
  image: string;
  expires_at: string;
};

export type CheckoutPaymentStatus =
  "pending" | "approved" | "rejected" | "cancelled" | "refunded" | "expired" | "disputed" | "refund_pending";

export type CheckoutStatusResponse = {
  session_id: string;
  order_id: string;
  status: CheckoutPaymentStatus;
  amount: number;
  currency: string;
  pix?: PixDetails | null;
  checkout_url?: string | null;
};

export function createCheckoutSession(
  addressId: string,
  items: CartItem[],
  idempotencyKey: string,
  shipping: ShippingSelection,
  method: PaymentMethod,
) {
  return apiRequest<CheckoutSessionResponse>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify({
      address_id: addressId,
      shipping,
      method,
      idempotency_key: idempotencyKey,
      items: items.map((item) => ({
        id: item.id,
        product_url: routes.product(item.id),
        quantity: item.quantity,
      })),
    }),
  });
}

export function getCheckoutStatus(sessionId: string, signal?: AbortSignal) {
  return apiRequest<CheckoutStatusResponse>(
    `/payments/checkout/${encodeURIComponent(sessionId)}`,
    { signal, cache: "no-store" },
  );
}

export function cancelCheckout(orderId: string) {
  return apiRequest<CheckoutStatusResponse>(
    `/payments/checkout/${encodeURIComponent(orderId)}/cancel`,
    { method: "POST" },
  );
}

export function getPaymentMethods(signal: AbortSignal) {
  return apiRequest<PaymentMethod[]>("/payments/methods", { signal });
}

export function getActiveCheckout() {
  return apiRequest<CheckoutSessionResponse>("/payments/checkout/active", { cache: "no-store" });
}

export function resumeCheckout(orderId: string) {
  return apiRequest<CheckoutSessionResponse>(
    `/payments/checkout/${encodeURIComponent(orderId)}/resume`,
    { method: "POST" },
  );
}
