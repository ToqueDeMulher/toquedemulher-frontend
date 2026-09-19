import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { BeautyFlower } from "@/shared/ui/BeautyFlower";
import { toast } from "sonner";
import {
  catalogCategories,
  getProductById,
  getRelatedProducts,
} from "@/features/catalog/data/catalog-products";
import { useFavorites } from "@/features/catalog/hooks/use-favorites";
import { useCart } from "@/features/cart/context/cart-context";
import { useGamification } from "@/features/gamification/context/gamification-context";
import { calculateCartRewardPoints } from "@/features/gamification/lib/gamification-config";
import { routes } from "@/app/router/paths";
import styles from "./ProductPage.module.css";

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ProductPage() {
  const { productId = "1" } = useParams();
  const { addItem } = useCart();
  const { trackProductView } = useGamification();
  const { isFavorite, toggleFavorite } = useFavorites();
  const product = getProductById(productId);
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setZoomOpen(false);
  }, [productId]);
  useEffect(() => {
    if (product) trackProductView(product.id, product.category);
  }, [product, trackProductView]);

  if (!product)
    return (
      <main className={styles.empty}>
        <BeautyFlower />
        <h1>Produto não encontrado</h1>
        <p>Explore o catálogo para encontrar seu próximo favorito.</p>
        <Button asChild>
          <Link to={routes.home}>Explorar a loja</Link>
        </Button>
      </main>
    );

  const relatedProducts = getRelatedProducts(product.id, 4);
  const category = catalogCategories[product.category];
  const favorite = isFavorite(product.id);
  const rewardPoints = calculateCartRewardPoints([
    { price: product.price, quantity },
  ]);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section
          className={styles.productLayout}
          aria-labelledby="product-title"
        >
          <div className={styles.gallery}>
            <div className={styles.galleryLabels}>
              {product.isNew && <span>Novidade</span>}
              {discount > 0 && (
                <span className={styles.discount}>{discount}% OFF</span>
              )}
            </div>
            <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
              <DialogTrigger asChild>
                <button
                  className={styles.imageButton}
                  type="button"
                  aria-label={`Ampliar foto de ${product.name}`}
                >
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className={styles.mainImage}
                  />
                  <span className={styles.zoomHint}>
                    <ZoomIn size={16} /> Ampliar imagem
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className={styles.zoomDialog}>
                <DialogTitle className={styles.zoomTitle}>
                  {product.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Foto ampliada do produto.
                </DialogDescription>
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className={styles.zoomImage}
                />
              </DialogContent>
            </Dialog>
            <div className={styles.galleryFoot}>
              <span>Um toque de beleza na sua rotina.</span>
              <BeautyFlower className={styles.flower} />
            </div>
          </div>
          <div className={styles.productInfo}>
            <Link
              className={styles.eyebrow}
              to={routes.category(product.category)}
            >
              {category.title} <ArrowRight size={14} />
            </Link>
            <h1 id="product-title" className={styles.title}>
              {product.name}
            </h1>
            <div className={styles.ratingRow}>
              <span
                className={styles.stars}
                aria-label={`${product.rating.toFixed(1)} de 5 estrelas`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={
                      i < Math.round(product.rating) ? "currentColor" : "none"
                    }
                    aria-hidden="true"
                  />
                ))}
              </span>
              <span>{product.rating.toFixed(1)}</span>
              <span className={styles.ratingCount}>
                ({product.reviews} avaliações no catálogo)
              </span>
            </div>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.priceBlock}>
              {discount > 0 && (
                <div className={styles.priceBefore}>
                  De <s>{money(product.originalPrice!)}</s>
                  <span>
                    Economize {money(product.originalPrice! - product.price)}
                  </span>
                </div>
              )}
              <p className={styles.price}>{money(product.price)}</p>
              <span className={styles.priceCaption}>Preço por unidade</span>
            </div>
            <div className={styles.purchaseRow}>
              <div
                className={styles.quantityControls}
                role="group"
                aria-label="Quantidade"
              >
                <button
                  type="button"
                  disabled={quantity === 1}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={16} />
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Button
                className={styles.addButton}
                onClick={() => {
                  addItem(product.id, quantity);
                  toast.success("Produto adicionado ao carrinho.");
                }}
              >
                <ShoppingBag size={18} /> Adicionar ao carrinho
              </Button>
              <Button
                variant="outline"
                className={`${styles.favoriteButton} ${favorite ? styles.favoriteActive : ""}`}
                aria-pressed={favorite}
                aria-label={`${favorite ? "Remover" : "Adicionar"} ${product.name} ${favorite ? "dos" : "aos"} favoritos`}
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart size={20} fill={favorite ? "currentColor" : "none"} />
              </Button>
            </div>
            {quantity > 1 && (
              <p className={styles.quantityTotal}>
                Subtotal de {quantity} unidades:{" "}
                <strong>{money(product.price * quantity)}</strong>
              </p>
            )}
            <div className={styles.perks}>
              <div>
                <Truck aria-hidden="true" />
                <p>
                  <strong>Frete grátis acima de R$ 150</strong>
                  <span>Calcule o prazo pelo seu CEP no carrinho.</span>
                </p>
              </div>
              <Link to={routes.missions}>
                <Sparkles aria-hidden="true" />
                <p>
                  <strong>
                    Esta compra rende +{rewardPoints} Beauty Points
                  </strong>
                  <span>Conheça as vantagens do Beauty Club.</span>
                </p>
                <ArrowRight size={16} />
              </Link>
            </div>
            <Accordion
              type="single"
              collapsible
              defaultValue="benefits"
              className={styles.accordion}
            >
              {[
                {
                  id: "benefits",
                  title: "Por que você vai amar",
                  text: product.benefits,
                },
                {
                  id: "how-to-use",
                  title: "Como usar",
                  text: product.howToUse,
                },
                {
                  id: "composition",
                  title: "Composição",
                  text: product.composition,
                },
              ].map((detail) => (
                <AccordionItem key={detail.id} value={detail.id}>
                  <AccordionTrigger className={styles.accordionTrigger}>
                    {detail.title}
                  </AccordionTrigger>
                  <AccordionContent className={styles.accordionContent}>
                    {detail.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Link className={styles.helpLink} to={routes.help}>
              Precisa de ajuda com sua escolha? <ArrowRight size={14} />
            </Link>
          </div>
        </section>
        <section
          className={styles.relatedSection}
          aria-labelledby="related-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Sua próxima descoberta</span>
              <h2 id="related-title">
                Mais beleza para a sua rotina <BeautyFlower />
              </h2>
            </div>
            <Link to={routes.category(product.category)}>
              Explorar {category.title.toLowerCase()} <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                {...related}
                onAddToCart={() => addItem(related.id, 1)}
              />
            ))}
          </div>
        </section>
        <aside className={styles.helpBanner}>
          <div>
            <span className={styles.eyebrow}>Compre com tranquilidade</span>
            <h2>Cada detalhe importa.</h2>
            <p>
              Consulte informações sobre entregas, trocas e cuidados com seus
              produtos.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to={routes.help}>
              Central de ajuda <ArrowRight size={16} />
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
