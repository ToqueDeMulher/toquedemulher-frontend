import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import type { CatalogCategorySlug } from "@/features/catalog/data/catalog-products";
import {
  COMMUNITY_LEADERBOARD,
  MISSION_DEFINITIONS,
  calculateCartRewardPoints,
  getLevelByPoints,
  getNextLevel,
  getProgressToNextLevel,
} from "@/features/gamification/lib/gamification-config";

type PersistedGamificationState = {
  totalPoints: number;
  completedMissionIds: string[];
  stats: {
    productViews: string[];
    categoryViews: CatalogCategorySlug[];
    cartAdds: number;
    orderCount: number;
    spendTotal: number;
  };
};

export type GamificationMission = {
  id: string;
  type: "daily" | "weekly" | "special";
  title: string;
  description: string;
  icon: string;
  pointsReward: number;
  targetCount: number;
  progress: number;
  progressLabel: string;
  completed: boolean;
  ctaLabel: string;
  ctaRoute: string;
};

export type GamificationLeaderboardEntry = {
  id: string;
  name: string;
  totalPoints: number;
  level: number;
  levelName: string;
  rank: number;
  isCurrentUser: boolean;
};

type GamificationContextValue = {
  totalPoints: number;
  level: number;
  levelName: string;
  progressToNextLevel: number;
  pointsToNextLevel: number;
  nextLevelName: string | null;
  completedMissionsCount: number;
  missions: GamificationMission[];
  leaderboard: GamificationLeaderboardEntry[];
  myRank: number | null;
  productViewsCount: number;
  categoryViewsCount: number;
  cartAddsCount: number;
  orderCount: number;
  spendTotal: number;
  trackCategoryView: (category: CatalogCategorySlug) => void;
  trackProductView: (productId: string, category: CatalogCategorySlug) => void;
  trackCartAdd: (quantity: number) => void;
  trackOrder: (items: Array<{ price: number; quantity: number }>) => number;
};

const STORAGE_KEY_PREFIX = "tdm_gamification";
const PRODUCT_VIEW_POINTS = 8;
const CATEGORY_DISCOVERY_POINTS = 12;
const CART_ADD_POINTS = 4;

const GamificationContext = createContext<GamificationContextValue | undefined>(
  undefined,
);

function createDefaultState(): PersistedGamificationState {
  return {
    totalPoints: 0,
    completedMissionIds: [],
    stats: {
      productViews: [],
      categoryViews: [],
      cartAdds: 0,
      orderCount: 0,
      spendTotal: 0,
    },
  };
}

function getStorageKey(userId?: number) {
  return userId
    ? `${STORAGE_KEY_PREFIX}_user_${userId}`
    : `${STORAGE_KEY_PREFIX}_guest`;
}

function isCategorySlug(value: string): value is CatalogCategorySlug {
  return ["maquiagem", "skincare", "corpo", "cabelos", "perfumes"].includes(value);
}

function normalizeState(raw: unknown): PersistedGamificationState {
  if (!raw || typeof raw !== "object") {
    return createDefaultState();
  }

  const data = raw as Partial<PersistedGamificationState>;
  const stats = data.stats as PersistedGamificationState["stats"] | undefined;

  return {
    totalPoints:
      typeof data.totalPoints === "number" && Number.isFinite(data.totalPoints)
        ? Math.max(0, Math.round(data.totalPoints))
        : 0,
    completedMissionIds: Array.isArray(data.completedMissionIds)
      ? data.completedMissionIds.filter((value): value is string => typeof value === "string")
      : [],
    stats: {
      productViews: Array.isArray(stats?.productViews)
        ? stats.productViews.filter((value): value is string => typeof value === "string")
        : [],
      categoryViews: Array.isArray(stats?.categoryViews)
        ? stats.categoryViews.filter(isCategorySlug)
        : [],
      cartAdds:
        typeof stats?.cartAdds === "number" && Number.isFinite(stats.cartAdds)
          ? Math.max(0, Math.round(stats.cartAdds))
          : 0,
      orderCount:
        typeof stats?.orderCount === "number" && Number.isFinite(stats.orderCount)
          ? Math.max(0, Math.round(stats.orderCount))
          : 0,
      spendTotal:
        typeof stats?.spendTotal === "number" && Number.isFinite(stats.spendTotal)
          ? Math.max(0, Number(stats.spendTotal.toFixed(2)))
          : 0,
    },
  };
}

