import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ArrowRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  catalogCategories,
  defaultCategorySlug,
  getProductsByCategory,
  isCatalogCategorySlug,
} from "@/features/catalog/data/catalog-products";
import { routes } from "@/app/router/paths";
import { useCart } from "@/features/cart/context/cart-context";
import { useGamification } from "@/features/gamification/context/gamification-context";
import { Reveal } from "@/shared/animation/Reveal";
import styles from "./CategoryPage.module.css";

const categoryDescriptions = {
  maquiagem: "Bases, blushes, batons e kits para looks do dia a dia ou produções completas.",
  skincare: "Limpeza, hidratação e tratamento para uma rotina de cuidado consistente.",
  corpo: "Cremes, loções e autocuidado corporal para manter a pele nutrida e perfumada.",
  cabelos: "Tratamentos e finalizadores para rotina capilar com brilho, força e reparação.",
  perfumes: "Fragrâncias femininas marcantes, do floral delicado ao amadeirado sofisticado.",
} as const;

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
  }, [category, isValidCategory, trackCategoryView]);

  if (!isValidCategory) {
    return <Navigate to={routes.category(defaultCategorySlug)} replace />;
  }

  const categoryConfig = catalogCategories[category];
  const categoryProducts = getProductsByCategory(category);
  const subcategories = useMemo(
    () => [
      "all",
      ...new Set(
        categoryProducts.map((product) => product.subcategory.toLowerCase()),
      ),
    ],
    [categoryProducts],
  );

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

  const featuredSubcategories = subcategories
    .filter((item) => item !== "all")
    .slice(0, 3);

  return (
    <div className={styles.page}>
      <section className={`${styles.container} ${styles.heroSection}`}>
        <Reveal className={styles.heroCard} delayMs={60}>
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <Sparkles className={styles.heroEyebrowIcon} />
              Categoria em destaque
            </div>

            <h1 className={styles.headerTitle}>{categoryConfig.title}</h1>
            <p className={styles.headerDescription}>{categoryDescriptions[category]}</p>

            <div className={styles.heroMeta}>
              <div className={styles.heroMetric}>
                <span className={styles.heroMetricLabel}>Produtos</span>
                <strong className={styles.heroMetricValue}>{categoryProducts.length}</strong>
              </div>
              <div className={styles.heroMetric}>
                <span className={styles.heroMetricLabel}>Subcategorias</span>
                <strong className={styles.heroMetricValue}>{subcategories.length - 1}</strong>
              </div>
              <div className={styles.heroMetric}>
                <span className={styles.heroMetricLabel}>Seleção</span>
                <strong className={styles.heroMetricValue}>Atualizada</strong>
              </div>
            </div>

            <div className={styles.heroChips}>
              {featuredSubcategories.map((subcategory) => (
                <Badge key={subcategory} className={styles.heroChip}>
                  {subcategory}
                </Badge>
              ))}
            </div>
          </div>

          <div className={styles.heroAside}>
            <div className={styles.heroAsideCard}>
              <p className={styles.heroAsideTitle}>A mesma atmosfera elegante da home.</p>
              <p className={styles.heroAsideText}>
                Navegue pela categoria com mais ritmo visual, filtros claros e vitrine mais refinada.
              </p>
              <div className={styles.heroAsideLink}>
                Ver destaques
                <ArrowRight className={styles.heroAsideIcon} />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <div className={`${styles.container} ${styles.filterSection}`}>
        <Reveal className={styles.filterCard} delayMs={100}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>
                <SlidersHorizontal className={styles.filterIcon} />
                <span className={styles.filterLabelText}>Filtrar</span>
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
            Mostrando <span className={styles.resultsCount}>{sortedProducts.length}</span> produtos
          </div>
        </Reveal>
      </div>

      <div className={`${styles.container} ${styles.productsSection}`}>
        <Reveal className={styles.productsGrid} delayMs={130}>
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={() => addItem(product.id, 1)}
            />
          ))}
        </Reveal>

        {sortedProducts.length === 0 && (
          <Reveal className={styles.emptyState} delayMs={160}>
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
          </Reveal>
        )}
      </div>

      <div className={`${styles.container} ${styles.newsletterSection}`}>
        <Reveal className={styles.newsletterCard} delayMs={180}>
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
              <Button size="lg" variant="outline" className={styles.newsletterButton}>
                Quero receber
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
