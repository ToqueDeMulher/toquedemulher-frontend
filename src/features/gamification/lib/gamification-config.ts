import { routes } from "@/app/router/paths";
import type { CatalogCategorySlug } from "@/features/catalog/data/catalog-products";

export type MissionType = "daily" | "weekly" | "special";

export type LevelConfig = {
  level: number;
  name: string;
  minPoints: number;
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
    name: "Iniciante",
    minPoints: 0,
    badgeClassName: "bg-stone-100",
    textClassName: "text-stone-700",
    accentColor: "#78716c",
  },
  {
    level: 2,
    name: "Bronze",
    minPoints: 120,
    badgeClassName: "bg-amber-100",
    textClassName: "text-amber-700",
    accentColor: "#b45309",
  },
  {
    level: 3,
    name: "Prata",
    minPoints: 320,
    badgeClassName: "bg-slate-100",
    textClassName: "text-slate-600",
    accentColor: "#64748b",
  },
  {
    level: 4,
    name: "Ouro",
    minPoints: 650,
    badgeClassName: "bg-yellow-100",
    textClassName: "text-yellow-700",
    accentColor: "#ca8a04",
  },
  {
    level: 5,
    name: "Platina",
    minPoints: 1100,
    badgeClassName: "bg-cyan-100",
    textClassName: "text-cyan-700",
    accentColor: "#0891b2",
  },
  {
    level: 6,
    name: "Diamante",
    minPoints: 1800,
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
    title: "Exploradora do Dia",
    description: "Visite 3 páginas de produto para descobrir novas rotinas e lançamentos.",
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
    title: "Montar um carrinho",
    description: "Adicione 5 itens ao carrinho ao longo da semana.",
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
    title: "Primeiro checkout",
    description: "Finalize um pedido para transformar interesse em recompensa real.",
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
    title: "Tour completo",
    description: "Passe por 4 categorias diferentes e conheça melhor o catálogo.",
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
    title: "Rotina premium",
    description: "Acumule R$ 600 em compras concluídas para subir de nível mais rápido.",
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
