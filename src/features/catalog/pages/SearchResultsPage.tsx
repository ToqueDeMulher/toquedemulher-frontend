import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Search, X } from "lucide-react";
import { routes } from "@/app/router/paths";
import { useCart } from "@/features/cart/context/cart-context";
import { useCatalog } from "@/features/catalog/context/catalog-context";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { catalogCategories } from "@/features/catalog/data/catalog-products";
import styles from "./SearchResultsPage.module.css";

const categories = Object.keys(catalogCategories);

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { products, loading, error } = useCatalog();
  const query = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const normalizedTerm = searchTerm.toLocaleLowerCase("pt-BR").trim();
  const results = normalizedTerm ? products.filter(product =>
    [product.name, product.description, product.subcategory, ...product.categories].join(" ").toLocaleLowerCase("pt-BR").includes(normalizedTerm)
  ) : [];
  const matchedCategories = normalizedTerm ? categories.filter(category => category.includes(normalizedTerm) || normalizedTerm.includes(category)) : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(routes.search(searchTerm));
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    navigate(routes.search());
  };

  const handleCategoryClick = (category: string) => {
    navigate(routes.category(category));
  };

  const handleProductClick = (productId: string) => {
    navigate(routes.product(productId));
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${styles.searchSection}`}>
        <div className={styles.searchBox}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <Search className={styles.searchIcon} />
            <Input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar produtos"
            />
            {searchTerm && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={clearSearch}
                aria-label="Limpar busca"
              >
                <X className={styles.clearIcon} />
              </button>
            )}
            <Button type="submit" size="sm" className={styles.submitButton}>
              Buscar
            </Button>
          </form>
        </div>
      </div>

      <CatalogFeedback empty={false} />
      {results.length > 0 && (
        <div className={`${styles.container} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>
            Resultados para "{searchTerm}"
          </h2>
          <p className={styles.resultsCount}>
            {results.length} produto{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
          </p>
          <div className={styles.productsGrid}>
            {results.map((product) => (
              <div key={product.id} className={styles.productWrapper}>
                <ProductCard
                  {...product}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  rating={product.rating}
                  reviews={product.reviews}
                  isNew={product.isNew}
                  discount={product.discount}
                  onClick={() => handleProductClick(product.id)}
                  onAddToCart={() => addItem(product, 1)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {matchedCategories.length > 0 && (
        <div className={`${styles.container} ${styles.categoriesSection}`}>
          <h3 className={styles.categoriesTitle}>Categorias relacionadas</h3>
          <div className={styles.categoriesList}>
            {matchedCategories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="lg"
                className={styles.categoryButton}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && searchTerm.trim() !== "" && (
        <div className={styles.emptyState}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <Search className={styles.emptySvg} />
            </div>
            <h3 className={styles.emptyTitle}>
              Nenhum resultado encontrado
            </h3>
            <p className={styles.emptyText}>
              Não encontramos produtos para "{searchTerm}".
            </p>
            <p className={styles.emptySuggestion}>
              Tente termos mais genéricos ou verifique a ortografia.
            </p>
            <div className={styles.emptyActions}>
              <Button
                variant="default"
                className={styles.backButton}
                onClick={() => navigate(routes.home)}
              >
                Voltar para a página inicial
              </Button>
              <Button
                variant="outline"
                className={styles.browseButton}
                onClick={() => navigate(routes.category("maquiagem"))}
              >
                Ver categorias
              </Button>
            </div>
          </div>
        </div>
      )}

      {!searchTerm.trim() && (
        <div className={styles.emptyState}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <Search className={styles.emptySvg} />
            </div>
            <h3 className={styles.emptyTitle}>
              Digite um termo para buscar
            </h3>
            <p className={styles.emptyText}>
              Use a barra acima para encontrar produtos, categorias e mais.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
