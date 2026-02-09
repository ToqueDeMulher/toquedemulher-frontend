import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { routes } from "@/shared/lib/routes";
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
}: ProductCardProps) {
  const [isFav, setIsFav] = useState(false);
  const navigate = useNavigate();

  const priceBRL = `R$ ${price.toFixed(2).replace(".", ",")}`;
  const originalBRL =
    typeof originalPrice === "number"
      ? `R$ ${originalPrice.toFixed(2).replace(".", ",")}`
      : undefined;

  const handleCardClick = () => {
    if (onClick) return onClick();
    navigate(routes.product(id));
  };

  return (
    <div
      className={styles.card}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick();
        }
      }}
    >
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
          aria-label={
            isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          type="button"
        >
          <Heart
            className={`${styles.heartIcon} ${
              isFav ? styles.heartIconActive : ""
            }`}
          />
        </button>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{name}</h3>

        {typeof rating === "number" && (
          <div className={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`${styles.star} ${
                  i < Math.round(rating) ? styles.starFilled : ""
                }`}
              />
            ))}
            <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
            {typeof reviews === "number" && (
              <span className={styles.reviewCount}>({reviews})</span>
            )}
          </div>
        )}

        <div className={styles.priceRow}>
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
          <ShoppingCart className={styles.cartIcon} />
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  );
}
