import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, Minus, Plus, Sparkles, Star } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { toast } from "sonner";
import {
  getProductById,
  getRelatedProducts,
} from "@/shared/data/catalog-products";
import { useCart } from "@/shared/contexts/cart-context";
import { useGamification } from "@/shared/contexts/gamification-context";
import { calculateCartRewardPoints } from "@/features/gamification/lib/gamification-config";
import { routes } from "@/shared/lib/routes";
import styles from "./ProductPage.module.css";

export function ProductPage() {
  const navigate = useNavigate();
  const { productId = "1" } = useParams();
  const { addItem } = useCart();
  const { trackProductView } = useGamification();
  const product = getProductById(productId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productName = "Batom Matte Nude Luxo";

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setIsWishlisted(false);
  }, [productId]);

  useEffect(() => {
    if (!product) {
      return;
    }

    trackProductView(product.id, product.category);
  }, [product]);

  if (!product) {
    return (
      <div className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.confirmationCard}>
              <span className={styles.confirmationIconWrap}>
                <Heart className={styles.confirmationIcon} />
              </span>
              <h1 className={styles.confirmationTitle}>Produto não encontrado</h1>
              <p className={styles.confirmationText}>
                O item que você tentou acessar não existe mais ou foi removido do
                catálogo.
              </p>
              <div className={styles.relatedButtonWrap}>
                <Button size="lg" onClick={() => navigate(routes.home)}>
                  Voltar para a home
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product.id, 4);
  const productImages = [
    product.image,
    ...relatedProducts.map((relatedProduct) => relatedProduct.image),
  ].slice(0, 4);
  const rewardPoints = calculateCartRewardPoints([
    { price: product.price, quantity },
  ]);
  const reviews = [
    {
      id: 1,
      author: "Maria Silva",
      rating: 5,
      date: "15/01/2025",
      comment: `Amei ${product.name}. Textura confortável e resultado exatamente como esperado.`,
      images: productImages.slice(0, 2),
    },
    {
      id: 2,
      author: "Ana Paula",
      rating: 5,
      date: "10/01/2025",
      comment: "Entrega rápida, e produto impecável. Entrou fácil na minha rotina.",
      images: productImages.slice(1, 2),
    },
  ];

  const handleAddToCart = () => {
    addItem(product.id, quantity);
    toast.success(`Produto adicionado ao carrinho. Compra rende +${rewardPoints} pontos.`);
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div>
              <div className={styles.imagePanel}>
                <ImageWithFallback
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className={styles.mainImage}
                />
              </div>
              <div className={styles.thumbGrid}>
                {productImages.map((image, index) => (
                  <button
                    key={`${product.id}-thumb-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`${styles.thumbButton} ${
                      selectedImage === index
                        ? styles.thumbActive
                        : styles.thumbInactive
                    }`}
                    aria-label={`Selecionar imagem ${index + 1} de ${productImages.length}`}
                    aria-pressed={selectedImage === index}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${product.name} - imagem ${index + 1}`}
                      className={styles.thumbImage}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h1 className={styles.title}>{product.name}</h1>

              <div className={styles.ratingRow}>
                <div className={styles.ratingStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={styles.ratingStar} aria-hidden="true" />
                  ))}
                </div>
                <span className={styles.ratingText}>{product.rating.toFixed(1)}</span>
                <span className={styles.ratingSeparator}>|</span>
                <span className={styles.ratingText}>
                  {product.reviews} Avaliações
                </span>
              </div>

              <div className={styles.priceBlock}>
                <div className={styles.priceRow}>
                  <span className={styles.price}>
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </span>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>
                      R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                  {typeof product.discount === "number" && (
                    <Badge className={styles.badgeDiscount}>
                      -{product.discount}%
                    </Badge>
                  )}
                </div>
                <div className={styles.rewardCard}>
                  <Sparkles className={styles.rewardIcon} />
                  <div>
                    <p className={styles.rewardTitle}>Beauty Points nesta compra</p>
                    <p className={styles.rewardText}>+{rewardPoints} pontos ao finalizar o pedido</p>
                  </div>
                </div>
              </div>

              <p className={styles.description}>{product.description}</p>

              <div className={styles.quantityBlock}>
                <p id="product-quantity-label" className={styles.quantityLabel}>
                  Quantidade
                </p>
                <div
                  className={styles.quantityControls}
                  role="group"
                  aria-labelledby="product-quantity-label"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className={styles.quantityIcon} aria-hidden="true" />
                  </Button>
                  <span className={styles.quantityValue} aria-live="polite">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className={styles.quantityIcon} aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className={styles.actionRow}>
                <Button
                  size="lg"
                  variant="default"
                  className={styles.addButton}
                  onClick={handleAddToCart}
                >
                  ADICIONAR AO CARRINHO
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`${styles.wishlistButton} ${
                    isWishlisted ? styles.wishlistActive : ""
                  }`}
                  onClick={() => {
                    setIsWishlisted((current) => !current);
                    toast.success(
                      isWishlisted
                        ? "Removido da wishlist"
                        : "Adicionado à wishlist",
                    );
                  }}
                  aria-pressed={isWishlisted}
                  aria-label={
                    isWishlisted
                      ? `Remover ${productName} da wishlist`
                      : `Adicionar ${productName} à wishlist`
                  }
                >
                  <Heart
                    className={`${styles.wishlistIcon} ${
                      isWishlisted ? styles.wishlistIconActive : ""
                    }`}
                    aria-hidden="true"
                  />
                </Button>
              </div>

              <Accordion type="single" collapsible className={styles.accordion}>
                <AccordionItem value="composition">
                  <AccordionTrigger className={styles.accordionTrigger}>
                    Composição
                  </AccordionTrigger>
                  <AccordionContent className={styles.accordionContent}>
                    {product.composition}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="benefits">
                  <AccordionTrigger className={styles.accordionTrigger}>
                    Benefícios
                  </AccordionTrigger>
                  <AccordionContent className={styles.accordionContent}>
                    {product.benefits}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="how-to-use">
                  <AccordionTrigger className={styles.accordionTrigger}>
                    Como usar
                  </AccordionTrigger>
                  <AccordionContent className={styles.accordionContent}>
                    {product.howToUse}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <div className={styles.reviewHeader}>
            <h2 className={styles.reviewTitle}>AVALIAÇÕES DO PRODUTO</h2>

            <div className={styles.summaryCard}>
              <div className={styles.summaryInner}>
                <div className={styles.summaryRating}>{product.rating.toFixed(1)}</div>
                <div className={styles.summaryStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={styles.summaryStar} aria-hidden="true" />
                  ))}
                </div>
                <p className={styles.summaryCount}>{product.reviews} avaliações</p>
                <Button size="lg" variant="outline" className={styles.summaryButton}>
                  Escrever avaliação
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.reviewList}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewTop}>
                  <div>
                    <p className={styles.reviewAuthor}>{review.author}</p>
                    <div className={styles.reviewStars}>
                      {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`${styles.reviewStar} ${
                          i < review.rating ? styles.reviewStarActive : ""
                        }`}
                        aria-hidden="true"
                      />
                      ))}
                    </div>
                  </div>
                  <span className={styles.reviewDate}>{review.date}</span>
                </div>
                <p className={styles.reviewText}>{review.comment}</p>
                {review.images.length > 0 && (
                  <div className={styles.reviewImages}>
                    {review.images.map((image, index) => (
                      <ImageWithFallback
                        key={`${review.id}-${index}`}
                        src={image}
                        alt={`Review ${review.id}`}
                        className={styles.reviewImage}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.relatedSection}>
        <div className={styles.container}>
          <h2 className={styles.relatedTitle}>QUEM VIU TAMBÉM GOSTOU</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                {...relatedProduct}
                onAddToCart={() => addItem(relatedProduct.id, 1)}
              />
            ))}
          </div>
          <div className={styles.relatedButtonWrap}>
            <Button
              size="lg"
              variant="outline"
              className={styles.relatedButton}
              onClick={() => navigate(routes.category(product.category))}
            >
              VER TUDO &gt;
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <h2 className={styles.faqTitle}>FAQ</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Este produto é testado em animais?
              </AccordionTrigger>
              <AccordionContent>
                Não. O catálogo destaca produtos cruelty-free sempre que a marca
                informa essa característica.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Qual a validade do produto?</AccordionTrigger>
              <AccordionContent>
                A validade varia por lote e fabricante. Consulte a embalagem ao
                receber o item para confirmar o prazo informado pela marca.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className={styles.faqButtonWrap}>
            <Button size="lg" variant="outline" className={styles.faqButton} asChild>
              <Link to={routes.help}>VER TUDO &gt;</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
