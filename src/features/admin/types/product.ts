export interface CreateProductPayload {
  slug?: string | null;
  name: string;
  price: number;
  active?: boolean;
  volume?: string | null;
  shipping_width?: number | null;
  shipping_height?: number | null;
  shipping_length?: number | null;
  shipping_weight?: number | null;
  target_audience?: string | null;
  product_type?: string | null;
  skin_type?: string | null;
  hair_type?: string | null;
  color?: string | null;
  fragrance?: string | null;
  spf?: number | null;
  vegan?: boolean;
  cruelty_free?: boolean;
  hypoallergenic?: boolean;
  brand_id?: number | null;
  description_id?: number | null;
  supplier_products?: {
    supplier_name: string;
    supplier_price: number;
    lead_time_days?: number | null;
  }[] | null;
}

export interface CreateProductResponse {
  id: string;
  slug: string;
  name: string;
  message: string;
}

export interface UpdateProductPayload {
  name?: string;
  price?: number;
  active?: boolean;
  slug?: string;
}

export interface UpdateProductResponse {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface ProductImageResponse {
  id: number;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  order: number;
}

export interface UploadProductImageOptions {
  alt_text?: string | null;
  order?: number;
}
