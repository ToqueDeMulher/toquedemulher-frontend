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
    discount: 30,
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
  },
  {
    id: "5",
    name: "Rare Beauty - Kit Mini Blush + Mini Lip Oil",
    price: 269.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwd9ff0b36/images/Color%20BR/RARE%20BEAUTY/2025/kit_vday/840122906831_1.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 178,
  },
  {
    id: "6",
    name: "Wella Professional - Kit Blondorlex 6",
    price: 454.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwd2b0c429/images/hi-res-BR/Merchandising2%20-%20Hair/Wella%20Kits/kIT58/KIT158.png?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 92,
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
  },
];
