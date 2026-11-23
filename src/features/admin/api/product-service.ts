import {
  CreateProductPayload,
  CreateProductResponse,
  ProductImageResponse,
  UpdateProductPayload,
  UpdateProductResponse,
  UploadProductImageOptions,
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
  payload: UpdateProductPayload,
) =>
  apiRequest<UpdateProductResponse>(`/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteProduct = (productId: string) =>
  apiRequest<{ message: string }>(`/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });

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
