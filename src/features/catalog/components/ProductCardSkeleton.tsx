import { Skeleton } from "@/shared/ui/skeleton";
import styles from "./ProductCard.module.css";

export function ProductCardSkeleton({ style, hideTitle = false, hideMeta = false }: { style?: React.CSSProperties; hideTitle?: boolean; hideMeta?: boolean }) {
  return (
    <article className={styles.card} style={style}>
      <div className={styles.imageWrapper}>
        <Skeleton className="w-[min(74%,12rem)] h-[var(--product-card-image-h,10.25rem)] sm:h-[var(--product-card-image-h-sm,10.75rem)] rounded-md mx-auto" />
      </div>
      <div className={styles.content}>
        {!hideTitle && (
          <div className="min-h-[2.45rem] flex flex-col gap-1.5 mt-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
        
        {!hideMeta && (
          <div className="flex items-center gap-1 mt-3">
            <Skeleton className="h-3 w-16" />
          </div>
        )}
        
        <div className={`${styles.priceRow} ${hideTitle ? styles.priceRowCompact : ""}`}>
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </article>
  );
}
