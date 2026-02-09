import {
  CreateProductPayload,
  ProductImageResponse,
  UploadProductImageOptions,
} from "@/shared/types/product";

const API_URL = "http://localhost:8000";

export async function createProduct(payload: CreateProductPayload) {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao criar produto");
  }

  return response.json();
}

export async function uploadProductImage(
  productId: string,
  file: File,
  options: UploadProductImageOptions = {}
): Promise<ProductImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (typeof options.order === "number") {
    formData.append("order", String(options.order));
  }

  if (options.alt_text) {
    formData.append("alt_text", options.alt_text);
  }

  const response = await fetch(
    `${API_URL}/products/${productId}/images/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao enviar imagem");
  }

  return response.json();
}
