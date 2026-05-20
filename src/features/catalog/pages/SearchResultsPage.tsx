import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Search, X } from "lucide-react";
import { routes } from "@/shared/lib/routes";
import { useCart } from "@/shared/contexts/cart-context";
import { trendingProducts } from "@/shared/data/catalog-products";
import styles from "./SearchResultsPage.module.css";

const categories = [
  "maquiagem",
  "skincare",
  "corpo",
  "cabelos",
  "perfumes",
  "hidratante",
  "batom",
  "serum",
  "mascara",
  "base",
  "perfume",
  "shampoo",
  "condicionador",
  "creme",
  "oleo",
  "kit",
  "paleta",
  "blush",
  "gloss",
];

const categoryData = {
  maquiagem: {
    title: "Maquiagem",
    products: trendingProducts.filter((p) =>
      p.name.toLowerCase().includes("bat") ||
      p.name.toLowerCase().includes("base") ||
      p.name.toLowerCase().includes("mascara") ||
      p.name.toLowerCase().includes("blush")
    ),
  },
  skincare: {
    title: "Skincare",
    products: trendingProducts.filter((p) =>
      p.name.toLowerCase().includes("serum") ||
      p.name.toLowerCase().includes("hidrat") ||
      p.name.toLowerCase().includes("creme")
    ),
  },
  corpo: {
    title: "Corpo",
    products: trendingProducts.filter((p) =>
      p.name.toLowerCase().includes("corpo") ||
      p.name.toLowerCase().includes("loção")
    ),
  },
  cabelos: {
    title: "Cabelos",
    products: trendingProducts.filter((p) =>
      p.name.toLowerCase().includes("shampoo") ||
      p.name.toLowerCase().includes("condicionador") ||
      p.name.toLowerCase().includes("kit")
    ),
  },
  perfumes: {
    title: "Perfumes",
    products: trendingProducts.filter((p) =>
      p.name.toLowerCase().includes("perfume") ||
      p.name.toLowerCase().includes("eau")
    ),
  },
};

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const query = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<typeof trendingProducts>([]);
  const [matchedCategories, setMatchedCategories] = useState<string[]>([]);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setMatchedCategories([]);
      return;
    }

    const normalizedTerm = searchTerm.toLowerCase().trim();

    // Buscar em produtos
    const productResults = trendingProducts.filter((product) =>
      product.name.toLowerCase().includes(normalizedTerm)
    );

    // Buscar categorias que correspondem ao termo
    const matchedCats = categories.filter((cat) =>
      cat.includes(normalizedTerm) || normalizedTerm.includes(cat)
    );

    setResults(productResults);
    setMatchedCategories(matchedCats);
  }, [searchTerm]);

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
                  onAddToCart={() => addItem(product.id, 1)}
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

      {results.length === 0 && searchTerm.trim() !== "" && (
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
                onClick={() => navigate(routes.category("feminino"))}
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
