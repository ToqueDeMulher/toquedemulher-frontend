import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  deleteProduct,
  getAdminProducts,
  type AdminProduct,
  updateProduct,
} from "@/features/admin/api/product-service";
import styles from "./AdminDashboardPage.module.css";
import { numberFieldError } from "@/features/admin/lib/product-form";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ProductManagementPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutationRef = useRef(false);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProducts(await getAdminProducts());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível carregar os produtos.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const saveProduct = async () => {
    if (!editing || mutationRef.current) return;
    const validation = numberFieldError(priceInput, { label: "O preço", required: true, min: 0 });
    if (!editing.name.trim() || validation !== true) {
      setError(!editing.name.trim() ? "Informe o nome do produto." : String(validation));
      return;
    }
    mutationRef.current = true;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateProduct(editing.id, {
        name: editing.name.trim(),
        price: Number(priceInput),
        active: editing.active,
      });
      setProducts((current) => current.map((item) =>
        item.id === updated.id ? { ...item, ...updated, slug: updated.name === item.name ? item.slug : "" } : item,
      ));
      setEditing(null);
      toast.success("Produto atualizado.");
      try {
        // PATCH does not return the regenerated slug; reload its authoritative value.
        setProducts(await getAdminProducts());
      } catch {
        setError("O produto foi salvo, mas a lista não pôde ser recarregada. Use Atualizar.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível atualizar o produto.";
      setError(message);
      toast.error(message);
    } finally {
      mutationRef.current = false;
      setIsSaving(false);
    }
  };

  const removeProduct = async (product: AdminProduct) => {
    if (mutationRef.current) return;
    if (!window.confirm(`Excluir definitivamente “${product.name}”?`)) return;
    mutationRef.current = true;
    setIsSaving(true);
    setError(null);
    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast.success("Produto excluído.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível excluir o produto.";
      setError(message);
      toast.error(message);
    } finally {
      mutationRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topTitleBlock}>
          <p className={styles.topEyebrow}>CATÁLOGO</p>
          <h1 className={styles.topTitle}>Produtos</h1>
          <p className={styles.topSubtitle}>Edite, desative ou exclua itens da vitrine.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadProducts()} disabled={isLoading || isSaving}>
          {isLoading ? <Loader2 className={styles.spinning} /> : <RefreshCw />}
          Atualizar
        </Button>
      </header>
      {error && <p role="alert">{error}</p>}

      <section className={styles.panel}>
        {isLoading ? (
          <div className={styles.loadingState}><Loader2 className={styles.spinnerIcon} /> Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>Nenhum produto cadastrado.</div>
        ) : (
          <div className={styles.orderList}>
            {products.map((product) => {
              const isEditing = editing?.id === product.id;
              const item = isEditing ? editing : product;
              return (
                <article key={product.id} className={styles.orderItem}>
                  <div className={styles.orderMain}>
                    {isEditing ? (
                      <>
                        <Input value={item.name} disabled={isSaving} onChange={(event) => setEditing({ ...item, name: event.target.value })} aria-label="Nome do produto" />
                        <Input type="number" min="0" step="any" value={priceInput} disabled={isSaving} onChange={(event) => setPriceInput(event.target.value)} aria-label="Preço do produto" />
                        <label><input type="checkbox" checked={item.active} disabled={isSaving} onChange={(event) => setEditing({ ...item, active: event.target.checked })} /> Ativo na vitrine</label>
                      </>
                    ) : (
                      <>
                        <strong>{product.name}</strong>
                        <span>{formatPrice(product.price)} · {product.active ? "Ativo" : "Desativado"}</span>
                        {product.slug && <small>{product.slug}</small>}
                      </>
                    )}
                  </div>
                  <div className={styles.orderActions}>
                    {isEditing ? (
                      <Button type="button" size="sm" onClick={() => void saveProduct()} disabled={isSaving}>
                        <Check /> Salvar
                      </Button>
                    ) : (
                      <Button type="button" size="sm" variant="outline" disabled={isSaving} onClick={() => {
                        if (mutationRef.current) return;
                        setEditing(product); setPriceInput(String(product.price)); setError(null);
                      }}>
                        <Pencil /> Editar
                      </Button>
                    )}
                    <Button type="button" size="sm" variant="outline" onClick={() => void removeProduct(product)} disabled={isSaving}>
                      <Trash2 /> Excluir
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