function readStoredState(storageKey: string) {
  if (typeof window === "undefined") {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return createDefaultState();
    }

    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

function getMissionProgress(
  missionId: string,
  state: PersistedGamificationState,
  isLoggedIn: boolean,
) {
  const mission = MISSION_DEFINITIONS.find((entry) => entry.id === missionId);
  if (!mission) {
    return 0;
  }

  return mission.getProgress({
    isLoggedIn,
    productViews: state.stats.productViews,
    categoryViews: state.stats.categoryViews,
    cartAdds: state.stats.cartAdds,
    orderCount: state.stats.orderCount,
    spendTotal: state.stats.spendTotal,
  });
}

function applyMissionRewards(
  state: PersistedGamificationState,
  isLoggedIn: boolean,
) {
  let nextState = state;

  for (const mission of MISSION_DEFINITIONS) {
    const progress = getMissionProgress(mission.id, nextState, isLoggedIn);
    const alreadyCompleted = nextState.completedMissionIds.includes(mission.id);

    if (alreadyCompleted || progress < mission.targetCount) {
      continue;
    }

    nextState = {
      ...nextState,
      totalPoints: nextState.totalPoints + mission.pointsReward,
      completedMissionIds: [...nextState.completedMissionIds, mission.id],
    };
  }

  return nextState;
}

export function GamificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, user } = useAuth();
  const storageKey = getStorageKey(user?.id);
  const [state, setState] = useState<PersistedGamificationState>(createDefaultState);
  const [hydratedStorageKey, setHydratedStorageKey] = useState("");

  useEffect(() => {
    setState(readStoredState(storageKey));
    setHydratedStorageKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (hydratedStorageKey !== storageKey) {
      return;
    }

    setState((current) => applyMissionRewards(current, isLoggedIn));
  }, [hydratedStorageKey, isLoggedIn, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || hydratedStorageKey !== storageKey) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore persistence errors
    }
  }, [hydratedStorageKey, state, storageKey]);

  const value = useMemo(() => {
    const currentLevel = getLevelByPoints(state.totalPoints);
    const nextLevel = getNextLevel(currentLevel.level);
    const progressToNextLevel = getProgressToNextLevel(state.totalPoints);
    const pointsToNextLevel = nextLevel
      ? Math.max(0, nextLevel.minPoints - state.totalPoints)
      : 0;

    const missions = MISSION_DEFINITIONS.map<GamificationMission>((mission) => {
      const rawProgress = getMissionProgress(mission.id, state, isLoggedIn);
      const progress = Math.min(mission.targetCount, rawProgress);
      const completed = state.completedMissionIds.includes(mission.id);

      return {
        id: mission.id,
        type: mission.type,
        title: mission.title,
        description: mission.description,
        icon: mission.icon,
        pointsReward: mission.pointsReward,
        targetCount: mission.targetCount,
        progress,
        progressLabel:
          mission.formatProgress?.(progress, mission.targetCount) ??
          `${progress}/${mission.targetCount}`,
        completed,
        ctaLabel: mission.ctaLabel,
        ctaRoute: mission.ctaRoute,
      };
    });

    const leaderboardEntries = [...COMMUNITY_LEADERBOARD];

    if (isLoggedIn) {
      leaderboardEntries.push({
        id: `user-${user?.id ?? "current"}`,
        name: user?.name ?? "Você",
        totalPoints: state.totalPoints,
      });
    }

    const leaderboard = leaderboardEntries
      .sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name))
      .map<GamificationLeaderboardEntry>((entry, index) => {
        const level = getLevelByPoints(entry.totalPoints);

        return {
          id: entry.id,
          name: entry.name,
          totalPoints: entry.totalPoints,
          level: level.level,
          levelName: level.name,
          rank: index + 1,
          isCurrentUser: isLoggedIn && entry.id === `user-${user?.id ?? "current"}`,
        };
      });

    const myEntry = leaderboard.find((entry) => entry.isCurrentUser);

    return {
      totalPoints: state.totalPoints,
      level: currentLevel.level,
      levelName: currentLevel.name,
      progressToNextLevel,
      pointsToNextLevel,
      nextLevelName: nextLevel?.name ?? null,
      completedMissionsCount: state.completedMissionIds.length,
      missions,
      leaderboard,
      myRank: myEntry?.rank ?? null,
      productViewsCount: state.stats.productViews.length,
      categoryViewsCount: state.stats.categoryViews.length,
      cartAddsCount: state.stats.cartAdds,
      orderCount: state.stats.orderCount,
      spendTotal: state.stats.spendTotal,
      trackCategoryView: (category: CatalogCategorySlug) => {
        setState((current) => {
          if (current.stats.categoryViews.includes(category)) {
            return current;
          }

          return applyMissionRewards(
            {
              ...current,
              totalPoints: current.totalPoints + CATEGORY_DISCOVERY_POINTS,
              stats: {
                ...current.stats,
                categoryViews: [...current.stats.categoryViews, category],
              },
            },
            isLoggedIn,
          );
        });
      },
      trackProductView: (productId: string, category: CatalogCategorySlug) => {
        setState((current) => {
          const hasViewedProduct = current.stats.productViews.includes(productId);
          const hasViewedCategory = current.stats.categoryViews.includes(category);

          if (hasViewedProduct && hasViewedCategory) {
            return current;
          }

          const pointsEarned =
            (hasViewedProduct ? 0 : PRODUCT_VIEW_POINTS) +
            (hasViewedCategory ? 0 : CATEGORY_DISCOVERY_POINTS);

          return applyMissionRewards(
            {
              ...current,
              totalPoints: current.totalPoints + pointsEarned,
              stats: {
                ...current.stats,
                productViews: hasViewedProduct
                  ? current.stats.productViews
                  : [...current.stats.productViews, productId],
                categoryViews: hasViewedCategory
                  ? current.stats.categoryViews
                  : [...current.stats.categoryViews, category],
              },
            },
            isLoggedIn,
          );
        });
      },
      trackCartAdd: (quantity: number) => {
        if (quantity < 1) {
          return;
        }

        setState((current) =>
          applyMissionRewards(
            {
              ...current,
              totalPoints: current.totalPoints + quantity * CART_ADD_POINTS,
              stats: {
                ...current.stats,
                cartAdds: current.stats.cartAdds + quantity,
              },
            },
            isLoggedIn,
          ),
        );
      },
      trackOrder: (items: Array<{ price: number; quantity: number }>) => {
        const orderTotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const rewardPoints = calculateCartRewardPoints(items);

        if (orderTotal <= 0) {
          return 0;
        }

        setState((current) =>
          applyMissionRewards(
            {
              ...current,
              totalPoints: current.totalPoints + rewardPoints,
              stats: {
                ...current.stats,
                orderCount: current.stats.orderCount + 1,
                spendTotal: Number((current.stats.spendTotal + orderTotal).toFixed(2)),
              },
            },
            isLoggedIn,
          ),
        );

        return rewardPoints;
      },
    };
  }, [isLoggedIn, state, user?.id, user?.name]);

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);

  if (!context) {
    throw new Error("useGamification must be used within GamificationProvider");
  }

  return context;
}
