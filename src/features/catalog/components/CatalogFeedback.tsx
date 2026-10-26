import { useCatalog } from "@/features/catalog/context/catalog-context";
import { Button } from "@/shared/ui/button";

export function CatalogFeedback({ empty = true }: { empty?: boolean }) {
  const { loading, error, products, reload } = useCatalog();
  if (loading) return <div className="store-empty" role="status">Carregando produtos…</div>;
  if (error) return <div className="store-empty" role="alert"><p>{error}</p><Button onClick={reload}>Tentar novamente</Button></div>;
  if (empty && !products.length) return <div className="store-empty" role="status">Nenhum produto publicado no momento.</div>;
  return null;
}
