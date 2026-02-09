export const routes = {
  home: "/",
  product: (productId: string = ":productId") => `/produto/${productId}`,
  category: (category: string = ":category") => `/categoria/${category}`,
  login: "/login",
  profile: "/perfil",
  cart: "/carrinho",
  checkout: "/checkout",
  help: "/ajuda",
  about: "/sobre",
  productCreate: "/admin/produtos/novo",
  institutional: (slug: string = ":slug") => `/institucional/${slug}`,
} as const;
