import { routes } from "@/app/router/paths";
import type { CartItem } from "@/features/cart/context/cart-context";
import { apiRequest } from "@/shared/api/api-client";

export type CheckoutSessionResponse = {
  checkout_url: string;
  session_id: string;
  client_secret?: string | null;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createCheckoutSession(addressId: string, items: CartItem[]) {
  return apiRequest<CheckoutSessionResponse>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify({
      address_id: addressId,
      items: items.map((item) => ({
        id: item.id,
        slug: slugify(item.name),
        name: item.name,
        product_url: routes.product(item.id),
        unit_price: item.price,
        quantity: item.quantity,
      })),
    }),
  });
}
