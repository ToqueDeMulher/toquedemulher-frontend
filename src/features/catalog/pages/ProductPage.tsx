import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Minus, Plus, Star } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { toast } from "sonner";
import { useCart } from "@/shared/contexts/cart-context";
import { routes } from "@/shared/lib/routes";
import styles from "./ProductPage.module.css";

const productImages = [
  "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjE1Mjk1MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2MTUyOTUxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1613803745799-ba6c10aace85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHByb2R1Y3RzfGVufDF8fHx8MTc2MTUwMjU4NXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjE1Mjk1MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

const reviews = [
  {
    id: 1,
    author: "Maria Silva",
    rating: 5,
    date: "15/01/2025",
    comment:
      "Produto incrível! A textura é maravilhosa e a pigmentação é perfeita. Super recomendo!",
    images: [
      "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?w=150",
      "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?w=150",
    ],
  },
  {
    id: 2,
    author: "Ana Paula",
    rating: 5,
    date: "10/01/2025",
    comment:
      "Melhor compra que fiz! Duração excelente e não resseca os lábios. Amei!",
    images: [
      "https://images.unsplash.com/photo-1613803745799-ba6c10aace85?w=150",
    ],
  },
];

const relatedProducts = [
  {
    id: "7",
    name: "Gloss Hidratante Brilho Intenso",
    price: 29.9,
    image:
      "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2MTUyOTUxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 5,
    reviews: 67,
  },
  {
    id: "8",
    name: "Primer Labial Prolongador",
    price: 34.9,
    image:
      "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjE1Mjk1MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 5,
    reviews: 45,
  },
  {
    id: "9",
    name: "Delineador Labial Nude",
    price: 24.9,
    image:
      "https://images.unsplash.com/photo-1613803745799-ba6c10aace85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHByb2R1Y3RzfGVufDF8fHx8MTc2MTUwMjU4NXww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 5,
    reviews: 89,
  },
  {
    id: "10",
    name: "Kit Lábios Perfeitos",
    price: 99.9,
    originalPrice: 149.9,
    image:
      "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2MTUyOTUxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 5,
    reviews: 123,
    discount: 33,
  },
  {
    id: "11",
    name: "Removedor de Maquiagem Labial",
    price: 19.9,
    image:
      "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjE1Mjk1MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 5,
    reviews: 56,
  },
];

export function ProductPage() {
  const { productId = "1" } = useParams();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = () => {
    addItem(quantity);
    toast.success("Produto adicionado ao carrinho!");
  };

  return (
    <div className={styles.page}>
      {/* Product Details */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Images */}
            <div>
              <div className={styles.imagePanel}>
                <ImageWithFallback
                  src={productImages[selectedImage]}
                  alt="Product"
                  className={styles.mainImage}
                />
              </div>
              <div className={styles.thumbGrid}>
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`${styles.thumbButton} ${
                      selectedImage === index
                        ? styles.thumbActive
                        : styles.thumbInactive
                    }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={styles.thumbImage}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className={styles.title}>Batom Matte Nude Luxo</h1>

              {/* Rating */}
              <div className={styles.ratingRow}>
                <div className={styles.ratingStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={styles.ratingStar} />
                  ))}
                </div>
                <span className={styles.ratingText}>5.0</span>
                <span className={styles.ratingSeparator}>|</span>
                <span className={styles.ratingText}>124 Avaliações</span>
              </div>

              {/* Price */}
              <div className={styles.priceBlock}>
                <div className={styles.priceRow}>
                  <span className={styles.price}>R$ 45,90</span>
                  <span className={styles.originalPrice}>R$ 65,90</span>
                  <Badge className={styles.badgeDiscount}>-30%</Badge>
                </div>
              </div>

              {/* Description */}
              <p className={styles.description}>
                Batom matte de alta pigmentação com textura aveludada. Fórmula
                enriquecida com vitamina E para hidratação profunda. Cores
                intensas e duradouras que não ressecam os lábios.
              </p>

              {/* Quantity */}
              <div className={styles.quantityBlock}>
                <label className={styles.quantityLabel}>Quantidade</label>
                <div className={styles.quantityControls}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className={styles.quantityIcon} />
                  </Button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className={styles.quantityIcon} />
                  </Button>
                </div>
              </div>

              {/* Actions */}
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
                    setIsWishlisted(!isWishlisted);
                    toast.success(
                      isWishlisted
                        ? "Removido da wishlist"
                        : "Adicionado à wishlist",
                    );
                  }}
                >
                  <Heart
                    className={`${styles.wishlistIcon} ${
                      isWishlisted ? styles.wishlistIconActive : ""
                    }`}
                  />
                </Button>
              </div>

              {/* Accordion Details */}
              <Accordion type="single" collapsible className={styles.accordion}>
                <AccordionItem value="composition">
                  <AccordionTrigger className={styles.accordionTrigger}>
                    Composição
                  </AccordionTrigger>
                  <AccordionContent className={styles.accordionContent}>
                    Vitamina E, óleos naturais, pigmentos minerais de alta
                    qualidade. Livre de parabenos e crueldade animal.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="benefits">
                  <AccordionTrigger className={styles.accordionTrigger}>
                    Benefícios
                  </AccordionTrigger>
                  <AccordionContent className={styles.accordionContent}>
                    Alta pigmentação, longa duração, hidratação intensa, textura
                    aveludada, cores vibrantes.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="how-to-use">
                  <AccordionTrigger className={styles.accordionTrigger}>
                    Como usar
                  </AccordionTrigger>
                  <AccordionContent className={styles.accordionContent}>
                    Aplique diretamente nos lábios, começando pelo centro e
                    espalhando para as bordas. Para maior precisão, use um
                    delineador labial.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <div className={styles.reviewHeader}>
            <h2 className={styles.reviewTitle}>AVALIAÇÕES DO PRODUTO</h2>

            <div className={styles.summaryCard}>
              <div className={styles.summaryInner}>
                <div className={styles.summaryRating}>5.0</div>
                <div className={styles.summaryStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={styles.summaryStar} />
                  ))}
                </div>
                <p className={styles.summaryCount}>124 avaliações</p>
                <Button size="lg" variant="outline" className={styles.summaryButton}>
                  Escrever avaliação
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
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
                        />
                      ))}
                    </div>
                  </div>
                  <span className={styles.reviewDate}>{review.date}</span>
                </div>
                <p className={styles.reviewText}>{review.comment}</p>
                {review.images && (
                  <div className={styles.reviewImages}>
                    {review.images.map((img, idx) => (
                      <ImageWithFallback
                        key={idx}
                        src={img}
                        alt="Review"
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

      {/* Related Products */}
      <section className={styles.relatedSection}>
        <div className={styles.container}>
          <h2 className={styles.relatedTitle}>QUEM VIU TAMBÉM GOSTOU</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={() => addItem(1)}
              />
            ))}
          </div>
          <div className={styles.relatedButtonWrap}>
            <Button size="lg" variant="outline" className={styles.relatedButton}>
              VER TUDO &gt;
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <h2 className={styles.faqTitle}>FAQ</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Este produto é testado em animais?
              </AccordionTrigger>
              <AccordionContent>
                Não! Todos os nossos produtos são cruelty-free e não são
                testados em animais.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Qual a validade do produto?</AccordionTrigger>
              <AccordionContent>
                A validade é de 24 meses a partir da data de fabricação, que
                está indicada na embalagem.
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
