import {
  CreateProductPayload,
  ProductImageResponse,
  UploadProductImageOptions,
} from "@/shared/types/product";
import { apiRequest } from "@/shared/services/apiClient";

export async function createProduct(payload: CreateProductPayload) {
  return apiRequest("/products/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadProductImage(
  productId: number,
  file: File,
  options: UploadProductImageOptions = {}
): Promise<ProductImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (options.alt_text) {
    formData.append("alt_text", options.alt_text);
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
