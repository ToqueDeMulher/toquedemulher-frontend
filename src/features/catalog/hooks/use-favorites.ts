import { useEffect, useState } from "react";
const KEY = "tdm_favorite_products";
const EVENT = "tdm-favorites-changed";
function readFavorites(): string[] {
 try { const value: unknown = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []; } catch { return []; }
}
export function useFavorites() {
 const [ids, setIds] = useState(readFavorites);
 useEffect(() => {
  const sync = () => setIds(readFavorites());
  window.addEventListener(EVENT, sync); window.addEventListener("storage", sync);
  return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
 }, []);
 const toggle = (id: string) => {
  const current = readFavorites();
  const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { setIds(next); return; }
  window.dispatchEvent(new Event(EVENT));
 };
 return { ids, toggle };
}