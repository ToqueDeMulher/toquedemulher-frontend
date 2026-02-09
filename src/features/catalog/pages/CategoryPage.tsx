import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { routes } from "@/shared/lib/routes";
import { useCart } from "@/shared/contexts/cart-context";
import styles from "./CategoryPage.module.css";

const categoryData = {
  feminino: {
    title: "Produtos Femininos",
    description: "Beleza e cuidado especial para voce",
    products: [
      {
        id: "1",
        name: "Batom Matte Rose",
        price: 89.9,
        image:
          "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500",
        category: "Maquiagem",
        rating: 4.8,
      },
      {
        id: "2",
        name: "Serum Facial Antioxidante",
        price: 149.9,
        image:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
        category: "Skincare",
        rating: 4.9,
      },
      {
        id: "3",
        name: "Base Liquida HD",
        price: 119.9,
        image:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
        category: "Maquiagem",
        rating: 4.7,
      },
      {
        id: "4",
        name: "Mascara de Cílios Volume",
        price: 79.9,
        image:
          "https://images.unsplash.com/photo-1631214524020-7e18db3a8a1c?w=500",
        category: "Maquiagem",
        rating: 4.6,
      },
      {
        id: "5",
        name: "Hidratante Facial Rosa",
        price: 99.9,
        image:
          "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500",
        category: "Skincare",
        rating: 4.8,
      },
      {
        id: "6",
        name: "Paleta de Sombras Nude",
        price: 159.9,
        image:
          "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500",
        category: "Maquiagem",
        rating: 4.9,
      },
    ],
  },
  masculino: {
    title: "Produtos Masculinos",
    description: "Cuidados essenciais para o homem moderno",
    products: [
      {
        id: "m1",
        name: "Locao Pos Barba",
        price: 69.9,
        image:
          "https://images.unsplash.com/photo-1621607512214-68297480165e?w=500",
        category: "Cuidados",
        rating: 4.7,
      },
      {
        id: "m2",
        name: "Gel Modelador Cabelo",
        price: 49.9,
        image:
          "https://images.unsplash.com/photo-1564024672607-494485e9c00a?w=500",
        category: "Cabelo",
        rating: 4.6,
      },
      {
        id: "m3",
        name: "Sabonete Facial Carvao",
        price: 39.9,
        image:
          "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=500",
        category: "Skincare",
        rating: 4.8,
      },
      {
        id: "m4",
        name: "Perfume Masculino",
        price: 199.9,
        image:
          "https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=500",
        category: "Perfume",
        rating: 4.9,
      },
    ],
  },
} as const;

type CategoryKey = keyof typeof categoryData;

export function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const categoryKey =
    (category as CategoryKey | undefined) ?? ("feminino" as CategoryKey);
  const data = categoryData[categoryKey] ?? categoryData.feminino;

  const subcategories = [
    "all",
    ...new Set(data.products.map((product) => product.category.toLowerCase())),
  ];
  const [filteredCategory, setFilteredCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = data.products.filter((product) =>
    filteredCategory === "all"
      ? true
      : product.category.toLowerCase() === filteredCategory,
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
      <div className={`${styles.container} ${styles.breadcrumb}`}>
        <div className={styles.breadcrumbRow}>
          <button
            onClick={() => navigate(routes.home)}
            className={styles.breadcrumbLink}
          >
            Home
          </button>
          <ChevronRight className={styles.breadcrumbIcon} />
          <span className={styles.breadcrumbActive}>{data.title}</span>
        </div>
      </div>

      <div className={`${styles.container} ${styles.headerSection}`}>
        <div className={styles.headerInner}>
          <h1 className={styles.headerTitle}>{data.title}</h1>
          <p className={styles.headerDescription}>{data.description}</p>
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
                {subcategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={filteredCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilteredCategory(cat)}
                    className={
                      filteredCategory === cat
                        ? styles.filterButtonActive
                        : styles.filterButton
                    }
                  >
                    {cat === "all" ? "Todos" : cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className={styles.sortRow}>
              <span className={styles.sortLabel}>Ordenar por:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className={styles.sortTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Em Destaque</SelectItem>
                  <SelectItem value="price-asc">Menor Preco</SelectItem>
                  <SelectItem value="price-desc">Maior Preco</SelectItem>
                  <SelectItem value="rating">Melhor Avaliacao</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={styles.resultsRow}>
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
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              rating={product.rating}
              onAddToCart={() => addItem(1)}
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
