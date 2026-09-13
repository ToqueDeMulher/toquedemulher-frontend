import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { routes } from "@/app/router/paths";
import { catalogCategories, trendingProducts, type CatalogCategorySlug } from "@/features/catalog/data/catalog-products";
import { useCart } from "@/features/cart/context/cart-context";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Button } from "@/shared/ui/button";
import styles from "./CatalogListing.module.css";
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function CatalogListing({ category }: { category?: CatalogCategorySlug }) {
 const [params, setParams] = useSearchParams();
 const query = params.get("q") || "";
 const [sort, setSort] = useState("featured");
 const [type, setType] = useState("all");
 const { addItem } = useCart();
 const collection = category ? catalogCategories[category] : null;
 const products = useMemo(() => trendingProducts.filter(product =>
  (!category || product.category === category) && (!query || normalize(product.name + " " + product.category + " " + product.subcategory).includes(normalize(query)))
 ), [category,query]);
 const types = [...new Set(products.map(product => product.subcategory))];
 const filtered = products.filter(product => type === "all" || !types.includes(type) || product.subcategory === type).sort((a,b) => sort === "price-asc" ? a.price-b.price : sort === "price-desc" ? b.price-a.price : sort === "name" ? a.name.localeCompare(b.name) : 0);
 return <div className={styles.page}>
  <div className="store-container">
   <div className={styles.hero}><div><span className="store-eyebrow">SEU PRÓXIMO FAVORITO MORA AQUI</span><h1>{collection?.title || (query ? "Achados para você." : "Um universo de beleza.")}</h1><p>{collection?.description || "Um toque de cor, uma dose de cuidado e infinitas possibilidades de ser você."}</p></div><div className={styles.sticker} aria-hidden="true"><Sparkles/><span>your beauty,<br/>your rules.</span></div></div>
   <nav className={styles.categories} aria-label="Filtrar por categoria">
    <Link to={routes.search()} aria-current={!category ? "page" : undefined}>Tudo para você</Link>
    {Object.values(catalogCategories).map(c => <Link key={c.slug} to={routes.category(c.slug)} aria-current={category === c.slug ? "page" : undefined}>{c.title}</Link>)}
   </nav>
   <form className={styles.search} role="search" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); const q = String(data.get("q") || "").trim(); setParams(q ? { q } : {}); }}>
    <Search size={18}/><input key={query} name="q" defaultValue={query} placeholder="Procure por produto, marca ou tipo de cuidado" aria-label="Buscar na coleção"/>
    {query && <button type="button" aria-label="Limpar busca" onClick={() => setParams({})}><X size={17}/></button>}
    <button type="submit">Buscar <ArrowUpRight size={15}/></button>
   </form>
   <div className={styles.toolbar}><span>{filtered.length} {filtered.length === 1 ? "produto" : "produtos"}{query && <> para <strong>“{query}”</strong></>}</span>
    <div className={styles.filters}><SlidersHorizontal size={16}/>
     <select aria-label="Filtrar tipo de produto" value={types.includes(type) ? type : "all"} onChange={e => setType(e.target.value)}><option value="all">Todos os tipos</option>{types.map(t => <option key={t} value={t}>{t}</option>)}</select>
     <select aria-label="Ordenar produtos" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Nossa seleção</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name">Nome: A–Z</option></select>
    </div>
   </div>
   {filtered.length ? <div className="store-product-grid">{filtered.map(product => <ProductCard key={product.id} {...product} onAddToCart={() => addItem(product.id)}/>)}</div> :
    <div className="store-empty"><Search/><h2>Vamos tentar outro toque?</h2><p>Não encontramos produtos com esses filtros. Busque por outro nome ou explore a coleção.</p><Button onClick={() => { setParams({}); setType("all"); }}>Limpar filtros</Button></div>}
  </div>
 </div>;
}