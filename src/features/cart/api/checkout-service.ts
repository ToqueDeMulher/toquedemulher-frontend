import type { ShippingSelection } from "./shipping-service";
import { routes } from "@/app/router/paths";
import type { CartItem } from "@/features/cart/context/cart-context";
import { apiRequest } from "@/shared/api/api-client";

export type CheckoutSessionResponse = {
  checkout_url: string;
  session_id: string;
  order_id: string;
  client_secret?: string | null;
};

export type CheckoutPaymentStatus =
  "pending" | "approved" | "rejected" | "cancelled" | "refunded";

export type CheckoutStatusResponse = {
  session_id: string;
  order_id: string;
  status: CheckoutPaymentStatus;
  amount: number;
  currency: string;
};

export function createCheckoutSession(
  addressId: string,
  items: CartItem[],
  idempotencyKey: string,
  shipping: ShippingSelection,
) {
  return apiRequest<CheckoutSessionResponse>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify({
      address_id: addressId,
      shipping,
      idempotency_key: idempotencyKey,
      items: items.map((item) => ({
        id: item.id,
        product_url: routes.product(item.id),
        quantity: item.quantity,
      })),
    }),
  });
}

export function getCheckoutStatus(sessionId: string) {
  return apiRequest<CheckoutStatusResponse>(
    `/payments/checkout/${encodeURIComponent(sessionId)}`,
  );
}

export function cancelCheckout(orderId: string) {
  return apiRequest<CheckoutStatusResponse>(
    `/payments/checkout/${encodeURIComponent(orderId)}/cancel`,
    { method: "POST" },
  );
}
