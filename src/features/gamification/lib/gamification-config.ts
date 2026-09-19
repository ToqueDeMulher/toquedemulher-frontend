import { routes } from "@/app/router/paths";
import type { CatalogCategorySlug } from "@/features/catalog/data/catalog-products";

export type MissionType = "daily" | "weekly" | "special";

export type LevelConfig = {
  level: number;
  name: string;
  minPoints: number;
  benefit: string;
  badgeClassName: string;
  textClassName: string;
  accentColor: string;
};

export type GamificationStatsSnapshot = {
  isLoggedIn: boolean;
  productViews: string[];
  categoryViews: CatalogCategorySlug[];
  cartAdds: number;
  orderCount: number;
  spendTotal: number;
};

export type MissionDefinition = {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  icon: string;
  pointsReward: number;
  targetCount: number;
  ctaLabel: string;
  ctaRoute: string;
  getProgress: (stats: GamificationStatsSnapshot) => number;
  formatProgress?: (progress: number, targetCount: number) => string;
};

export type CommunityLeaderboardEntry = {
  id: string;
  name: string;
  totalPoints: number;
};

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: "Essência",
    minPoints: 0,
    benefit: "Sua jornada começa aqui",
    badgeClassName: "bg-stone-100",
    textClassName: "text-stone-700",
    accentColor: "#78716c",
  },
  {
    level: 2,
    name: "Pétala",
    minPoints: 120,
    benefit: "Novas missões em destaque",
    badgeClassName: "bg-amber-100",
    textClassName: "text-amber-700",
    accentColor: "#b45309",
  },
  {
    level: 3,
    name: "Flor",
    minPoints: 320,
    benefit: "Mais pontos por descoberta",
    badgeClassName: "bg-slate-100",
    textClassName: "text-slate-600",
    accentColor: "#64748b",
  },
  {
    level: 4,
    name: "Buquê",
    minPoints: 650,
    benefit: "Benefícios especiais do clube",
    badgeClassName: "bg-yellow-100",
    textClassName: "text-yellow-700",
    accentColor: "#ca8a04",
  },
  {
    level: 5,
    name: "Jardim",
    minPoints: 1100,
    benefit: "Experiências exclusivas",
    badgeClassName: "bg-cyan-100",
    textClassName: "text-cyan-700",
    accentColor: "#0891b2",
  },
  {
    level: 6,
    name: "Aura",
    minPoints: 1800,
    benefit: "O nível máximo da jornada",
    badgeClassName: "bg-violet-100",
    textClassName: "text-violet-700",
    accentColor: "#7c3aed",
  },
];

export const MISSION_DEFINITIONS: MissionDefinition[] = [
  {
    id: "daily-login",
    type: "daily",
    title: "Entrar no Beauty Club",
    description: "Faça login para liberar seu histórico, pontos e benefícios exclusivos.",
    icon: "Sparkles",
    pointsReward: 40,
    targetCount: 1,
    ctaLabel: "Fazer login",
    ctaRoute: routes.login,
    getProgress: (stats) => (stats.isLoggedIn ? 1 : 0),
  },
  {
    id: "daily-discovery",
    type: "daily",
    title: "Olhar curioso",
    description: "Visite 3 produtos e encontre novos detalhes para a sua rotina.",
    icon: "Eye",
    pointsReward: 55,
    targetCount: 3,
    ctaLabel: "Explorar catálogo",
    ctaRoute: routes.home,
    getProgress: (stats) => stats.productViews.length,
  },
  {
    id: "weekly-cart-builder",
    type: "weekly",
    title: "Seleção dos favoritos",
    description: "Adicione 5 itens ao carrinho enquanto monta a sua seleção.",
    icon: "ShoppingCart",
    pointsReward: 90,
    targetCount: 5,
    ctaLabel: "Abrir catálogo",
    ctaRoute: routes.home,
    getProgress: (stats) => stats.cartAdds,
  },
  {
    id: "weekly-first-order",
    type: "weekly",
    title: "Primeiro ritual completo",
    description: "Finalize um pedido e transforme sua escolha em uma nova conquista.",
    icon: "ShoppingBag",
    pointsReward: 180,
    targetCount: 1,
    ctaLabel: "Ir para o checkout",
    ctaRoute: routes.checkoutStep("address"),
    getProgress: (stats) => stats.orderCount,
  },
  {
    id: "special-category-tour",
    type: "special",
    title: "Passeio pelo jardim",
    description: "Conheça 4 categorias diferentes e amplie o seu universo de beleza.",
    icon: "Target",
    pointsReward: 140,
    targetCount: 4,
    ctaLabel: "Ver categorias",
    ctaRoute: routes.home,
    getProgress: (stats) => stats.categoryViews.length,
  },
  {
    id: "special-beauty-investor",
    type: "special",
    title: "Coleção de rituais",
    description: "Acumule R$ 600 em compras concluídas e floresça mais rápido no clube.",
    icon: "Trophy",
    pointsReward: 260,
    targetCount: 600,
    ctaLabel: "Continuar comprando",
    ctaRoute: routes.category("skincare"),
    getProgress: (stats) => Math.round(stats.spendTotal),
    formatProgress: (progress, targetCount) =>
      `R$ ${Math.min(progress, targetCount).toLocaleString("pt-BR")} / R$ ${targetCount.toLocaleString("pt-BR")}`,
  },
];

export const COMMUNITY_LEADERBOARD: CommunityLeaderboardEntry[] = [
  { id: "community-1", name: "Marina", totalPoints: 1940 },
  { id: "community-2", name: "Beatriz", totalPoints: 1680 },
  { id: "community-3", name: "Clara", totalPoints: 1425 },
  { id: "community-4", name: "Helena", totalPoints: 1180 },
  { id: "community-5", name: "Juliana", totalPoints: 980 },
  { id: "community-6", name: "Paula", totalPoints: 740 },
  { id: "community-7", name: "Renata", totalPoints: 530 },
];

export function calculateProductRewardPoints(price: number) {
  return Math.max(10, Math.round(price / 12));
}

export function calculateCartRewardPoints(
  items: Array<{ price: number; quantity: number }>,
) {
  return items.reduce(
    (sum, item) => sum + calculateProductRewardPoints(item.price) * item.quantity,
    0,
  );
}

export function getLevelByPoints(points: number) {
  return LEVELS.reduce((current, level) => {
    if (points >= level.minPoints) {
      return level;
    }

    return current;
  }, LEVELS[0]!);
}

export function getNextLevel(level: number) {
  return LEVELS.find((entry) => entry.level === level + 1) ?? null;
}

export function getProgressToNextLevel(points: number) {
  const currentLevel = getLevelByPoints(points);
  const nextLevel = getNextLevel(currentLevel.level);

  if (!nextLevel) {
    return 100;
  }

  const pointsInCurrentLevel = points - currentLevel.minPoints;
  const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;

  if (pointsNeeded <= 0) {
    return 100;
  }

  return Math.max(0, Math.min(100, (pointsInCurrentLevel / pointsNeeded) * 100));
}
