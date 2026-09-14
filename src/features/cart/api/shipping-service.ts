import { apiRequest } from "@/shared/api/api-client";
import type { CartItem } from "@/features/cart/context/cart-context";

export type ShippingService = {
  id: number;
  name: string;
  company: string;
  cost: number;
  price: number;
  delivery_min: number;
  delivery_max: number;
};
export type ShippingQuote = {
  id: string;
  postal_code: string;
  subtotal: number;
  expires_at: string;
  services: ShippingService[];
  item_prices: { name: string; unit_price: number }[];
};
export type ShippingSelection = {
  quote_id: string;
  service_id: number;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_document: string;
};
export type Shipment = {
  id: string;
  order_id: string;
  service: string;
  company: string;
  price: number;
  delivery_min: number;
  delivery_max: number;
  status: string;
  labels: { id: string; status: string | null; tracking: string | null }[];
  updated_at: string;
  payment_status?: string;
  recipient_name?: string;
  cost?: number;
  invoice_key?: string | null;
  print_url?: string | null;
  last_error?: string | null;
};

export function quoteShipping(
  postalCode: string,
  items: CartItem[],
  signal?: AbortSignal,
) {
  return apiRequest<ShippingQuote>("/shipping/quotes", {
    method: "POST",
    signal,
    body: JSON.stringify({
      postal_code: postalCode,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
      })),
    }),
  });
}
export const getShipment = (orderId: string) =>
  apiRequest<Shipment>(`/shipping/orders/${encodeURIComponent(orderId)}`);
export const syncShipment = (orderId: string) =>
  apiRequest<Shipment>(`/shipping/orders/${encodeURIComponent(orderId)}/sync`, {
    method: "POST",
  });
export const shipmentStatusLabels: Record<string, string> = {
  pending: "Aguardando preparação",
  creating: "Criando etiquetas",
  carted: "Aguardando pagamento do frete",
  paying: "Pagando etiquetas",
  paid: "Etiquetas pagas",
  generating: "Gerando etiquetas",
  ready: "Pronto para postagem",
  posted: "Em transporte",
  delivered: "Entregue",
  cancelled: "Cancelado",
  needs_review: "Conferência necessária",
};
export const formatShippingMoney = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function shippingDeadline(service: {
  delivery_min: number;
  delivery_max: number;
}) {
  return service.delivery_min === service.delivery_max
    ? `${service.delivery_max} dias úteis`
    : `${service.delivery_min} a ${service.delivery_max} dias úteis`;
}
