import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { routes } from "@/app/router/paths";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  discount?: number;
  onAddToCart?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
  hideMeta?: boolean;
  hideTitle?: boolean;
}

export function ProductCard({
  id,
  image,
  name,
  price,
  originalPrice,
  rating,
  reviews,
  isNew,
  discount,
  onAddToCart,
  onClick,
  style,
  hideMeta = false,
  hideTitle = false,
}: ProductCardProps) {
  const [isFav, setIsFav] = useState(false);
  const navigate = useNavigate();

  const priceBRL = `R$ ${price.toFixed(2).replace(".", ",")}`;
  const originalBRL =
    typeof originalPrice === "number"
      ? `R$ ${originalPrice.toFixed(2).replace(".", ",")}`
      : undefined;
  const ratingLabel =
    typeof rating === "number"
      ? `Avaliação ${rating.toFixed(1)} de 5 estrelas${
          typeof reviews === "number" ? ` com ${reviews} avaliações` : ""
        }`
      : undefined;

  const handleCardClick = () => {
    if (onClick) return onClick();
    navigate(routes.product(id));
  };

  return (
    <article className={styles.card} style={style}>
      <button
        type="button"
        className={styles.cardAction}
        onClick={handleCardClick}
        aria-label={`Ver detalhes do produto ${name}`}
      >
        <span className="sr-only">Ver detalhes do produto {name}</span>
      </button>

      <div className={styles.imageWrapper}>
        <ImageWithFallback
          src={image}
          alt={name}
          className={styles.productImage}
        />

        <div className={styles.badgeRow}>
          {isNew && <Badge className={styles.badgeNew}>Novo</Badge>}
          {typeof discount === "number" && discount > 0 && (
            <Badge variant="secondary" className={styles.badgeDiscount}>
              -{discount}%
            </Badge>
          )}
        </div>

        <button
          className={styles.favButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsFav((v) => !v);
          }}
          aria-pressed={isFav}
          aria-label={
            isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          type="button"
        >
          <Heart
            className={`${styles.heartIcon} ${
              isFav ? styles.heartIconActive : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className={styles.content}>
        {!hideTitle && <h3 className={styles.title}>{name}</h3>}

        {!hideMeta && typeof rating === "number" && (
          <div className={styles.ratingRow} aria-label={ratingLabel}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`${styles.star} ${
                  i < Math.round(rating) ? styles.starFilled : ""
                }`}
                aria-hidden="true"
              />
            ))}
            <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
            {typeof reviews === "number" && (
              <span className={styles.reviewCount}>({reviews})</span>
            )}
          </div>
        )}

        <div
          className={`${styles.priceRow} ${hideTitle ? styles.priceRowCompact : ""}`}
        >
          <span className={styles.price}>{priceBRL}</span>
          {originalBRL && originalPrice! > price && (
            <span className={styles.originalPrice}>{originalBRL}</span>
          )}
        </div>

        <Button
          size="sm"
          variant="default"
          className={styles.addButton}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
          type="button"
        >
          <ShoppingCart className={styles.cartIcon} aria-hidden="true" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </article>
  );
}
