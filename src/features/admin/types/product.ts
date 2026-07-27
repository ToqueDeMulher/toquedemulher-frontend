export type ProductStatus = "active" | "inactive" | "out_of_stock";

export interface CreateProductPayload {
  name: string;
  description?: string | null;
  short_description?: string | null;
  sku?: string | null;
  brand?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  stock_quantity?: number;
  weight?: number | null;
  status?: ProductStatus;
  is_featured?: boolean;
  tags?: string[] | null;
  attributes?: Record<string, unknown> | null;
  category_id?: number | null;
}

export interface ProductImageResponse {
  id: number;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface UploadProductImageOptions {
  is_primary?: boolean;
  alt_text?: string | null;
}
