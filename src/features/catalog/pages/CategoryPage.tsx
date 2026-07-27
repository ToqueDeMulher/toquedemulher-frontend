import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { SlidersHorizontal } from "lucide-react";
import {
  catalogCategories,
  defaultCategorySlug,
  getProductsByCategory,
  isCatalogCategorySlug,
} from "@/features/catalog/data/catalog-products";
import { routes } from "@/app/router/paths";
import { useCart } from "@/features/cart/context/cart-context";
import { useGamification } from "@/features/gamification/context/gamification-context";
import styles from "./CategoryPage.module.css";

export function CategoryPage() {
  const { category } = useParams();
  const { addItem } = useCart();
  const { trackCategoryView } = useGamification();
  const [filteredCategory, setFilteredCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const isValidCategory = isCatalogCategorySlug(category);

  useEffect(() => {
    if (!isValidCategory) {
      return;
    }

    setFilteredCategory("all");
    setSortBy("featured");
    trackCategoryView(category);
  }, [category, isValidCategory]);

  if (!isValidCategory) {
    return <Navigate to={routes.category(defaultCategorySlug)} replace />;
  }

  const categoryConfig = catalogCategories[category];
  const categoryProducts = getProductsByCategory(category);
  const subcategories = [
    "all",
    ...new Set(
      categoryProducts.map((product) => product.subcategory.toLowerCase()),
    ),
  ];

  const filteredProducts = categoryProducts.filter((product) =>
    filteredCategory === "all"
      ? true
      : product.subcategory.toLowerCase() === filteredCategory,
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${styles.headerSection}`}>
        <div className={styles.headerInner}>
          <h1 className={styles.headerTitle}>{categoryConfig.title}</h1>
          <p className={styles.headerDescription}>{categoryConfig.description}</p>
        </div>
      </div>

      <div className={`${styles.container} ${styles.filterSection}`}>
        <div className={styles.filterCard}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>
                <SlidersHorizontal className={styles.filterIcon} />
                <span className={styles.filterLabelText}>Filtrar:</span>
              </div>
              <div className={styles.filterButtons}>
                {subcategories.map((subcategory) => (
                  <Button
                    key={subcategory}
                    variant={filteredCategory === subcategory ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilteredCategory(subcategory)}
                    className={
                      filteredCategory === subcategory
                        ? styles.filterButtonActive
                        : styles.filterButton
                    }
                  >
                    {subcategory === "all" ? "Todos" : subcategory}
                  </Button>
                ))}
              </div>
            </div>

            <div className={styles.sortRow}>
              <span className={styles.sortLabel}>Ordenar por:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  className={styles.sortTrigger}
                  aria-label="Ordenar produtos da categoria"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Em Destaque</SelectItem>
                  <SelectItem value="price-asc">Menor Preço</SelectItem>
                  <SelectItem value="price-desc">Maior Preço</SelectItem>
                  <SelectItem value="rating">Melhor Avaliação</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={styles.resultsRow} aria-live="polite">
            Mostrando <span className={styles.resultsCount}>{sortedProducts.length}</span>{" "}
            produtos
          </div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.productsSection}`}>
        <div className={styles.productsGrid}>
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={() => addItem(product.id, 1)}
            />
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>
                <svg
                  className={styles.emptySvg}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>Nenhum produto encontrado</h3>
              <p className={styles.emptyText}>
                Tente selecionar outra categoria ou limpar os filtros.
              </p>
              <Button
                variant="link"
                className={styles.clearButton}
                onClick={() => setFilteredCategory("all")}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className={`${styles.container} ${styles.newsletterSection}`}>
        <div className={styles.newsletterCard}>
          <div className={styles.newsletterPattern} />
          <div className={styles.newsletterContent}>
            <h2 className={styles.newsletterTitle}>Receba novidades</h2>
            <p className={styles.newsletterText}>
              Assine nossa newsletter e receba ofertas exclusivas no seu e-mail.
            </p>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className={styles.newsletterInput}
              />
              <Button
                size="lg"
                variant="outline"
                className={styles.newsletterButton}
              >
                Quero receber
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
