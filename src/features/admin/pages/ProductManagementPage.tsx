import { useEffect, useState } from "react";
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

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      setProducts(await getAdminProducts());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar os produtos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const saveProduct = async () => {
    if (!editing) return;
    setIsSaving(true);
    try {
      const updated = await updateProduct(editing.id, {
        name: editing.name.trim(),
        price: editing.price,
        active: editing.active,
      });
      setProducts((current) => current.map((item) =>
        item.id === updated.id ? { ...item, ...updated } : item,
      ));
      setEditing(null);
      toast.success("Produto atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o produto.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Excluir definitivamente “${product.name}”?`)) return;
    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast.success("Produto excluído.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o produto.");
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
        <Button type="button" variant="outline" onClick={() => void loadProducts()} disabled={isLoading}>
          {isLoading ? <Loader2 className={styles.spinning} /> : <RefreshCw />}
          Atualizar
        </Button>
      </header>

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
                        <Input value={item.name} onChange={(event) => setEditing({ ...item, name: event.target.value })} aria-label="Nome do produto" />
                        <Input type="number" min="0" step="0.01" value={item.price} onChange={(event) => setEditing({ ...item, price: Number(event.target.value) })} aria-label="Preço do produto" />
                        <label><input type="checkbox" checked={item.active} onChange={(event) => setEditing({ ...item, active: event.target.checked })} /> Ativo na vitrine</label>
                      </>
                    ) : (
                      <>
                        <strong>{product.name}</strong>
                        <span>{formatPrice(product.price)} · {product.active ? "Ativo" : "Desativado"}</span>
                        <small>{product.slug}</small>
                      </>
                    )}
                  </div>
                  <div className={styles.orderActions}>
                    {isEditing ? (
                      <Button type="button" size="sm" onClick={() => void saveProduct()} disabled={isSaving}>
                        <Check /> Salvar
                      </Button>
                    ) : (
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditing(product)}>
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
