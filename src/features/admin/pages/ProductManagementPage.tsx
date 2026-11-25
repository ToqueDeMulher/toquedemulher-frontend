import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Check, Loader2, Pencil, RefreshCw, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { getAdminCategories, getAdminProducts, publishProduct, setPrimaryProductImage,
  unpublishProduct, updateProduct, uploadProductImage } from "@/features/admin/api/product-service";
import type { AdminCategory, AdminProduct } from "@/features/admin/types/product";
import { numberFieldError, productImageError } from "@/features/admin/lib/product-form";
import { routes } from "@/app/router/paths";
import styles from "./ProductManagementPage.module.css";

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function ProductManagementPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutation = useRef(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [items, categoryOptions] = await Promise.all([
        getAdminProducts({ search, status, categoryId: categoryId ? Number(categoryId) : undefined }),
        getAdminCategories(),
      ]);
      setProducts(Array.isArray(items) ? items : []); setCategories(Array.isArray(categoryOptions) ? categoryOptions : []);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Não foi possível carregar os produtos.";
      setError(message); toast.error(message);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []); // Initial filters are empty by design.

  const startEdit = (product: AdminProduct) => {
    setEditing(structuredClone(product)); setPrice(String(product.price));
    setStock(String(product.stock_quantity)); setError(null);
  };

  const save = async () => {
    if (!editing || mutation.current) return;
    const priceError = numberFieldError(price, { label: "O preço", required: true, min: 0 });
    const stockError = numberFieldError(stock, { label: "O estoque", required: true, integer: true, min: 0 });
    const message = !editing.name.trim() ? "Informe o nome do produto." :
      !editing.description?.text.trim() ? "Informe a descrição do produto." :
      !editing.category_ids.length ? "Selecione uma categoria." :
      priceError !== true ? priceError : stockError !== true ? stockError : null;
    if (message) { setError(message); return; }
    mutation.current = true; setSaving(true);
    try {
      const updated = await updateProduct(editing.id, {
        name: editing.name.trim(), price: Number(price), stock_quantity: Number(stock),
        category_ids: editing.category_ids,
        description: { text: editing.description!.text.trim(),
          usage_tips: editing.description!.usage_tips?.trim() || null,
          ingredients: editing.description!.ingredients?.trim() || null },
      }) as AdminProduct;
      setProducts(current => current.map(item => item.id === updated.id ? updated : item));
      setEditing(null); toast.success("Produto atualizado.");
    } catch (caught) { report(caught, "Não foi possível atualizar o produto."); }
    finally { mutation.current = false; setSaving(false); }
  };

  const report = (caught: unknown, fallback: string) => {
    const message = caught instanceof Error ? caught.message : fallback;
    setError(message); toast.error(message);
  };

  const toggle = async (product: AdminProduct) => {
    if (mutation.current) return;
    mutation.current = true; setSaving(true); setError(null);
    try {
      const updated = product.active ? await unpublishProduct(product.id) : await publishProduct(product.id);
      setProducts(current => current.map(item => item.id === updated.id ? updated : item));
      if (editing?.id === updated.id) setEditing(updated);
      toast.success(product.active ? "Produto retirado da vitrine." : "Produto publicado na vitrine.");
    } catch (caught) { report(caught, "Não foi possível alterar a publicação."); }
    finally { mutation.current = false; setSaving(false); }
  };

  const refreshEditing = (updated: AdminProduct) => {
    setEditing(updated); setProducts(current => current.map(item => item.id === updated.id ? updated : item));
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!editing || !file || mutation.current) return;
    const validation = productImageError(file);
    if (validation) { setError(validation); return; }
    mutation.current = true; setSaving(true);
    try {
      await uploadProductImage(editing.id, file, { alt_text: editing.name });
      const updated = (await getAdminProducts()).find(item => item.id === editing.id);
      if (updated) refreshEditing(updated);
      toast.success("Imagem enviada.");
    } catch (caught) { report(caught, "Não foi possível enviar a imagem."); }
    finally { mutation.current = false; setSaving(false); }
  };

  const primary = async (imageId: number) => {
    if (!editing || mutation.current) return;
    mutation.current = true; setSaving(true);
    try { refreshEditing(await setPrimaryProductImage(editing.id, imageId)); toast.success("Imagem principal atualizada."); }
    catch (caught) { report(caught, "Não foi possível alterar a imagem principal."); }
    finally { mutation.current = false; setSaving(false); }
  };

  return <section className={styles.page}>
    <header className={styles.topBar}><div className={styles.topTitleBlock}><p className={styles.topEyebrow}>CATÁLOGO</p>
      <h1 className={styles.topTitle}>Produtos</h1><p className={styles.topSubtitle}>Cadastre, edite e controle a vitrine.</p></div>
      <Button asChild><a href={routes.productCreate}>Novo produto</a></Button></header>
    {error && <p role="alert">{error}</p>}
    <section className={styles.panel}>
      <div className={styles.orderActions}>
        <Input aria-label="Pesquisar produtos" placeholder="Pesquisar por nome" value={search} onChange={event => setSearch(event.target.value)} />
        <select aria-label="Filtrar por status" value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todos</option><option value="draft">Rascunhos</option><option value="published">Publicados</option></select>
        <select aria-label="Filtrar por categoria" value={categoryId} onChange={event => setCategoryId(event.target.value)}><option value="">Todas as categorias</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <Button variant="outline" onClick={() => void load()} disabled={loading || saving}><Search /> Aplicar filtros</Button>
        <Button variant="ghost" onClick={() => void load()} disabled={loading || saving}>{loading ? <Loader2 className={styles.spinning} /> : <RefreshCw />} Atualizar</Button>
      </div>
      {loading ? <div className={styles.loadingState}>Carregando produtos...</div> : products.length === 0 ?
        <div className={styles.emptyState}>Nenhum produto encontrado.</div> :
        <div className={styles.orderList}>{products.map(product => {
          const open = editing?.id === product.id; const item = open ? editing : product;
          return <article key={product.id} className={styles.orderItem}>
            <div className={styles.orderMain}>{product.image && <img src={product.image} alt="" width="72" height="72" />}
              {open ? <>
                <Input aria-label="Nome do produto" value={item.name} onChange={event => setEditing({ ...item, name: event.target.value })} disabled={saving} />
                <Input aria-label="Preço do produto" type="number" min="0" value={price} onChange={event => setPrice(event.target.value)} disabled={saving} />
                <Input aria-label="Estoque do produto" type="number" min="0" step="1" value={stock} onChange={event => setStock(event.target.value)} disabled={saving} />
                <Textarea aria-label="Descrição do produto" value={item.description?.text ?? ""} onChange={event => setEditing({ ...item, description: { ...item.description, text: event.target.value } })} disabled={saving} />
                <select aria-label="Categoria do produto" value={item.category_ids[0] ?? ""} onChange={event => setEditing({ ...item, category_ids: [Number(event.target.value)] })} disabled={saving}><option value="">Selecione</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
                <div>{item.images.map(image => <figure key={image.id}><img src={image.url} alt={image.alt_text ?? item.name} width="96" height="96" /><figcaption>{image.is_primary ? "Principal" : <Button variant="ghost" size="sm" onClick={() => void primary(image.id)} disabled={saving}><Star /> Tornar principal</Button>}</figcaption></figure>)}</div>
                <label>Adicionar foto <input aria-label="Adicionar foto" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void upload(event)} disabled={saving} /></label>
              </> : <><strong>{product.name}</strong><span>{money(product.price)} · {product.stock_quantity} em estoque · {product.active ? "Publicado" : "Rascunho"}</span><small>{product.categories.map(category => category.name).join(", ") || "Sem categoria"}</small></>}
            </div>
            <div className={styles.orderActions}>{open ? <><Button size="sm" onClick={() => void save()} disabled={saving}><Check /> Salvar</Button><Button size="sm" variant="ghost" onClick={() => setEditing(null)} disabled={saving}>Cancelar</Button></> : <Button size="sm" variant="outline" onClick={() => startEdit(product)} disabled={saving}><Pencil /> Editar</Button>}
              <Button size="sm" variant="outline" onClick={() => void toggle(product)} disabled={saving}>{product.active ? "Retirar da vitrine" : "Publicar"}</Button></div>
          </article>;
        })}</div>}
    </section>
  </section>;
}
