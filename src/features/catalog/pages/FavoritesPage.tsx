import { Link } from "react-router-dom";
import { Heart, ArrowUpRight } from "lucide-react";
import { routes } from "@/app/router/paths";
import { useFavorites } from "@/features/catalog/hooks/use-favorites";
import { trendingProducts } from "@/features/catalog/data/catalog-products";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { useCart } from "@/features/cart/context/cart-context";
import { Button } from "@/shared/ui/button";
export function FavoritesContent() {
 const { ids } = useFavorites();
 const { addItem } = useCart();
 const products = trendingProducts.filter(product => ids.includes(product.id));
 return products.length ? <div className="store-product-grid">{products.map(product => <ProductCard key={product.id} {...product} onAddToCart={() => addItem(product.id)}/>)}</div> :
 <div className="store-empty"><Heart/><h2>Guarde seus próximos desejos.</h2><p>Toque no coração de um produto para encontrá-lo aqui depois.</p><Button asChild><Link to={routes.search()}>Encontrar meus favoritos <ArrowUpRight size={16}/></Link></Button></div>;
}
export function FavoritesPage() {
 return <div className="store-container"><div className="store-page-heading"><span className="store-eyebrow">ESCOLHIDOS POR VOCÊ</span><h1>Sua lista de desejos.</h1><p>Um espaço para tudo que fez seu coração bater mais forte. Seus favoritos ficam salvos neste navegador.</p></div><FavoritesContent/></div>;
}