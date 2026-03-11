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
  category: CatalogCategorySlug;
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

export const trendingProducts: CatalogProduct[] = [
  {
    id: "1",
    name: "Lancome - La Vie Est Belle Feminino Eau De Parfum",
    price: 399.9,
    originalPrice: 509.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwbe2e132a/images/hi-res-BR/Frag/Nova%20pasta/Quele/LANCOME/3605532612690.01_1000px.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 124,
    isNew: true,
    discount: 22,
    category: "perfumes",
    subcategory: "floral gourmand",
    description:
      "Fragrância floral gourmand com assinatura adocicada e elegante, ideal para uso diário e ocasiões especiais.",
    composition:
      "Iris, jasmin sambac, flor de laranjeira, patchouli e acorde de baunilha.",
    benefits:
      "Alta fixação, assinatura feminina marcante e projeção equilibrada ao longo do dia.",
    howToUse:
      "Borrife nos pontos de pulsação, como pescoço e pulsos, sem esfregar para preservar a evolução da fragrância.",
  },
  {
    id: "2",
    name: "Dior Backstage - Blush Rosy Glow",
    price: 280.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwac4c8ec5/images/Color%20BR/DIOR/2025/atualizar/rosyGlow/004/1.3348901665827.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 89,
    isNew: true,
    category: "maquiagem",
    subcategory: "blush",
    description:
      "Blush com acabamento luminoso e tecnologia que se adapta ao pH da pele para um corado natural.",
    composition:
      "Pigmentos micronizados, pó ultrafino e agentes emolientes para toque leve.",
    benefits:
      "Esfumado uniforme, construção de camadas e efeito fresh que dura por horas.",
    howToUse:
      "Aplique com pincel fofo nas maçãs do rosto e esfume em direção às têmporas.",
  },
  {
    id: "3",
    name: "MAC - Batom Matte Macximall",
    price: 79.9,
    originalPrice: 119.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwe3f4fb81/images/Color%20BR/MAC/2024/MACXIMAL/Ruby_Woo/773602685189_1.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 203,
    discount: 33,
    category: "maquiagem",
    subcategory: "batom",
    description:
      "Batom matte de alta pigmentação com textura cremosa na aplicação e acabamento aveludado.",
    composition:
      "Pigmentos de alta intensidade, ceras vegetais e componentes emolientes.",
    benefits:
      "Cor intensa, conforto ao longo do uso e acabamento matte sem craquelar com facilidade.",
    howToUse:
      "Deslize diretamente nos lábios ou use um pincel para acabamento mais preciso.",
  },
  {
    id: "4",
    name: "Chloe - Perfume Feminino Eau de Parfum",
    price: 391.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwada68e19/images/hi-res-BR/688575201901_1500px.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 156,
    isNew: true,
    category: "perfumes",
    subcategory: "floral fresco",
    description:
      "Perfume floral elegante com assinatura fresca, leve e sofisticada para quem prefere fragrâncias clássicas.",
    composition:
      "Peônia, rosa, magnólia, lírio-do-vale, cedro e acordes ambarados.",
    benefits:
      "Assinatura delicada, boa versatilidade e secagem refinada para uso diário.",
    howToUse:
      "Aplique a cerca de 15 cm da pele nas áreas de maior circulação sanguínea.",
  },
  {
    id: "5",
    name: "Rare Beauty - Kit Mini Blush + Mini Lip Oil",
    price: 269.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwd9ff0b36/images/Color%20BR/RARE%20BEAUTY/2025/kit_vday/840122906831_1.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 178,
    category: "maquiagem",
    subcategory: "kit",
    description:
      "Kit com blush e lip oil em tamanhos práticos para montar nécessaire e retoques ao longo do dia.",
    composition:
      "Texturas leves com ativos hidratantes e pigmentos de fácil espalhabilidade.",
    benefits:
      "Versatilidade, acabamento glow e praticidade para levar em bolsa ou viagem.",
    howToUse:
      "Aplique o blush nas maçãs do rosto e finalize com o lip oil para brilho confortável nos lábios.",
  },
  {
    id: "6",
    name: "Wella Professional - Kit Blondorplex 6",
    price: 454.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwd2b0c429/images/hi-res-BR/Merchandising2%20-%20Hair/Wella%20Kits/kIT58/KIT158.png?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 92,
    category: "cabelos",
    subcategory: "tratamento",
    description:
      "Kit de tratamento capilar para reparação de fios loiros ou sensibilizados, com foco em força e brilho.",
    composition:
      "Blend reconstrutor com agentes condicionantes, aminoácidos e tecnologia de proteção da fibra.",
    benefits:
      "Reduz a quebra, melhora a penteabilidade e entrega toque macio após a rotina completa.",
    howToUse:
      "Siga a sequência do kit conforme a indicação da marca, respeitando o tempo de pausa de cada etapa.",
  },
  {
    id: "7",
    name: "Glow Recipe - Creme de Tratamento Noturno Watermelon Glow",
    price: 179.4,
    originalPrice: 289.0,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwa0e65582/images/hi-res-BR/PDPs/IIP/GlowRecipe/WM/NC/810052961620--full-size-packshot.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 341,
    discount: 30,
    category: "skincare",
    subcategory: "hidratante",
    description:
      "Creme noturno com textura leve e hidratação prolongada para uma rotina de skincare focada em glow e maciez.",
    composition:
      "Niacinamida, extrato de melancia, ativos umectantes e componentes suavizantes.",
    benefits:
      "Hidratação intensa, viço, conforto noturno e aparência descansada pela manhã.",
    howToUse:
      "Aplique como última etapa da rotina noturna, espalhando no rosto e no pescoço com movimentos suaves.",
  },
  {
    id: "8",
    name: "Gucci - Bloom Ambrosia di Fiori Eau de Parfum",
    price: 847.8,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwe21f1d41/images/hi-res-BR/Frag/Nova%20pasta/Maria%20Helena%202.0/New%20Folder/MA%202.0/MA%203.0/3616305275745.jpeg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 215,
    isNew: true,
    category: "perfumes",
    subcategory: "floral intenso",
    description:
      "Perfume floral intenso com assinatura envolvente e sofisticada para quem gosta de presença marcante.",
    composition:
      "Tuberosa, jasmim, damasco e notas florais cremosas de alta intensidade.",
    benefits:
      "Fixação prolongada, assinatura luxuosa e boa performance em eventos e noites especiais.",
    howToUse:
      "Aplique sobre a pele limpa e hidratada para melhorar a fixação e a projeção da fragrância.",
  },
  {
    id: "9",
    name: "Sol de Janeiro - Creme Corporal Bom Dia Bright",
    price: 209.9,
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    reviews: 76,
    isNew: true,
    category: "corpo",
    subcategory: "hidratante corporal",
    description:
      "Creme corporal de toque acetinado, com fragrância envolvente e foco em nutrição e maciez da pele.",
    composition:
      "Manteigas vegetais, agentes nutritivos e fragrância gourmand suave.",
    benefits:
      "Pele macia, perfumada e com sensação de conforto prolongada após o banho.",
    howToUse:
      "Espalhe no corpo com movimentos circulares, priorizando áreas mais ressecadas.",
  },
];

export function isCatalogCategorySlug(
  value?: string,
): value is CatalogCategorySlug {
  return Boolean(value && value in catalogCategories);
}

export function getProductById(productId: string) {
  return trendingProducts.find((product) => product.id === productId);
}

export function getProductsByCategory(category: CatalogCategorySlug) {
  return trendingProducts.filter((product) => product.category === category);
}

export function getRelatedProducts(productId: string, limit: number = 4) {
  const currentProduct = getProductById(productId);
  const remainingProducts = trendingProducts.filter(
    (product) => product.id !== productId,
  );

  if (!currentProduct) {
    return remainingProducts.slice(0, limit);
  }

  const sameCategory = remainingProducts.filter(
    (product) => product.category === currentProduct.category,
  );
  const otherCategories = remainingProducts.filter(
    (product) => product.category !== currentProduct.category,
  );

  return [...sameCategory, ...otherCategories].slice(0, limit);
}
