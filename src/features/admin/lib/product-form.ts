import type { CreateProductPayload } from "@/features/admin/types/product";

export type ProductImageField = { url: string; order: string; alt_text: string };
export type ProductFormValues = {
  name: string; price: string; volume: string; target_audience: string;
  product_type: string; skin_type: string; hair_type: string; color: string;
  fragrance: string; spf: string; brand_id: string; description_id: string;
  shipping_width: string; shipping_height: string; shipping_length: string; shipping_weight: string;
  supplier_name: string; supplier_price: string; lead_time_days: string;
  description_text: string; description_usage_tips: string; description_ingredients: string;
  category_id: string; stock_quantity: string;
  active: boolean; vegan: boolean; cruelty_free: boolean; hypoallergenic: boolean;
  images: ProductImageField[];
};
export type ProductTextField = Exclude<keyof ProductFormValues,
  "active" | "vegan" | "cruelty_free" | "hypoallergenic" | "images">;

export const defaultProductValues: ProductFormValues = {
  name: "", price: "", volume: "", target_audience: "", product_type: "",
  skin_type: "", hair_type: "", color: "", fragrance: "", spf: "",
  brand_id: "", description_id: "", shipping_width: "", shipping_height: "",
  shipping_length: "", shipping_weight: "", supplier_name: "", supplier_price: "", lead_time_days: "",
  description_text: "", description_usage_tips: "", description_ingredients: "",
  category_id: "", stock_quantity: "0",
  active: false, vegan: false, cruelty_free: true, hypoallergenic: false,
  images: [{ url: "", order: "1", alt_text: "" }],
};

type NumberRule = { label: string; required?: boolean; integer?: boolean; min?: number; exclusiveMin?: number; max?: number };
const numberRules: Partial<Record<ProductTextField, NumberRule>> = {
  price: { label: "O preço", required: true, min: 0 },
  spf: { label: "O SPF", integer: true },
  brand_id: { label: "O código da marca", integer: true },
  description_id: { label: "O código da descrição", integer: true },
  shipping_width: { label: "A largura", exclusiveMin: 0, max: 300 },
  shipping_height: { label: "A altura", exclusiveMin: 0, max: 300 },
  shipping_length: { label: "O comprimento", exclusiveMin: 0, max: 300 },
  shipping_weight: { label: "O peso", exclusiveMin: 0, max: 1000 },
  supplier_price: { label: "O custo do fornecedor", min: 0 },
  lead_time_days: { label: "O prazo do fornecedor", integer: true, min: 0 },
  category_id: { label: "A categoria", integer: true, min: 1 },
  stock_quantity: { label: "O estoque", required: true, integer: true, min: 0 },
};

export function numberFieldError(value: string, rule: NumberRule): true | string {
  if (!value.trim()) return rule.required ? `${rule.label} é obrigatório.` : true;
  const number = Number(value);
  if (!Number.isFinite(number)) return `${rule.label} deve ser um número finito.`;
  if (rule.integer && !Number.isInteger(number)) return `${rule.label} deve ser um número inteiro.`;
  if (rule.min !== undefined && number < rule.min) return `${rule.label} deve ser maior ou igual a ${rule.min}.`;
  if (rule.exclusiveMin !== undefined && number <= rule.exclusiveMin) return `${rule.label} deve ser maior que ${rule.exclusiveMin}.`;
  if (rule.max !== undefined && number > rule.max) return `${rule.label} deve ser no máximo ${rule.max}.`;
  return true;
}

export function productFieldError(name: ProductTextField, value: string, values: ProductFormValues): true | string {
  if (name === "name") return value.trim() ? true : "Informe o nome comercial.";
  if (name === "supplier_name" && !value.trim() && (values.supplier_price.trim() || values.lead_time_days.trim())) {
    return "Informe o fornecedor para vincular custo ou prazo.";
  }
  const rule = numberRules[name];
  if (!rule) return true;
  return numberFieldError(value, { ...rule, required: name === "supplier_price" ? Boolean(values.supplier_name.trim()) : rule.required });
}

export const imageOrderError = (value: string) =>
  numberFieldError(value, { label: "A ordenação", integer: true, min: 1 });

export function buildProductPayload(values: ProductFormValues): CreateProductPayload {
  for (const name of ["name", "supplier_name", ...Object.keys(numberRules)] as ProductTextField[]) {
    const error = productFieldError(name, values[name], values);
    if (error !== true) throw new Error(error);
  }
  const text = (value: string) => value.trim() || null;
  const number = (value: string) => value.trim() ? Number(value) : null;
  return {
    name: values.name.trim(), price: Number(values.price), active: values.active,
    volume: text(values.volume), target_audience: text(values.target_audience),
    product_type: text(values.product_type), skin_type: text(values.skin_type), hair_type: text(values.hair_type),
    color: text(values.color), fragrance: text(values.fragrance), spf: number(values.spf),
    vegan: values.vegan, cruelty_free: values.cruelty_free, hypoallergenic: values.hypoallergenic,
    brand_id: number(values.brand_id), description_id: number(values.description_id),
    ...(values.description_text.trim() ? { description: {
      text: values.description_text.trim(),
      usage_tips: text(values.description_usage_tips),
      ingredients: text(values.description_ingredients),
    } } : {}),
    ...(values.category_id.trim() ? { category_ids: [Number(values.category_id)] } : {}),
    ...(Number(values.stock_quantity) ? { stock_quantity: Number(values.stock_quantity) } : {}),
    shipping_width: number(values.shipping_width), shipping_height: number(values.shipping_height),
    shipping_length: number(values.shipping_length), shipping_weight: number(values.shipping_weight),
    ...(values.supplier_name.trim() ? { supplier_products: [{
      supplier_name: values.supplier_name.trim(), supplier_price: Number(values.supplier_price),
      lead_time_days: number(values.lead_time_days),
    }] } : {}),
  };
}

export function productImageError(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Formato de imagem inválido. Use JPG, PNG ou WEBP.";
  if (!file.size) return "Envie uma imagem com conteúdo.";
  return null;
}
