import {
  CreateProductPayload,
  CreateProductResponse,
  ProductImageResponse,
  UpdateProductPayload,
  UploadProductImageOptions,
  AdminCategory,
  AdminProduct,
} from "@/features/admin/types/product";
import { apiRequest } from "@/shared/api/api-client";
import type { CatalogProduct } from "@/features/catalog/data/catalog-products";
import { productImageError } from "@/features/admin/lib/product-form";

export async function getPublishedProducts(): Promise<CatalogProduct[]> {
  return apiRequest<CatalogProduct[]>("/products");
}

export async function getPublishedProduct(productId: string): Promise<CatalogProduct> {
  return apiRequest<CatalogProduct>(`/products/${encodeURIComponent(productId)}`);
}

export type { AdminProduct } from "@/features/admin/types/product";

export const getAdminProducts = (filters: { search?: string; status?: string; categoryId?: number } = {}) => {
  const query = new URLSearchParams();
  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.status && filters.status !== "all") query.set("status", filters.status);
  if (filters.categoryId) query.set("category_id", String(filters.categoryId));
  const suffix = query.size ? `?${query.toString()}` : "";
  return apiRequest<AdminProduct[]>(`/products/admin/all${suffix}`);
};

export const getAdminProduct = (productId: string) =>
  apiRequest<AdminProduct>(`/products/admin/${encodeURIComponent(productId)}`);

export const getAdminCategories = () =>
  apiRequest<AdminCategory[]>("/products/admin/categories");

export const updateProduct = (
  productId: string,
  payload: UpdateProductPayload,
) =>
  apiRequest<AdminProduct>(`/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteProduct = (productId: string) =>
  apiRequest<{ message: string }>(`/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });

export const publishProduct = (productId: string) =>
  apiRequest<AdminProduct>(`/products/${encodeURIComponent(productId)}/publish`, { method: "POST" });

export const unpublishProduct = (productId: string) =>
  apiRequest<AdminProduct>(`/products/${encodeURIComponent(productId)}/unpublish`, { method: "POST" });

export const setPrimaryProductImage = (productId: string, imageId: number) =>
  apiRequest<AdminProduct>(`/products/${encodeURIComponent(productId)}/images/${imageId}/primary`, { method: "POST" });

export async function createProduct(payload: CreateProductPayload) {
  return apiRequest<CreateProductResponse>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadProductImage(
  productId: string,
  file: File,
  options: UploadProductImageOptions = {}
): Promise<ProductImageResponse> {
  const error = productImageError(file);
  if (error) throw new Error(error);
  if (options.order !== undefined && (!Number.isInteger(options.order) || options.order < 1)) {
    throw new Error("A ordenação deve ser um número inteiro maior ou igual a 1.");
  }
  const formData = new FormData();
  formData.append("file", file);

  if (options.alt_text?.trim()) {
    formData.append("alt_text", options.alt_text.trim());
  }

  if (typeof options.order === "number") {
    formData.append("order", String(options.order));
  }

  return apiRequest<ProductImageResponse>(`/products/${encodeURIComponent(productId)}/images/upload`, {
    method: "POST",
    body: formData,
  });
}
