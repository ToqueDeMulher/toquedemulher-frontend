export interface CreateProductPayload {
  name: string;
  price: number;
  active: boolean;
  volume?: string | null;
  target_audience?: string | null;
  product_type?: string | null;
  skin_type?: string | null;
  hair_type?: string | null;
  color?: string | null;
  fragrance?: string | null;
  spf?: number | null;
  vegan: boolean;
  cruelty_free: boolean;
  hypoallergenic: boolean;
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
  order?: number;
}
