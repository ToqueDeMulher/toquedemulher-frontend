import {
  CreateProductPayload,
  ProductImageResponse,
  UploadProductImageOptions,
} from "@/features/admin/types/product";
import { apiRequest } from "@/shared/api/api-client";
import type { CatalogProduct } from "@/features/catalog/data/catalog-products";

export async function getPublishedProducts(): Promise<CatalogProduct[]> {
  return apiRequest<CatalogProduct[]>("/products");
}

export async function getPublishedProduct(productId: string): Promise<CatalogProduct> {
  return apiRequest<CatalogProduct>(`/products/${productId}`);
}

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  active: boolean;
  image: string;
};

export const getAdminProducts = () =>
  apiRequest<AdminProduct[]>("/products/admin/all");

export const updateProduct = (
  productId: string,
  payload: Pick<AdminProduct, "name" | "price" | "active">,
) =>
  apiRequest<AdminProduct>(`/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteProduct = (productId: string) =>
  apiRequest<{ message: string }>(`/products/${productId}`, {
    method: "DELETE",
  });

export async function createProduct(payload: CreateProductPayload) {
  return apiRequest<{ id: string; slug: string; name: string }>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadProductImage(
  productId: string,
  file: File,
  options: UploadProductImageOptions = {}
): Promise<ProductImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (options.alt_text) {
    formData.append("alt_text", options.alt_text);
  }

  if (typeof options.order === "number") {
    formData.append("order", String(options.order));
  }

  const params = new URLSearchParams();
  if (typeof options.is_primary === "boolean") {
    params.set("is_primary", String(options.is_primary));
  }

  const query = params.size ? `?${params.toString()}` : "";
  return apiRequest<ProductImageResponse>(`/products/${productId}/images${query}`, {
    method: "POST",
    body: formData,
  });
}
