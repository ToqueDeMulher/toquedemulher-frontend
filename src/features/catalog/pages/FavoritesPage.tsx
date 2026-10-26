import { Link } from "react-router-dom";
import { Heart, ArrowUpRight } from "lucide-react";
import { routes } from "@/app/router/paths";
import { useFavorites } from "@/features/catalog/hooks/use-favorites";
import { useCatalog } from "@/features/catalog/context/catalog-context";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { useCart } from "@/features/cart/context/cart-context";
import { Button } from "@/shared/ui/button";
export function FavoritesContent() {
 const { ids } = useFavorites();
 const { addItem } = useCart();
 const { products: catalog, loading, error } = useCatalog();
 const products = catalog.filter(product => ids.includes(product.id));
 if (loading || error) return <CatalogFeedback />;
 return products.length ? <div className="store-product-grid">{products.map(product => <ProductCard key={product.id} {...product} onAddToCart={() => addItem(product)}/>)}</div> :
 <div className="store-empty"><Heart/><h2>Guarde seus próximos desejos.</h2><p>Toque no coração de um produto para encontrá-lo aqui depois.</p><Button asChild><Link to={routes.search()}>Encontrar meus favoritos <ArrowUpRight size={16}/></Link></Button></div>;
}
export function FavoritesPage() {
 return <div className="store-container"><div className="store-page-heading"><span className="store-eyebrow">ESCOLHIDOS POR VOCÊ</span><h1>Sua lista de desejos.</h1><p>Um espaço para tudo que fez seu coração bater mais forte. Seus favoritos ficam salvos neste navegador.</p></div><FavoritesContent/></div>;
}