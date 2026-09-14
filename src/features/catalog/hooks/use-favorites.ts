import { useSyncExternalStore } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "tdm_favorite_products";
const CHANGE_EVENT = "tdm-favorites-changed";

function snapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(snapshot());
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter((id): id is string => typeof id === "string"),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}
function save(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    toast.error("Não foi possível salvar os favoritos neste navegador.");
    return false;
  }
}
export function useFavorites() {
  useSyncExternalStore(subscribe, snapshot, () => "[]");
  const favoriteIds = readFavorites();
  return {
    ids: favoriteIds,
    isFavorite: (id: string) => favoriteIds.includes(id),
    addFavorite: (id: string) => save([...new Set([...readFavorites(), id])]),
    toggleFavorite: (id: string) => {
      const current = readFavorites();
      return save(
        current.includes(id)
          ? current.filter((value) => value !== id)
          : [...current, id],
      );
    },
  };
}
