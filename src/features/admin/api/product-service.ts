import {
  CreateProductPayload,
  ProductImageResponse,
  UploadProductImageOptions,
} from "@/features/admin/types/product";
import { apiRequest } from "@/shared/api/api-client";

export async function createProduct(payload: CreateProductPayload) {
  return apiRequest<{ id: string; name: string }>("/products", {
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

  if (options.is_primary) formData.append("order", "1");
  return apiRequest<ProductImageResponse>(`/products/${productId}/images`, {
    method: "POST",
    body: formData,
  });
}
