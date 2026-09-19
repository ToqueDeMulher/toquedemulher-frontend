import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  SearchX,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { BeautyFlower } from "@/shared/ui/BeautyFlower";
import {
  catalogCategories,
  defaultCategorySlug,
  getProductsByCategory,
  isCatalogCategorySlug,
  type CatalogCategorySlug,
} from "@/features/catalog/data/catalog-products";
import { routes } from "@/app/router/paths";
import { useCart } from "@/features/cart/context/cart-context";
import { useGamification } from "@/features/gamification/context/gamification-context";
import { Reveal } from "@/shared/animation/Reveal";
import styles from "./CategoryPage.module.css";

const CATEGORY_EDITORIAL: Record<
  CatalogCategorySlug,
  { eyebrow: string; statement: string; note: string }
> = {
  maquiagem: {
    eyebrow: "Cor, textura e expressão",
    statement: "Seu jeito de criar, todos os dias.",
    note: "Do detalhe sutil ao look completo, escolha o que combina com o seu momento.",
  },
  skincare: {
    eyebrow: "Cuidado em cada etapa",
    statement: "Uma rotina que acolhe a sua pele.",
    note: "Texturas e ativos para transformar constância em um ritual prazeroso.",
  },
  corpo: {
    eyebrow: "Pausa para você",
    statement: "Cuidado que também se sente.",
    note: "Nutrição, perfume e conforto para prolongar a sensação de pele bem cuidada.",
  },
  cabelos: {
    eyebrow: "Força, brilho e movimento",
    statement: "Seu cabelo no melhor ritmo.",
    note: "Tratamentos e finalizadores para acompanhar cada fase da sua rotina capilar.",
  },
  perfumes: {
    eyebrow: "Memória e personalidade",
    statement: "Uma assinatura que fica.",
    note: "Encontre a fragrância que traduz sua presença, do primeiro toque ao fundo.",
  },
};

const CATEGORY_ORDER = Object.keys(catalogCategories) as CatalogCategorySlug[];

function formatSubcategory(value: string) {
  return value.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

export function CategoryPage() {
  const { category } = useParams();
  const { addItem } = useCart();
  const { trackCategoryView } = useGamification();
  const [filteredCategory, setFilteredCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const isValidCategory = isCatalogCategorySlug(category);

  useEffect(() => {
    if (!isValidCategory) return;
    setFilteredCategory("all");
    setSortBy("featured");
    trackCategoryView(category);
  }, [category, isValidCategory, trackCategoryView]);

  if (!isValidCategory) {
    return <Navigate to={routes.category(defaultCategorySlug)} replace />;
  }

  const categoryConfig = catalogCategories[category];
  const editorial = CATEGORY_EDITORIAL[category];
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

  const categoryIndex = CATEGORY_ORDER.indexOf(category);
  const nextCategory =
    CATEGORY_ORDER[(categoryIndex + 1) % CATEGORY_ORDER.length] ?? defaultCategorySlug;
  const hasFilterChoices = subcategories.length > 2;
  const hasSortingChoices = categoryProducts.length > 1;

  return (
    <div className={styles.page}>
      <section className={`${styles.container} ${styles.heroSection}`}>
        <Reveal className={styles.heroCard} delayMs={50}>
          <BeautyFlower className={styles.heroFlower} />
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>
              <Sparkles className={styles.heroEyebrowIcon} />
              {editorial.eyebrow}
            </p>
            <h1 className={styles.headerTitle}>{categoryConfig.title}</h1>
            <p className={styles.heroStatement}>{editorial.statement}</p>
            <p className={styles.headerDescription}>{editorial.note}</p>
          </div>

          <aside className={styles.heroAside} aria-label="Resumo da categoria">
            <span className={styles.heroIndex}>
              0{categoryIndex + 1} / 0{CATEGORY_ORDER.length}
            </span>
            <div className={styles.heroAsideMain}>
              <strong>{categoryProducts.length}</strong>
              <span>{categoryProducts.length === 1 ? "produto" : "produtos"}</span>
            </div>
            <div className={styles.heroTags}>
              {subcategories
                .filter((item) => item !== "all")
                .slice(0, 4)
                .map((subcategory) => (
                  <span key={subcategory}>{formatSubcategory(subcategory)}</span>
                ))}
            </div>
          </aside>
        </Reveal>
      </section>

      <section className={`${styles.container} ${styles.productsSection}`}>
        <div className={styles.productsHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Seleção da categoria</p>
            <h2 className={styles.sectionTitle}>Escolha com calma.</h2>
          </div>
          <p className={styles.resultsRow} aria-live="polite">
            <strong>{sortedProducts.length}</strong>{" "}
            {sortedProducts.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>

        {(hasFilterChoices || hasSortingChoices) && (
          <Reveal className={styles.filterCard} delayMs={80}>
            {hasFilterChoices && (
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>
                  <SlidersHorizontal className={styles.filterIcon} />
                  Filtrar por
                </span>
                <div className={styles.filterButtons}>
                  {subcategories.map((subcategory) => {
                    const isActive = filteredCategory === subcategory;
                    return (
                      <button
                        key={subcategory}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setFilteredCategory(subcategory)}
                        className={`${styles.filterButton} ${
                          isActive ? styles.filterButtonActive : ""
                        }`}
                      >
                        {subcategory === "all"
                          ? "Todos"
                          : formatSubcategory(subcategory)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasSortingChoices && (
              <div className={styles.sortRow}>
                <span className={styles.sortLabel}>Ordenar</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    className={styles.sortTrigger}
                    aria-label="Ordenar produtos da categoria"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Em destaque</SelectItem>
                    <SelectItem value="price-asc">Menor preço</SelectItem>
                    <SelectItem value="price-desc">Maior preço</SelectItem>
                    <SelectItem value="rating">Melhor avaliação</SelectItem>
                    <SelectItem value="name">Nome de A a Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </Reveal>
        )}

        {sortedProducts.length > 0 ? (
          <Reveal className={styles.productsGrid} delayMs={110}>
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={() => addItem(product.id, 1)}
              />
            ))}
          </Reveal>
        ) : (
          <div className={styles.emptyCard}>
            <span className={styles.emptyIcon}><SearchX /></span>
            <h3 className={styles.emptyTitle}>Nenhum produto nesta seleção.</h3>
            <p className={styles.emptyText}>Escolha outro filtro para continuar explorando.</p>
            <Button
              variant="outline"
              className={styles.clearButton}
              onClick={() => setFilteredCategory("all")}
            >
              Mostrar todos
            </Button>
          </div>
        )}
      </section>

      <section className={`${styles.container} ${styles.discoverySection}`}>
        <Reveal className={styles.discoveryCard} delayMs={140}>
          <BeautyFlower className={styles.discoveryFlower} />
          <div>
            <p className={styles.discoveryEyebrow}>Continue descobrindo</p>
            <h2 className={styles.discoveryTitle}>
              Depois de {categoryConfig.title.toLowerCase()}, explore {" "}
              {catalogCategories[nextCategory].title.toLowerCase()}.
            </h2>
            <p className={styles.discoveryText}>
              Uma nova seleção espera por você, com escolhas para completar o seu ritual.
            </p>
          </div>
          <div className={styles.discoveryActions}>
            <Button asChild className={styles.discoveryPrimary}>
              <Link to={routes.category(nextCategory)}>
                Ver {catalogCategories[nextCategory].title}
                <ArrowRight className={styles.actionIcon} />
              </Link>
            </Button>
            <Button asChild variant="outline" className={styles.discoverySecondary}>
              <Link to={routes.favorites}>
                <Heart className={styles.actionIcon} /> Meus favoritos
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
