export type CatalogCategorySlug =
  | "maquiagem"
  | "skincare"
  | "corpo"
  | "cabelos"
  | "perfumes";

export type CatalogCategory = {
  slug: CatalogCategorySlug;
  title: string;
  description: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  discount?: number;
  category: CatalogCategorySlug | null;
  categories: string[];
  slug: string;
  images: { url: string; alt: string }[];
  available: boolean;
  stockQuantity: number;
  volume?: string | null;
  color?: string | null;
  fragrance?: string | null;
  subcategory: string;
  description: string;
  composition: string;
  benefits: string;
  howToUse: string;
};

export const defaultCategorySlug: CatalogCategorySlug = "maquiagem";

export const catalogCategories: Record<CatalogCategorySlug, CatalogCategory> = {
  maquiagem: {
    slug: "maquiagem",
    title: "Maquiagem",
    description: "Bases, blushes, batons e kits para looks do dia a dia ou produções completas.",
  },
  skincare: {
    slug: "skincare",
    title: "Skincare",
    description: "Limpeza, hidratação e tratamento para uma rotina de cuidado consistente.",
  },
  corpo: {
    slug: "corpo",
    title: "Corpo",
    description: "Cremes, loções e autocuidado corporal para manter a pele nutrida e perfumada.",
  },
  cabelos: {
    slug: "cabelos",
    title: "Cabelos",
    description: "Tratamentos e finalizadores para rotina capilar com brilho, força e reparação.",
  },
  perfumes: {
    slug: "perfumes",
    title: "Perfumes",
    description: "Fragrâncias femininas marcantes, do floral delicado ao amadeirado sofisticado.",
  },
};

export function isCatalogCategorySlug(
  value?: string,
): value is CatalogCategorySlug {
  return Boolean(value && value in catalogCategories);
}
