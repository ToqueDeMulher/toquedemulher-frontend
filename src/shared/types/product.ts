// ---------- Product (tabela Product) ----------
export interface ProductPayload {
  name: string;
  price: number;
  active: boolean;
  volume: string | null;
  target_audience: string | null;
  product_type: string | null;
  skin_type: string | null;
  hair_type: string | null;
  color: string | null;
  fragrance: string | null;
  spf: number | null;
  vegan: boolean;
  cruelty_free: boolean;
  hypoallergenic: boolean;
}

// ---------- Supplier (tabela Supplier) ----------
export interface SupplierPayload {
  name: string;
  contact: string | null;
  email: string | null;
}

// ---------- Brand (tabela Brand) ----------
export interface BrandPayload {
  name: string;
}

// ---------- Description (tabela Description) ----------
export interface DescriptionPayload {
  text: string;
  usage_tips: string | null;
  ingredients: string | null;
}

// ---------- Category (tabela Category) ----------
export interface CategoryPayload {
  name: string;
}

// ---------- Stock (tabela Stock) ----------
export interface StockPayload {
  quantity: number;
  /** string no formato "YYYY-MM-DD" ou null */
  expiry_date: string | null;
}

// ---------- ProductImage (tabela product_image) ----------
export interface ProductImagePayload {
  url: string;
  order: number;
  alt_text: string | null;
}

export interface ProductImageResponse {
  id: number;
  url: string;
  order: number;
  alt_text: string | null;
}

export interface UploadProductImageOptions {
  order?: number;
  alt_text?: string | null;
}

// ---------- Payload completo enviado para o backend ----------
export interface CreateProductPayload {
  product: ProductPayload;
  supplier: SupplierPayload;
  brand: BrandPayload;
  description: DescriptionPayload;
  categories: CategoryPayload[];
  stock: StockPayload;
  images: ProductImagePayload[];
}
