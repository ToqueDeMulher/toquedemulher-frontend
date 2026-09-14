import { apiRequest } from "@/shared/api/api-client";
import type { Shipment } from "@/features/cart/api/shipping-service";
export type ShippingConnection = {
  environment: string;
  configured: boolean;
  connected: boolean;
  expires_at: string | null;
};
export type ShippingProduct = {
  id: string;
  name: string;
  shipping_width: number | null;
  shipping_height: number | null;
  shipping_length: number | null;
  shipping_weight: number | null;
};
export const getShippingConnection = () =>
  apiRequest<ShippingConnection>("/shipping/admin/connection");
export const authorizeShipping = () =>
  apiRequest<{ url: string }>("/shipping/admin/authorize", {
    method: "POST",
    credentials: "include",
  });
export const getAdminShipments = () =>
  apiRequest<Shipment[]>("/shipping/admin/shipments");
export const getShippingProducts = () =>
  apiRequest<ShippingProduct[]>("/shipping/admin/products");
export const saveShippingDimensions = (
  id: string,
  dimensions: Omit<ShippingProduct, "id" | "name">,
) =>
  apiRequest(`/shipping/admin/products/${encodeURIComponent(id)}/dimensions`, {
    method: "PUT",
    body: JSON.stringify(dimensions),
  });
export const adminShipmentAction = (
  id: string,
  action: string,
  body?: object,
) =>
  apiRequest<Shipment>(
    `/shipping/admin/shipments/${encodeURIComponent(id)}/${action}`,
    { method: "POST", body: body ? JSON.stringify(body) : undefined },
  );
